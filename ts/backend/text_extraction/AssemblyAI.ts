import events from 'node:events';
import file_system from 'node:fs';

import axios from 'axios';
import FormData from 'form-data';

import Settings, {
    To_suffix,
    Trace
} from "../../common/Settings";

interface AssembyAI_upload_response {
    upload_url: string;
}

export interface AssembyAI_transcript_response {
    entities?: any
    id: string;
    status: string;
    text?: string;
    words?: Array<AssembyAI_word> // Il faut que la requête soit préparée en fonction...
}

export interface AssembyAI_word {
    confidence: number;
    end: number;
    speaker?: string;
    start: number;
    text: string;
}

export default class AssembyAI {
    static readonly AssembyAI_transcript_url = "https://api.assemblyai.com/v2/transcript";
    static readonly AssembyAI_upload_url = "https://api.assemblyai.com/v2/upload";
    private static readonly _AUDIO_TRANSCRIPT = "AUDIO TRANSCRIPT";
    private static readonly _AUDIO_UPLOAD = "AUDIO UPLOAD";
    static readonly _EXTRACTED_TEXT = "EXTRACTED TEXT";
    private static readonly _Intra_communication = new events.EventEmitter();

    static {
        if (Trace)
            console.assert(process.env.AssembyAI_authorization_1, "'process.env.AssembyAI_authorization_1' untrue");
        if (Trace)
            console.assert(process.env.AssembyAI_authorization_2, "'process.env.AssembyAI_authorization_2' untrue");
        if (Trace) // # En sec.
            console.assert(process.env.AssembyAI_polling_frequency, "'process.env.AssembyAI_polling_frequency' untrue");
        // Les var. 'static' doivent être initialisées avant l'initialisateur 'static' pour être accédées...
        AssembyAI._Intra_communication.on(AssembyAI._AUDIO_UPLOAD, AssembyAI._AssembyAI_step_1);
        AssembyAI._Intra_communication.on(AssembyAI._AUDIO_TRANSCRIPT, AssembyAI._AssembyAI_step_2);
    }

    static async Text_extraction(audio_file_path: string): Promise<null | string> {
        return new Promise((text_extraction) => {
            // Subscribe to resulting extracted text:
            AssembyAI._Intra_communication.on(AssembyAI._EXTRACTED_TEXT, (extracted_text: null | string) => {
                if (extracted_text === null) {
                    if (Trace)
                        console.error(`\x1b[31m\t❌ Fatal error "${Settings.Dysfonctionnement_API_AssemblyAI}"\x1b[0m`);
                    text_extraction(null);
                } else {
                    if (Trace)
                        console.log(`\x1b[32m\t✅-AssembyAI- '${audio_file_path}': "${extracted_text}"\x1b[0m`);
                    const text_file_path = To_suffix(audio_file_path, 'txt');
                    try {
                        const stream = file_system.createWriteStream(text_file_path);
                        stream.write(extracted_text);
                        stream.end();
                        text_extraction(text_file_path);
                    } catch (error: unknown) {
                        if (Trace)
                            console.error(`\x1b[31m\t❌ Fatal error "${Settings.Dysfonctionnement_API_AssemblyAI}"\x1b[0m`);
                        text_extraction(null);
                    }
                }
            });
            // Start by uploading and next chaining transcription... 
            AssembyAI._Intra_communication.emit(AssembyAI._AUDIO_UPLOAD, audio_file_path);
        });
    }

    private static async _AssembyAI_step_1(audio_file_path: string): Promise<void> {
        try {
            const upload_url = await AssembyAI._Upload_audio(audio_file_path);
            if (Trace)
                console.log(`\x1b[32m\t✅ -AssemblyAI- '${audio_file_path}' pushed... URL: ${upload_url}\x1b[0m`);
            const transcript_id = await AssembyAI._Transcript_audio(upload_url);
            if (Trace)
                console.log(`\x1b[32m\t✅ -AssemblyAI- '${audio_file_path}' transcripted... ID.: ${transcript_id}\x1b[0m`);
            AssembyAI._Intra_communication.emit(AssembyAI._AUDIO_TRANSCRIPT, transcript_id);
        } catch (error: unknown) {
            AssembyAI._Intra_communication.emit(AssembyAI._EXTRACTED_TEXT, null);
        }
    }

    private static async _AssembyAI_step_2(transcript_id: string): Promise<void> {
        const interval = setInterval(async () => {
            const response = await axios.get<AssembyAI_transcript_response>(`${AssembyAI.AssembyAI_transcript_url}/${transcript_id}`,
                {headers: {Authorization: process.env.AssembyAI_authorization_1}}
            );
            if (Trace)
                console.log(`\x1b[32m\t✅ -AssemblyAI- audio transcript status: ${response.data.status}\x1b[0m`);
            if (response.data.status === 'error') {
                clearInterval(interval);
                AssembyAI._Intra_communication.emit(AssembyAI._EXTRACTED_TEXT, null);
            }
            if (response.data.status === 'completed') {
                clearInterval(interval);
                // Resulting extracted text...
                AssembyAI._Intra_communication.emit(AssembyAI._EXTRACTED_TEXT, response.data.text);
            }
        }, Number(process.env.AssembyAI_polling_frequency) * 1000); // Toutes les 2,5 sec. environ...
    };

    // Fonction poussant l'audio ("file") chez AssemblyAI...
    private static _Upload_audio = async (audio_file_path: string): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file_system.createReadStream(audio_file_path));
        const response = await axios.post<AssembyAI_upload_response>(AssembyAI.AssembyAI_upload_url, formData, {
            headers: {
                Authorization: process.env.AssembyAI_authorization_1,
                ...formData.getHeaders(),
            },
        });
        return response.data.upload_url;
    };

    // Fonction poussant l'audio ("data") chez AssemblyAI...
    private static _Upload_audio_ = async (audio_file_path: string): Promise<string> => {
        if (!file_system.existsSync(audio_file_path))
            return Promise.reject(`\x1b[31m\t❌ Fatal error 'AssemblyAI' '${audio_file_path}' does not exist...\x1b[0m`);
        if (file_system.statSync(audio_file_path).size > Settings.Audio_file_maximal_size)
            return Promise.reject(`\x1b[31m\t❌ Fatal error 'AssemblyAI' '${audio_file_path}' too, big...\x1b[0m`);
        const response = await axios.post(AssembyAI.AssembyAI_upload_url, file_system.readFileSync(audio_file_path),
            {
                headers: {
                    Authorization: process.env.AssembyAI_authorization_2,
                    'content-type': 'application/octet-stream'
                }
            }
        );
        return response.data.upload_url;
    }

    // Fonction démarrant le transcript de l'audio chez AssemblyAI
    private static _Transcript_audio = async (upload_url: string): Promise<string> => {
        const response = await axios.post<AssembyAI_transcript_response>(AssembyAI.AssembyAI_transcript_url,
            {
                audio_url: upload_url,
                language_code: 'fr',
                speaker_labels: true
            },
            {
                headers: {Authorization: process.env.AssembyAI_authorization_1}
            }
        );
        return response.data.id;
    };

    // Fonction démarrant le transcript de l'audio chez AssemblyAI...
    private static _Transcript_audio_ = async (upload_url: string): Promise<string> => {
        const response = await axios.post<AssembyAI_transcript_response>(AssembyAI.AssembyAI_transcript_url,
            {
                audio_url: upload_url,
                language_code: 'fr',
                word_boost: [],
                punctuate: true,
                format_text: true
            },
            {
                headers: {
                    Authorization: process.env.AssembyAI_authorization_2,
                    'content-type': 'application/json',
                },
            }
        );
        return response.data.id;
    };

    // Fonction récupérant le statut du transcript de l'audio chez AssemblyAI...
    private static _Get_audio_transcript_status = async (transcript_id: string): Promise<T> => {
        const response = await axios.get<AssembyAI_transcript_response>(`$AssembyAI_transcript_url/${transcript_id}`,
            {headers: {Authorization: process.env.AssembyAI_authorization_1}}
        );
        return response.data;
    };
}
