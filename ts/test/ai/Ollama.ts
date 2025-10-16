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

/*
Ollama.Elect_as_professional_competency(Geriatrie_1).then(oui_ou_non => {     console.log(oui_ou_non + " > " + Geriatrie_1)
     console.assert(oui_ou_non === OUI_ou_NON.NON, "'oui_ou_non === OUI_ou_NON.NON' untrue");
 });
 Ollama.Elect_as_professional_competency(Geriatrie_2).then(oui_ou_non => {
     console.log(oui_ou_non + " > " + Geriatrie_2)
     console.assert(oui_ou_non === OUI_ou_NON.OUI, "'oui_ou_non === OUI_ou_NON.OUI' untrue");
 });
 /*
Ollama.Predict(Settings.FINGERPRINT, Settings.Banque_commercial_suivi_client);
 /*Ollama.Predict(Settings.FINGERPRINT, Settings.Marketing_digital);
 /*Ollama.Predict(Settings.FINGERPRINT, Settings.Soudure);
/
// ATTENDU: "NON" "NON" "OUI" "OUI"
// deepseek-r1: "OUI" "OUI" "NON" "OUI"
// llava: "NON" "NON" "NON" "NON"
// qwen3: "NON" "NON" "NON" "OUI"
//Mixtral?https://ollama.com/library/mixtral
    //RAG:// https://towardsdatascience.com/from-prototype-to-production-enhancing-llm-accuracy-791d79b0af9b/
// Meilleure customization
// https://sebastianpdw.medium.com/common-mistakes-in-local-llm-deployments-03e7d574256b
/*
Ollama.Elect_as_professional_competency("Voyons ici un exemple d'une vidéo de candidat effective.").then(oui_ou_non => {
    console.info(`\x1b[32m\t✅ ${oui_ou_non} -> "Voyons ici un exemple d'une vidéo de candidat effective."\x1b[0m`);
    Ollama.Elect_as_professional_competency("Rappelez-vous que cette vidéo n'est pas parfaite et vous devrez adapter votre vidéo à l'employeur, l'entreprise et l'industrie dans laquelle vous postulez.").then(oui_ou_non => {
        console.info(`\x1b[32m\t✅ ${oui_ou_non} -> "Rappelez-vous que cette vidéo n'est pas parfaite et vous devrez adapter votre vidéo à l'employeur, l'entreprise et l'industrie dans laquelle vous postulez."\x1b[0m`);
        Ollama.Elect_as_professional_competency("Bonjour, je m'appelle Astrid et j'aimerais postuler pour le poste de commercial pour le groupe ABC.").then(oui_ou_non => {
            console.info(`\x1b[32m\t✅ ${oui_ou_non} -> "Bonjour, je m'appelle Astrid et j'aimerais postuler pour le poste de commercial pour le groupe ABC."\x1b[0m`);
            Ollama.Elect_as_professional_competency("Je viens d'obtenir un master en  économie et gestion avec une spécialisation en marketing.").then(oui_ou_non =>
                console.info(`\x1b[32m\t✅ ${oui_ou_non} -> "Je viens d'obtenir un master en économie et gestion avec une spécialisation en marketing."\x1b[0m`));
        });
    });
});
*/
const sentences = Settings.Soudure
//.split(/(?<=\.)\s+/);

/*async function testMarketingDigital() {

    for (const sentence of sentences) {
        const oui_ou_non = await Ollama.Elect_as_professional_competency(sentence);
        console.info(`\x1b[32m\t✅ ${oui_ou_non} -> "${sentence}"\x1b[0m`);
    }
}
testMarketingDigital()
*/

const cv_text = "Bonjour, moi c'est Benjamin, j'ai 22 ans et j'habite à Rennes.\
Dans la vie, ce que j'aime, c'est la photo, l'aventure et le voyage.\
Je suis aussi un grand passionné de football et je pratique la course à pied régulièrement.\
Après mon bac, j'ai fait un BTS MUC, puis une licence responsable de centre de profit en alternance à NatureSource,\
 où j'ai pu développer mes compétences en gestion et management.\
Ensuite, j'ai été embauché en CDI dans cette même entreprise, où j'ai également fait de la communication,\
 et c'est vraiment ce qui m'intéressait le plus.\
 Suite à cette expérience, j'ai repris mes études et fait un bachelor marketing digital et communication,\
 où j'ai effectué un stage de 6 mois au sein d'une entreprise dans le domaine de l'événementiel.\
Lors de ce stage, j'ai créé un nouveau site internet sous WordPress, développé les réseaux sociaux,\
 créé de nouveaux supports de communication, mais également réalisé des études de marché.\
Je maîtrise également la mise en page avec InDesign, les retouches avec Photoshop,\
 ainsi que la création de montages vidéo avec Adobe Premiere.\
En septembre prochain, je débute un master dans le marketing et la communication\
 et recherche une entreprise qui pourra m'accueillir en contrat de professionnalisation.\
Sérieux, dynamique, curieux, créatif et surtout très motivé, j'ai envie d'apprendre encore et encore,\
 mais surtout appliquer mes connaissances sur le terrain et contribuer au développement de votre entreprise.\
Mon profil vous intéresse ? Contactez-moi !"

//const segments = Segment_CV_string(cv_text);

function isPersonalInfo(segment: string): string {
    const donneesPersos = [
        /Bonjour, je m'appelle\s+[A-ZÉÈÊÀÂÎÔÛ][a-zàâéèêîïôöùûüç-]+(?:\s+[A-Z][a-zàâéèêîïôöùûüç-]+)*/i, // prénom + nom
      // /\bje suis\b/i,
        /moi c'est\b/i,
        /\bj'ai \d{1,2} ans\b/i,          // âge
        /\b\d{10}\b/,                     // téléphone 10 chiffres
        /\b\d{2} \d{2} \d{2} \d{2} \d{2}\b/, // téléphone français
        /email/i                          // email
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
    // L'appel est fait avec 'bind' ayant pour premier paramètre 'fingerprint'
    // Attention, 'this.constructor.name === "String"'. On teste donc sur '==' et non '===' :
    console.assert(Settings.FINGERPRINT == this, "'Settings.FINGERPRINT == this' untrue");
    console.info(JSON.stringify(data));
}
function sleep(ms:number){
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function testOllama(segments:string[]) {
    const filtrerSegments=segments.map(seg=>isPersonalInfo(seg));
    const segmentsAvecIdentites:string []=[];
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

/*(async () => {
    const tousSousSegments: string[][] = [];
    for (const segment of segments) {
const sousSegments = await Ollama.decouperSegmentAvecOllama(segment);
console.log("Sous-segments détectés :", sousSegments);
        tousSousSegments.push(sousSegments);
    }
    // Affichage complet
    console.log("Sous-segments détectés pour chaque segment :");
    tousSousSegments.forEach((ss, index) => {
        console.log(`Segment ${index + 1}:`, ss);
    });
})();
/*async function predictmet(){
    const cv_text = "Bonjour, je m'appelle Astrid et j'aimerais postuler pour le poste de commercial.";
    let result;
    console.log("Contenu envoyé :", cv_text);
    result = await Ollama.Predict( SSE_message_type.JOB, cv_text);
    console.log(result);
}
predictmet();
*/
/*async function testPredict(){
    const fingerprint=Settings.fingerprint;
    const model=Ollama._LLM;
    const format="json";

    const result=await Ollama.Predict(fingerprint,segments,model,format);
    console.log(`\n Résultat complet de Predict :\n`,result);
    }/
testPredict();*/
async function  main(){
    const file=path.join(__dirname,"cv.txt");
    try{
    const segments=  await Segment_CV_text(file);
    console.log("Segments détectés :", segments);
    await testOllama(segments)

}catch (error){
    console.log(error);
    process.exit(1);
    }
}
main();