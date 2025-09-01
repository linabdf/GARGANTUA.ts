import axios from 'axios';

import AI from "./AI";
import Settings, {
    SSE_message_type,
    Trace
} from "../../common/Settings";

interface OpenAI_message {
    role: any;
    content: any;
    refusal: any;
    annotations: any
}

export default class OpenAI extends AI {
    private static readonly _API_BASE_URL = "https://api.openai.com/v1/chat/completions";
    private static readonly _Model = "gpt-4-turbo"; // https://platform.openai.com/docs/models

    static {
        if (Trace)
            console.assert(process.env.OpenAI_API_KEY_1, "'process.env.OpenAI_API_KEY_1' untrue");
        if (Trace)
            console.assert(process.env.OpenAI_API_KEY_2, "'process.env.OpenAI_API_KEY_2' untrue");
    }

    static async Predict(fingerprint: string, CV_text: string): Promise<{
        data: null | {
            forename: null | string,
            surname: null | string,
            e_mail: null | string,
            phone_number: null | string
        },
        digest: string
    }> {
        try {
            const body = {
                model: OpenAI._Model,
                messages: [
                    {
                        role: 'system',
                        content: AI._Prompt
                    },
                    {
                        role: 'user',
                        content: `« ${CV_text} »`
                    }
                ],
                temperature: 0.1, // The temperature value ranges from 0 to 2, with lower values indicating greater determinism and higher values indicating more randomness.
                max_tokens: 500
            };
            const headers = {
                Authorization: `Bearer ${process.env.OpenAI_API_KEY_1}`,
                'Content-Type': 'application/json'
            };
            const response = await axios.post(OpenAI._API_BASE_URL, body, {headers});
            // if (Trace)
            //     console.log(`\x1b[43m\t✅ Réponse ${OpenAI._Model} brute :\x1b[0m`, {
            //         id: response.data.id,
            //         choices: response.data.choices,
            //     });
            const {data} = response;
            if (!data.choices || data.choices.length === 0)
                return {
                    data: null,
                    digest: AI._Basic_response(OpenAI._Model, fingerprint, "-données absentes-")
                };
            if (Trace)
                data.choices.forEach(choice => {
                    // console.info(Object.getOwnPropertyNames(choice.message).join(" - "));
                    // Ces propriétés ont été vérifiées *UNIQUEMENT* avec les modèles "gpt-3.5-turbo" et "gpt-4-turbo"...
                    if (choice.message.content.indexOf("```json") === 0) { // Existing header and footer...
                        // Format ```json { ...données ici... } ```
                        const index = choice.message.content.indexOf("```", "```json".length);
                        const content = JSON.parse(choice.message.content.substring("```json".length, index));
                        if (Trace)
                            console.log(`\x1b[43m\t✅ Réponse ${OpenAI._Model} :\x1b[0m`, content);
                    } else if (Trace)
                        console.log(`\x1b[43m\t✅ Réponse ${OpenAI._Model} brute :\x1b[0m`, JSON.parse(choice.message.content));
                });
            /** Attention, on ne traite que le premier 'choice'... */
            if (data.choices[0].message.content.indexOf("```json") === 0) { // Existing header and footer...
                const index = data.choices[0].message.content.indexOf("```", "```json".length);
                try {
                    const content = JSON.parse(data.choices[0].message.content.substring("```json".length, index));
                    const forename = AI.Value(SSE_message_type.FORENAME, content);
                    const surname = AI.Value(SSE_message_type.SURNAME, content);
                    const e_mail = AI.Value(SSE_message_type.E_MAIL, content);
                    const phone_number = AI.Value(SSE_message_type.PHONE_NUMBER, content);
                    const competencies = AI.Value(SSE_message_type.COMPETENCY, content);
                    const jobs = AI.Value(SSE_message_type.JOB, content);
                    const localities = AI.Value(SSE_message_type.LOCALITY, content);
                    return {
                        data: {forename: forename, surname: surname, e_mail: e_mail, phone_number: phone_number},
                        digest: AI._Response(OpenAI._Model, fingerprint, forename, surname, e_mail, phone_number, competencies, jobs, localities)
                    };
                } catch (error: unknown) {
                    if (Trace)
                        console.error(`\x1b[31m\t❌ Fatal error ${OpenAI._Model}: data parsing failed (${(error as SyntaxError).message})\x1b[0m`);
                    return {
                        data: null,
                        digest: AI._Basic_response(OpenAI._Model, fingerprint, "-données non convertibles en JSON-")
                    };
                }
            } else {
                try {
                    const content: Object = JSON.parse(data.choices[0].message.content);
                    const forename = AI.Value(SSE_message_type.FORENAME, content);
                    const surname = AI.Value(SSE_message_type.SURNAME, content);
                    const e_mail = AI.Value(SSE_message_type.E_MAIL, content);
                    const phone_number = AI.Value(SSE_message_type.PHONE_NUMBER, content);
                    const competencies = AI.Value(SSE_message_type.COMPETENCY, content);
                    const jobs = AI.Value(SSE_message_type.JOB, content);
                    const localities = AI.Value(SSE_message_type.LOCALITY, content);
                    return {
                        data: {forename: forename, surname: surname, e_mail: e_mail, phone_number: phone_number},
                        digest: AI._Response(OpenAI._Model, fingerprint, forename, surname, e_mail, phone_number, competencies, jobs, localities)
                    };
                } catch (error: unknown) {
                    if (Trace)
                        console.error(`\x1b[31m\t❌ Fatal error ${OpenAI._Model}: data parsing failed (${(error as SyntaxError).message})\x1b[0m`);
                    return {
                        data: null,
                        digest: AI._Basic_response(OpenAI._Model, fingerprint, "-données non convertibles en JSON-")
                    };
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                if (Trace)
                    console.error(`\x1b[31m\t❌ Fatal error ${OpenAI._Model}: OpenAI_API_KEY non valide ou autorisation d'accès refusée\x1b[0m`);
                return {
                    data: null,
                    digest: AI._Basic_response(OpenAI._Model, fingerprint, "OpenAI_API_KEY non valide ou autorisation d'accès refusée")
                };
            }
            if (Trace)
                console.error(`\x1b[31m\t❌ Fatal error ${OpenAI._Model}: ${error}\x1b[0m`);
            return {
                data: null,
                digest: AI._Basic_response(OpenAI._Model, fingerprint, Settings.Dysfonctionnement_API_OpenAI)
            };
        }
    }
}