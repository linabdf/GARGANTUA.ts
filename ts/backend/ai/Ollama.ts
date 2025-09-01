import axios from 'axios';
import ollama from 'ollama';

import AI from "./AI";
import {SSE_message_type, Trace} from "../../common/Settings";

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

    static _Available_LLMs: string;
    /** The "GARGANTUA" LLM *MUST BE CONFIGURED* within 'Ollama' having 'temperature' parameter very close to zero
     so that answers are precise and the same from one request to another... */
    static readonly _LLM = "qwen3";

    private static readonly _Deepseek_r1 = "deepseek-r1";
    private static readonly _Llama3_3 = "llama3.3";
    private static readonly _Llava = "llava"; // Essayer "llava" avec texte et image en entrée...
    private static readonly _Mistral = "mistral";
    private static readonly _Qwen3 = "qwen3";

    static {
        // Vérifier que 'Ollama' est fonctionnel et quels sont les modèles disponibles (https://github.com/ollama/ollama/blob/main/docs/api.md#list-local-models)
        if (Trace)
            fetch(Ollama._API_URL + 'tags', {
                method: 'GET'
                // ...
            }).then(async response => {
                const text = await response.text();
                Ollama._Available_LLMs = JSON.parse(text).models.map(model => model.name).join(" - ");
                if (Trace) {
                    console.log(`\x1b[32m\t✅ Réponse 'Ollama' :\x1b[0m`, Ollama._Available_LLMs);
                    console.assert(Ollama._Available_LLMs.includes(Ollama._LLM), "'Ollama._Available_LLMs.includes(Ollama._LLM)' untrue");
                }
            }).catch(error => {
                // Arrêter l'analyse IA côté client...
                if (Trace)
                    console.error(`\x1b[31m\t❌ Fatal error ${Ollama._LLM}: ${error}\x1b[0m`);
            });
    }

    static async Predict(fingerprint: string, CV_text: string, model = Ollama._Mistral, format = "json"): Promise<string> {
        const payload = {
            format: format,
            // images: // a list of base64-encoded images for LLAVA
            model: model,
            prompt: `${AI._Prompt} « ${CV_text} »`,
            stream: false,
            options: {
                max_tokens: 1
            }
        };
        try {
            // Génération d'une réponse pour un 'prompt' donné grâce à 'generate'...
            // https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-completion
            const response = await axios.post(Ollama._API_URL + 'generate', payload);
            const content: Object = JSON.parse(response.data.response);
            if (Trace)
                console.log(`\x1b[43m\t✅ Réponse LLM brute (${model}) : ${content}\x1b[0m`);
            const forename = AI.Value(SSE_message_type.FORENAME, content);
            const surname = AI.Value(SSE_message_type.SURNAME, content);
            const e_mail = AI.Value(SSE_message_type.E_MAIL, content);
            const phone_number = AI.Value(SSE_message_type.PHONE_NUMBER, content);
            const competencies = AI.Value(SSE_message_type.COMPETENCY, content);
            const jobs = AI.Value(SSE_message_type.JOB, content);
            const localities = AI.Value(SSE_message_type.LOCALITY, content);
            return AI._Response(model, fingerprint, forename, surname, e_mail, phone_number, competencies, jobs, localities);
        } catch (error: unknown) {
            if (Trace)
                console.error(`\x1b[31m\t❌ Fatal error ${model}: data parsing failed (${(error as SyntaxError).message})\x1b[0m`);
            AI._Basic_response(model, fingerprint, "-données non convertibles en JSON-");
        }
    }

    static async Is_relevant_(segment: string, model = Ollama._LLM): Promise<OUI_ou_NON> {
        const message = {
            role: 'user',
            content: `Ce texte entre guillemets « ${segment} » fait-il référence à une compétence professionnelle ? Répondre ${OUI_ou_NON.OUI} ou ${OUI_ou_NON.NON} sans explication.`
        };
        return new Promise(async (oui_ou_non) => {
            // Enable or disable thinking: https://ollama.com/blog/thinking
            const response = await ollama.chat({model: `${model}`, messages: [message], think: false, stream: false});
            const oui = response.message.content.toUpperCase().split(OUI_ou_NON.OUI).length - 1;
            const non = response.message.content.toUpperCase().split(OUI_ou_NON.NON).length - 1;
            if (Trace)
                console.log(`\x1b[43m\n\n\t✅ Le segment de CV fait-il référence à une compétence pro. ? ${response.message.content} ("OUI" : ${oui} - "NON" : ${non})\x1b[0m`);
            // Résiduellement on répond "OUI" de manière à envoyer le segment de texte du CV à ROMEO ver. 2...
            oui_ou_non(oui > non ? OUI_ou_NON.OUI : non > oui ? OUI_ou_NON.NON : OUI_ou_NON.OUI);
        });
        // const response_ = await ollama.chat({model: `${model}`, messages: [message], stream: true});
        // for await (const token of response_)  // => 'stream: true'
        //     process.stdout.write(token.message.content); // Réponse standard de l'IA...
    }
    static async Elect_as_professional_competency(segment: string, model = Ollama._LLM): Promise<OUI_ou_NON> {
        const message = {
            role: 'user',
            content: `Ce texte entre guillemets « ${segment} » fait-il référence à une compétence professionnelle ? Répondre ${OUI_ou_NON.OUI} ou ${OUI_ou_NON.NON} sans explication.`
        };
        return new Promise(async (oui_ou_non) => {
            // Enable or disable thinking: https://ollama.com/blog/thinking
            const response = await ollama.chat({model: `${model}`, messages: [message], think: false, stream: false});
            const oui = response.message.content.toUpperCase().split(OUI_ou_NON.OUI).length - 1;
            const non = response.message.content.toUpperCase().split(OUI_ou_NON.NON).length - 1;
            if (Trace)
                console.log(`\x1b[43m\n\n\t✅ Le segment de CV fait-il référence à une compétence pro. ? ${response.message.content} ("OUI" : ${oui} - "NON" : ${non})\x1b[0m`);
            // Résiduellement on répond "OUI" de manière à envoyer le segment de texte du CV à ROMEO ver. 2...
            oui_ou_non(oui > non ? OUI_ou_NON.OUI : non > oui ? OUI_ou_NON.NON : OUI_ou_NON.OUI);
        });
        // const response_ = await ollama.chat({model: `${model}`, messages: [message], stream: true});
        // for await (const token of response_)  // => 'stream: true'
        //     process.stdout.write(token.message.content); // Réponse standard de l'IA...
    }
}