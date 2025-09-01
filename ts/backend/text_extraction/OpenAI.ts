import file_system from 'node:fs';

// https://platform.openai.com/docs/guides/speech-to-text?lang=javascript
import OpenAI, {AzureOpenAI, toFile} from 'openai';
import {zodResponseFormat} from 'openai/helpers/zod';
import type {TranscriptionSegment, TranscriptionWord} from 'openai/resources/audio/transcriptions';
import {z as zod} from 'zod';

// Create speech from text
// https://platform.openai.com/docs/api-reference/audio

import {Trace} from "../../common/Settings";

const schema = zod.object({
    metier: zod.string(),
    nom: zod.string(),
    prenom: zod.string(),
    ville: zod.string()
//    segments: z.array(z.object({start: z.number(), end: z.number()})),
});

export class OpenAI_text_extraction {
    static readonly _Clients: Array<OpenAI> = new Array;
    static readonly _AZURE_OpenAI_clients = new Array;
    // https://platform.openai.com/docs/models
    private static readonly _Transcription_models = ['gpt-4o-mini-transcribe', 'gpt-4o-transcribe'];

    static {
        try { // Les clés d'accès à l'API OpenAI (voir fichier '.env') sont testées...
            OpenAI_text_extraction._Clients.push(new OpenAI({apiKey: process.env.OpenAI_API_KEY_1}));
            // OpenAI_text_extraction._Clients.push(new OpenAI({apiKey: process.env.OpenAI_API_KEY_2}));
        } catch (error: unknown) {
            if (Trace)
                console.error(`\x1b[31m\t❌ Fatal error: ${error}\x1b[0m`);
        }

        try { // Les clés d'accès à l'API AZURE OpenAI (voir fichier '.env') sont testées...
            OpenAI_text_extraction._AZURE_OpenAI_clients.push(new AzureOpenAI({
                apiKey: process.env.AZURE_OPENAI_API_KEY_1,
                deployment: 'gpt-4o',
                apiVersion: "2024-10-21",
                // A creuser : lieu de récupération des données ?
                // https://learn.microsoft.com/en-us/azure/ai-foundry/openai/reference#chat-completions
                endpoint: "https://alexandria.openai.azure.com/",
            }));
        } catch (error: unknown) {
            if (Trace)
                console.error(`\x1b[31m\t❌ Fatal error: ${error}\x1b[0m`);
        }
    }

    static async Text_extraction(audio_file_path: string): Promise<null | string> {
        if (OpenAI_text_extraction._Clients.length === 0) // No API access...
            return Promise.resolve(null);
        const client = OpenAI_text_extraction._Clients[Math.floor(Math.random() * OpenAI_text_extraction._Clients.length)];

        // Basse qualité : " Je vous remercie de l'attention que ME PORTERA ma candidature et espère vous rencontrer bientôt."
        // client.audio.transcriptions.create({
        //     file: file_system.createReadStream(audio_file_path),
        //     model: 'whisper-1',
        //     // https://platform.openai.com/docs/guides/speech-to-text#timestamps
        //     response_format: 'verbose_json', // Only supports 'whisper-1'...
        //     timestamp_granularities: ['segment'] // Alternatives: 'word'...
        // }).then(transcription => {
        //     transcription.segments.forEach((segment: TranscriptionSegment) => console.log(segment));
        // }).catch(error => {
        //     if (Trace)
        //         console.error(`\x1b[31m\t❌ Text extraction from '${audio_file_path}' failed: ${error}\x1b[0m`);
        // });

        // Haute qualité : " Je vous remercie de l'attention que vous porterez à ma candidature et j'espère vous rencontrer bientôt."
        return new Promise(transcripted => {
            client.audio.transcriptions.create({
                file: file_system.createReadStream(audio_file_path),
                model: OpenAI_text_extraction._Transcription_models[0],
                // response_format: "text", // Otherwise {text: "Bla Bla Bla..."},
                response_format: 'json'
            }).then(transcription => {
                if (Trace)
                    console.assert(transcription._request_id, "'transcription._request_id' untrue");
                if (Trace)
                    console.log(`\x1b[32m\t✅ Text extraction from '${audio_file_path}' succeeded: ${transcription.text}\x1b[0m`);
                transcripted(transcription.text);
            }).catch(error => {
                if (Trace)
                    console.error(`\x1b[31m\t❌ Text extraction from '${audio_file_path}' failed: ${error}\x1b[0m`);
                transcripted(null);
            });
        });

        // await OpenAI_text_extraction._Clients[0].files.create({
        //     file: file_system.createReadStream(audio_file_path),
        //     purpose: 'fine-tune'
        // });
        //
        // // Or if you have the web `File` API you can pass a `File` instance:
        // await OpenAI_text_extraction._Clients[0].files.create({
        //     file: new File(['my bytes'], audio_file_path),
        //     purpose: 'fine-tune'
        // });
        //
        // //
        // await OpenAI_text_extraction._Clients[0].files.create({
        //     file: await fetch('https://somesite/input.jsonl'),
        //     purpose: 'fine-tune'
        // });
        //
        // // `toFile` helper:
        // await OpenAI_text_extraction._Clients[0].files.create({
        //     file: await toFile(Buffer.from('my bytes'), audio_file_path),
        //     purpose: 'fine-tune',
        // });

        // await OpenAI_text_extraction._Clients[0].files.create({
        //     file: await toFile(new Uint8Array([0, 1, 2]), 'input.jsonl'),
        //     purpose: 'fine-tune',
        // });
    }

    static async Get_data(transcription: string, job = "Chargé de clientèle bancaire", place = "Pau"): Promise<null | string> {
        if (OpenAI_text_extraction._AZURE_OpenAI_clients.length === 0) // No API access...
            return Promise.resolve(null);
        const client = OpenAI_text_extraction._AZURE_OpenAI_clients[Math.floor(Math.random() * OpenAI_text_extraction._AZURE_OpenAI_clients.length)];
        const completion = await client.beta.chat.completions.parse({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content:
                        "Vous êtes un recruteur à la recherche d'un " + job + " à " + place + ". Vous avez reçu une candidature et vous souhaitez l'évaluer." +
                        " A l'aide de la transcription qui suit, extraire le prénom et le nom du candidat en recherche d'emploi." +
                        " Renseigner 'inconnu' si le prénom ou le nom n'est pas mentionné." +
                        " A l'aide de la transcription qui suit, extraire le métier et la ville du candidat en recherche d'emploi." +
                        " Une région, un départment ou un pays est considéré comme une ville si la ville n'est pas explicitement mentionnée." +
                        " Renseigner 'inconnu' si le métier ou la ville n'est pas mentionné(e)."
                },
                {
                    role: "user",
                    content: transcription
                }
            ],
            response_format: zodResponseFormat(schema, "extractJobCity")
        });
        if (!completion.choices[0].message.parsed)
            return Promise.resolve(null);
        return Promise.resolve(completion.choices[0].message.parsed);
    }
}
