import path from 'node:path';

import {AssemblyAI, Transcript} from "assemblyai";

import Settings, {Trace} from "../../common/Settings";

class AI21 {
    private static readonly _AI21_url = "https://api.ai21.com/studio/v1/chat/completions";
    private static _AssemblyAI_API: AssemblyAI;

    static {
        // Les var. 'static' doivent être initialisées avant (i.e., juste ci-avant)
        if (Trace)
            console.log("Test '.env' : " + process.env.AssembyAI_authorization_2);
        AI21._AssemblyAI_API = new AssemblyAI({
            apiKey: `${process.env.AssembyAI_authorization_2}`,
        });
    }

    private static async _Text_extration(audio_file_path: string): Promise<Transcript> {
        if (Trace)
            console.log(`Transcript audio démarré '${audio_file_path}'`);
        try {
            const data = {
                audio: path.resolve(audio_file_path),
                language_code: "fr",
                speaker_labels: true
            };
            const transcript = await AI21._AssemblyAI_API.transcripts.transcribe(data);
            if (Trace)
                console.log(`Transcript audio achevé : "${transcript.text}"`);
            if (!Array.isArray(transcript.words) || transcript.words.length === 0)
                if (Trace)
                    console.error("Erreur : ", AI21._AssemblyAI_API);
            transcript.words.forEach(world => console.log(`\t\t- "${world.text}" "${world.confidence}"`));
            return transcript;
        } catch (error: unknown) {
            if (Trace)
                console.error("Erreur : ", AI21._AssemblyAI_API);
        }
    }

    static async Test(audio_file_path: string): Promise<void> {
        const transcript = await AI21._Text_extration(audio_file_path);
        const prompt = `Extraire de la phrase « ${transcript.text} » les compétences et les lieux.
les timescode de chaque mot sont "${JSON.stringify(transcript.words, null, 1)}" // 1 espace de sép. est ajouté...

Format de sortie souhaité (en JSON sans commentaire) :
{
  "prenom" : "prenom",
  "nom": "nom",
  "age": INT,
  "disponible sur": ["lieu 1", "lieu 2", "lieu X"],
  "compétences": ["compétence 1", "compétence 2", "compétence X"],
  "niveau_de_francais_oral": INT
  "timecodeImportants" : [{"texte": "Info", "start" = XXXXX, "end"=XXXXX}, {"texte": "Info", "start" = XXXXX, "end"=XXXXX}...]
}

Les compétences sont des actions que je sais faire comme par exemple "fabriquer du pain", "cuisiner une pizza", etc.
"disponible sur" est le lieu où j'habite, ainsi que les lieux sur lesquels je suis mobile.
"niveau_de_francais_oral" est une note que tu attribues entre 0 et 100 sur le niveau de français oral de la personne selon le vocabulaire et la construction des phrases.
"timecodeImportants" est un tableau des informations importantes condensées. N'oublie aucune compétence ni aucun lieu. [{"texte": "Franck Barbier", "start" = XXXXX, "end"=XXXXX}, {"texte": "60ans", "start" = XXXXX, "end"=XXXXX}, {"texte": "disponible sur Paris", "start" = XXXXX, "end"=XXXXX}, {"texte": "jusqu'à la rochelle", "start" = XXXXX, "end"=XXXXX}, {"texte": "soudure à l'arc éléctrique", "start" = XXXXX, "end"=XXXXX}, {"texte": "html", "start" = XXXXX, "end"=XXXXX}]

Si un champ n'existe pas, laisse le vide...`;
        const response = await fetch(AI21._AI21_url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.AI21_authorization}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": 'jamba-1.5-large',
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "documents": [],
                "tools": [],
                "n": 1,
                "max_tokens": 2048,
                "temperature": 0.4,
                "top_p": 1,
                "stop": [],
                "response_format": {"type": "text"},
            }),
        });
        const data = await response.json();
        if (!data.choices || data.choices.length === 0) {
            if (Trace)
                console.error("Aucune réponse valide reçue d'AI21", data);
        } else if (Trace)
            console.log(JSON.stringify(data.choices[0].message.content));
    }
}

AI21.Test(Settings.Banque_commercial_suivi_client_mp3);
