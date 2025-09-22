import Settings from "../../common/Settings";
import Ollama, {OUI_ou_NON} from "../../backend/ai/Ollama";
import {Segment_CV_text,Segment_CV_string} from '../../backend/Server_settings'
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
Ollama.Predict(Settings.FINGERPRINT, Settings.Banque_commercial_suivi_client);*/
 Ollama.Predict(Settings.FINGERPRINT, Settings.Marketing_digital);
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

const cv_text ="Voyons ici un exemple d'une vidéo de candidat effective.\
                Rappelez-vous que cette vidéo n'est pas parfaite et vous devrez adapter votre vidéo à l'employeur,\
                 l'entreprise et l'industrie dans laquelle vous postulez.\
                Bonjour, je m'appelle Astrid et j'aimerais postuler pour le poste de commercial pour le groupe ABC.\
                Je viens d'obtenir un m en économie et gestion avec une spécialisation en marketing.\
                Ma première expérience professionnelle a eu lieu dans le domaine bancaire\
                 où j'ai participé à l'élaboration et la mise en place d'une nouvelle stratégie\
                 pour améliorer la qualité de suivi des meilleurs clients.\
                Ce qui m'interpelle le plus dans le poste que vous proposez\
                 est qu'il me permettrait de mettre à profit mes compétences et mon expérience\
                 dans un domaine qui me plaît et dans lequel je me projette sur le long terme.\
                De plus, la qualité de l'écoute client et la détermination du groupe ABC\
                 à privilégier l'évolution de ses collaborateurs me séduit tout particulièrement.\
                Mon expérience unique dans le domaine bancaire, mon orientation client\
                 et ma parfaite maîtrise Excel font de moi une candidate idéale\
                 pour le poste que vous proposez.\
                Pour finir, j'aimerais mettre mon enthousiasme, mon énergie\
                 et mon goût pour réussir de nouveaux challenges au profit d'un travail d'équipe.\
                Je vous remercie de l'attention que vous porterez à ma candidature\
                 et espère vous rencontrer bientôt.";
const segments = Segment_CV_string(cv_text);
console.log(segments);

async function testOllama() {



  for (const seg of segments) {
    const oui_ou_non = await Ollama.Elect_as_professional_competency(seg);
    console.info(`\x1b[32m\t✅ ${oui_ou_non} -> "${seg}"\x1b[0m`);

}
}
testOllama();