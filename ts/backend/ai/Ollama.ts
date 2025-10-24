import axios from 'axios';
import ollama from 'ollama';
import AI from "./AI";
import {SSE_message_type, Trace} from "../../common/Settings";
import {resolve} from "node:dns";
import {SentimentAnalysisResult} from "assemblyai";
import {string} from "zod";
enum Done_reason {
    Stop = 'stop'
}

interface Ollama_data {
    model: string,
    created_at: string,
    response: string,
    done: boolean,
    done_reason: Done_reason,
    context: Array<number>,
    total_duration: number,
    load_duration: number,
    prompt_eval_count: number,
    prompt_eval_duration: number,
    eval_count: number,
    eval_duration: number
}

export enum OUI_ou_NON {
    OUI = "OUI",
    NON = "NON"
}
type LLMResponse={segment:string[];
    status:"OUI"| "NON";};

/** Windows */
// $BODY = @{
//     model = 'mistral:latest'
//     prompt = 'Ca va ? Respond using JSON'
//     format = 'json'
//     stream = $false
// }|ConvertTo-Json
// Invoke-WebRequest -Uri http://localhost:11434/api/generate -Method POST -Body $BODY

// https://github.com/ollama/ollama/blob/main/docs/api.md
export default class Ollama extends AI {
    private static readonly _API_URL = "http://127.0.0.1:11434/api/";
// sera replie avec les modeles  installés localement

    static _Available_LLMs: string;
    /** The "GARGANTUA" LLM *MUST BE CONFIGURED* within 'Ollama' having 'temperature' parameter very close to zero
     so that answers are precise and the same from one request to another... */
    static readonly _LLM = "qwen3"; // "gargantua"; // "mistral"; // "llama3.3"; // "deepseek-r1"; // "qwen3"; // "gargantua"; // "mistral"; // "llama3.3"; // "deepseek-r1";

    private static readonly _Deepseek_r1 = "deepseek-r1";
    private static readonly _Llama3_3 = "llama3.3";
    private static readonly _Llava = "llava"; // Essayer "llava" avec texte et image en entrée...
    private static readonly _Mistral = "mistral";
    private static readonly _Qwen3 = "qwen3";

    static {
        // Vérifier que 'Ollama' est fonctionnel et quels sont les modèles disponibles (https://github.com/ollama/ollama/blob/main/docs/api.md#list-local-models)
        if (Trace)
            //récupére la liste  des modéles instalés
            fetch(Ollama._API_URL + 'tags', {
                method: 'GET'
                // ...
            }).then(async response => {
                //Récupérer  Corps  de la  reponse  JSON
                const data = await response.json();
                Ollama._Available_LLMs =  data.models.map((model :any)=> model.name).join(" - ");
                //verifier si  le qwen3 est bien installé
                if (Trace) {
                    //    console.log(`\x1b[32m\t✅ Réponse 'Ollama' :\x1b[0m`, Ollama._Available_LLMs);
                    console.assert(Ollama._Available_LLMs.includes(Ollama._LLM), "'Ollama._Available_LLMs.includes(Ollama._LLM)' untrue");
                }
            }).catch(error => {
                // Arrêter l'analyse IA côté client...
                if (Trace)
                    console.error(`\x1b[31m\t❌ Fatal error ${Ollama._LLM}: ${error}\x1b[0m`);
            });
    }




    // ca on la juste bricoler pour faire marcher le projet
    static async Elect_as_professional_competency(segment: string, model = Ollama._LLM): Promise<LLMResponse> {
        const keywords= ["compétence","expérience","compétences","qualification","qualifications","savoir-faire","expertise","aptitude","aptitudes","capacité","capacités","skill","skills","poste","postuler"];

        /*let reponseLLM=""
      */const message = {
            role: 'user',
            content: `
           un es un assistant qui analyse des segments de CV.
           *objectif*
            Déterminer si un segment contient des informations professionnelles pertinentes comme:
          ⚠️ Important 
           Les segments qui ne contiennent *aucune information professionnelle identifiable* (ex. : “De plus”, “Enfin”, “Pour finir”, “Ainsi”, “En conclusion”, “Cependant”, etc.)
           doivent être considérés comme *NON*
          ⚠️ PRIORITÉ 1 : RÈGLE D’EXCLUSION
           - Si le segment contient uniquement des mentions vagues et non descriptives
           telles que :
           "mes compétences", "mon expérience", "mes atouts", "mon potentiel"
           **ou toute expression similaire** (par exemple : “mes qualités”, “mes acquis”, “mon savoir-faire”, “mes points forts”, “mon profil”, “mes connaissances”, “mes aptitudes”, “mes capacités”, etc.)
           ET qu’il ne contient AUCUNE mention d’un poste, d’un domaine, d’un savoir-faire, d’un outil ou d’une activité professionnelle identifiable,
           → alors renvoie immédiatement NON.
          
           Règles strictes :
             1. Si le segment contient :
              -Toute mention d’un outil ou logiciel bureautique (ex. :  Word, Google Docs, etc.) est considérée comme une compétence technique, même dans une formulation courte ou partielle. Dans ce cas, le segment est immédiatement considéré comme valide, et le reste du segment est ignoré.
              - un savoir-faire, un hard skill (ex: developpement web, gestion de projet, marketing digital, analyse de données, communication interpersonnelle, leadership, résolution de problèmes, etc.)
              - la personne parle d'un poste ou d'un emploi par exemple : "j'aimerais postuler pour", "je souhaite occuper le poste de...", "je suis développeur ..."
              - une expérience professionnelle (même courte ou dans un domaine différent)
              - Les intentions d’amélioration sont acceptées uniquement si elles sont contextualisées :
                elles doivent mentionner une activité, mission ou domaine identifiable (ex : gestion des appels, suivi des clients, communication, production…)
              - Un savoir-être ou soft skill identifiable  
                → Il s’agit de toute expression qui décrit une qualité personnelle, un comportement professionnel ou une attitude utile dans le travail.
                → Ces qualités sont acceptées même seules, car elles représentent des compétences transférables.
                → Exemples (liste non exhaustive) :
                  “mon goût pour le travail d’équipe”.
                  ⚠️ Le modèle doit généraliser à d'autres soft skills similaires, même s'ils ne sont pas cités dans les exemples données.  
                Par exemple : rigueur, adaptabilité, autonomie, sens du relationnel, empathie, curiosité, motivation, créativité, écoute, patience, fiabilité, etc.
                → En résumé : si le segment exprime une qualité comportementale ou relationnelle valorisée professionnellement
             
              - Toute action ou mission professionnelle identifiable (ex. : “crée des supports de communication”) est considérée comme un savoir-faire, même sans sujet explicite
              - Toute mention explicite d’un diplôme ou d’une formation identifiable (ex. : BTS, DUT, licence, bachelor, master, certification…) est acceptée, quelle que soit la formulation du segment.  
                Cela inclut les phrases complètes, les fragments, les énumérations, ou les formulations sans verbe ni sujet.
              - Les verbes d’action  sont considérés comme des indicateurs de savoir-faire ou de compétence si le segment mentionne une activité professionnelle identifiable.
              - Les intentions professionnelles sont acceptées si elles sont rattachées à un poste, une mission ou un domaine identifiable. Les formulations vagues comme “dans un domaine qui me plaît” ou “où je me projette” sont rejetées si elles ne précisent aucun contenu professionnel.
              -un savoir-etre ou soft skill (ex: communication, travail en équipe, gestion du temps, adaptabilité, créativité, esprit critique, etc.).
            renvoie uniquement OUI
            2. Sinon , renvoie  uniquement NON
            3. Ne renvoie rien d’autre que OUI ou NON
            4. Chaque segment est traité individuellement.
           
           Exemples:
             - "Je maîtrise Java et Python." → OUI  
             - "Je viens d'obtenir une licence en informatique " → OUI  
             - "je veux améliorer mes compétences en communication." → OUI
             - "je veux acquérir de l'expérience en gestion de projet." → OUI
             - "je veux acquérir de l'expérience." → NON
             - "J'aimerais postuler pour le poste ..." → OUI  
             - "J'aime la lecture et les voyages." → NON 
             - Pendant mon stage, j'ai appris à travailler en équipe." → OUI
             - dans le but de renforcer mes compétences en gestion du temps. → OUI
             -"améliorer mes compétences." → NON
             -"ma relation client" → OUI , vu que c'est un savoir etre pro
             
Segment : « ${segment} »`
        };
        /*    const response=await ollama.complete({model,message:[message],max_tokens:50});
            r
     */
        // vu qu'on est dans une promesse on peut faire un return
        return new Promise(async (resolve) => {
            // Enable or disable thinking: https://ollama.com/blog/thinking
            const response = await ollama.chat({model: `${model}`, messages: [message], think: false, stream: false});
            //console.log("reponse de ollama",response);

            let reponseLLM=(response.message.content||"").trim();
            reponseLLM=reponseLLM.replace(/[.?!]$/,"");
            const result={
                segment:segment,
                response: reponseLLM==="OUI"? "OUI":"NON"
            }
            if (result.response==="OUI") {
                resolve(segment );
                console.log("\x1b[32m%s\x1b[0m", `segment : ${segment}`);

                return;
            }else {
                console.log("\x1b[31m%s\x1b[0m", `❌ Segment rejeté: ${segment}`);
                resolve("NON" as LLMResponse);
                return;


            }
        });

    }


}