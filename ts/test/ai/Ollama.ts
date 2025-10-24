import Settings, {SSE_message_type} from "../../common/Settings";
import Ollama, {OUI_ou_NON} from "../../backend/ai/Ollama";
import {Segment_CV_string,Segment_CV_text} from '../../backend/Server_settings'
import ROMEO_V2, {GARGANTUA_competency_datum} from "../../backend/francetravail.io/ROMEO_V2";
import path from "path";
import ollama from "ollama";
// L'API ROMEO ver. 2 retourne '✅ Compétence : "Barman" 0.745' et '✅ Compétence : "BP barman" 0.724' sur la base de la phrase 'Geriatrie_1'.
// L'idée est de ne pas envoyer cette phrase à l'API grâce au LLM qui va nous dire que la phrase
// ne fait *AUCUNEMENT* référence à des compétences professionnelles...
const Geriatrie_1 = "Bonjour, je m'appelle Franck Barbier.";
// On doit obtenir le résultat inverse pour la phrase 'Geriatrie_2'...
const Geriatrie_2 = "Je suis infirmier spécialiste en gériatrie et je recherche un emploi dans un hôpital ou une clinique autour de Mont-de-Marsan dans les Landes.";


function isPersonalInfo(segment: string): string {
    const donneesPersos = [
        /Bonjour, je m'appelle\s+[A-ZÉÈÊÀÂÎÔÛ][a-zàâéèêîïôöùûüç-]+(?:\s+[A-Z][a-zàâéèêîïôöùûüç-]+)*/i, // prénom + nom
      // /\bje suis\b/i,
        /moi c'est\b/i,
        /\bj'ai \d{1,2} ans\b/i,          // âge
        /\b\d{10}\b/,                     // téléphone 10 chiffres
        /\b\d{2} \d{2} \d{2} \d{2} \d{2}\b/, // téléphone français
        /email/i,
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
        /\bje suis mobile\b/i,
        /\bmobilité\b/i,
        /\bje peux me déplacer\b/i,
        /\bj['’]op[eè]re\b(?:\s+(dans|autour de|aux alentours de|vers|proche de|près de|seul[e]?|aussi|principalement|sur|à))?(?:\s+[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ][a-zàâäéèêëîïôöùûüç'-]*)*/i,
        /\bj'habite à\b/i,
        /\bj'habite\b/i,
        /\bdans les environs de\b/i,
        /\bdans la région de\b/i,
        /\bsur toute la france\b/i,
        /\bdisponible pour déplacement\b/i,
        /\bdisponible pour des déplacements\b/i,
        /\b numéro de téléphone est\b/i,
        /\bmon adresse mail est\b/i,
        /\b mail est\b/i

    ];
    let cleaned=segment;
    for(const s of donneesPersos){
        cleaned=cleaned.replace(s,'').trim();
    }
    cleaned=cleaned.replace(/^(,|et|ou|)\s+/i, '');


    return  cleaned
}

//console.log("Segments avant filtrage des informations personnelles :");
//console.log(filtrerSegments);
//console.log("Segments apres filtrage des informations personnelles :");
function ROME0_V2_call_back(this: string, data: Array<GARGANTUA_competency_datum>) {
    console.assert(Settings.FINGERPRINT == this, "'Settings.FINGERPRINT == this' untrue");
    console.info(JSON.stringify(data));
}
function sleep(ms:number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function testOllama(segments:string[]) : Promise<string[]> {
    const filtrerSegments=segments.map(seg=>isPersonalInfo(seg));
    const segmentsAvecCompetences:string[]=[];
    for (const seg of filtrerSegments) {
        const segLower = seg.toLowerCase();
        const oui_ou_non = await Ollama.Elect_as_professional_competency(seg);
      //  console.info(`\x1b[32m\t✅ ${oui_ou_non} -> "${seg}"\x1b[0m`);
  //       console.log("compétences",oui_ou_non);
        if(oui_ou_non !== "NON") {
          //  console.log(`${oui_ou_non}-> "${seg}"`);
            segmentsAvecCompetences.push(seg);
        }
    }
    console.log(`\nSegments identifiés comme compétences professionnelles:`);
  //  console.log(segmentsAvecCompetences);
    for(const seg of segmentsAvecCompetences){
    if(segmentsAvecCompetences.length>0){
        const competencies = ROMEO_V2.Predict_competencies(ROME0_V2_call_back.bind(Settings.FINGERPRINT), [seg]);
    //   console.log("compétence envoyée à ROMEO ver. 2 :",seg);
        competencies.then((competencies) => {
            if (competencies === null)
                console.log(`\x1b[31m\t\t❌ Si 'null' alors problème avec 'token'\x1b[0m`);
        });
        await sleep(500);
    }
    }
    return segmentsAvecCompetences;
}


async function processCV(fileName): Promise<void> {
    const file = path.join(__dirname, fileName);
    try {
        const segments = await Segment_CV_text(file);
        console.log(`\n📄 Segments détectés dans ${fileName}:`, segments);
        await testOllama(segments);
        console.log(`✅ Traitement terminé pour ${fileName}`);
    } catch (error) {
        console.error(`❌ Erreur pendant le traitement de ${fileName}:`, error);
    }
}

// --- liste des CV à traiter ---
const cvFiles :string[]= ["cv.txt","cv1.txt", "cv2.txt","cv3.txt"];
async function runAllCVs():Promise<void> {
    for (const file of cvFiles) {
        await processCV(file);
    }
    console.log("\n🎉 Tous les CV ont été traités !");
}

runAllCVs();
