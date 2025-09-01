import axios from 'axios';
import dotenv from 'dotenv'; // Utile uniquement pour Node.js 18 car option '--env-file=.env' absente...

import Settings, {Trace} from "../../common/Settings";

export enum France_Travail_IO_type_competence {
    COMPETENCE_DETAILLEE = "COMPETENCE-DETAILLEE",
    MACRO_SAVOIR_FAIRE = "MACRO-SAVOIR-FAIRE",
    SAVOIR = "SAVOIR"
}
// UNE COMPÉTENCE EXTRAITE DU CV
export interface ROMEO_V2_competence {
    codeCompetence: string;
    libelleCompetence: string;
    scorePrediction: number;
    typeCompetence: France_Travail_IO_type_competence;
}
// SEGMENT DE CV + SES compétences
export interface GARGANTUA_competency_datum { // Format for preparing transfer from server to client...
    CV_text_segment: string;
    competencies: Array<ROMEO_V2_competence>;
}

export type GARGANTUA_competency_data = Array<GARGANTUA_competency_datum>;
//Métier avec score prédiction
export interface ROMEO_V2_metier {

    codeAppellation: string;
    codeRome: string;
    libelleAppellation: string;
    scorePrediction: number;
}
//compétences + métiers associés
export interface GARGANTUA_job_datum { // Format for preparing transfer from server to client...
    competencies: Array<ROMEO_V2_competence>;
    jobs: Array<ROMEO_V2_metier>;
}
export type GARGANTUA_job_data = Array<GARGANTUA_job_datum>;
//token OAuth2 pour authentification
export interface ROMEO_V2_access_token {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: 'Bearer';
}

interface Reponse_competence {
    competencesRome: Array<ROMEO_V2_competence>;
    identifiant: string;
    intitule: string; // Texte initial soumis...
    uuidInference: string;
}

interface Reponse_metier {
    contexte: string; // "B--Di"
    identifiant: string; // Identifiant initial soumis
    intitule: string; // Intitulé initial soumis
    metiersRome: Array<ROMEO_V2_metier>;
    uuidInference: string;
}

export default class ROMEO_V2 {

    private static readonly _API_BASE_URL = "https://api.francetravail.io/partenaire/romeo/v2";
    private static readonly _TOKEN_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire";
    //seuil  minimal pour accepter une compétence  ou  un métier
    private static readonly _Prediction_threshold_score = 0.85;
    // nombre  des résultats a retourner par défaut
    private static readonly _Result_number = 2;
    private static readonly _Scope = "api_romeov2";
    // Fonction utilitaire pour introduire un délai d'au moins 1 sec.
    static Delay(milliseconds = 1500): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    static {
        dotenv.config(); // Utile uniquement pour Node.js 18 car option '--env-file=.env' absente...
        if (Trace)
            console.assert(process.env.ROMEO_V2_CLIENT_ID && process.env.ROMEO_V2_CLIENT_SECRET && process.env.ROMEO_V2_CLIENT_ID_2 && process.env.ROMEO_V2_CLIENT_SECRET_2,
                "'process.env.ROMEO_V2_CLIENT_ID && process.env.ROMEO_V2_CLIENT_SECRET && process.env.ROMEO_V2_CLIENT_ID_2 && process.env.ROMEO_V2_CLIENT_SECRET_2' untrue");
        console.log(process.env.ROMEO_V2_CLIENT_ID, process.env.ROMEO_V2_CLIENT_SECRET,process.env.ROMEO_V2_CLIENT_ID_2, process.env.ROMEO_V2_CLIENT_SECRET_2);

    }

    private static async _Get_token(): Promise<null | string> {
        try {
            const response = await axios.post<ROMEO_V2_access_token>(ROMEO_V2._TOKEN_URL,
                new URLSearchParams({
                    client_id: process.env.ROMEO_V2_CLIENT_ID!,
                    client_secret: process.env.ROMEO_V2_CLIENT_SECRET!,
                    grant_type: 'client_credentials',
                    scope: ROMEO_V2._Scope
                }),
                {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                }
            );
            console.log(`\x1b[32m\t🔑 'token' reçu...\x1b[0m`);
            return response.data.access_token;
        } catch (error: unknown) {
            console.error(`\x1b[31m\t❌ Erreur 'token' non reçu :\x1b[0m`, ROMEO_V2._TOKEN_URL);
            return null;
        }
    }

    // Récupération 'token' avec un autre compte...
    static async _Get_token_2(): Promise<null | string> {
        const body = new URLSearchParams({
            client_id: process.env.ROMEO_V2_CLIENT_ID_2!,
            client_secret: process.env.ROMEO_V2_CLIENT_SECRET_2!,
            grant_type: 'client_credentials',
            scope: ROMEO_V2._Scope
        });
        const response = await fetch(ROMEO_V2._TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body
        });
        if (!response.ok) {
            // const error = await response.text();
            console.error(`\x1b[31m\t❌ Erreur 'token' non reçu :\x1b[0m`, ROMEO_V2._TOKEN_URL);
            return null;
        }
        const result = await response.json() as { access_token: string };
        return result.access_token;
    }
// RETOURNE  LA LISTE  DES COMPETENCES POUR CE SEGEMENT
    private static async _Lookup_competencies(token: string, CV_text_segment: string): never | Promise<Array<GARGANTUA_competency_datum>> {
        const options = {
            data: JSON.stringify({
                competences: [
                    {
                        identifiant: Date.now().toString(),
                        intitule: CV_text_segment
                    }
                ],
                options: {
                    nbResultats: ROMEO_V2._Result_number,
                    nomAppelant: Settings.FINGERPRINT,
                    seuilScorePrediction: ROMEO_V2._Prediction_threshold_score
                }
            }),
            headers: {
                Accept: 'application/json; charset=utf-8, application/json',
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json; charset=utf-8'
            },
            method: 'POST',
            url: `${ROMEO_V2._API_BASE_URL}/predictionCompetences`
        };
        try {
            const response = await axios.request(options);
            const data: Array<Reponse_competence> = response.data as Array<Reponse_competence>;
            if (!Array.isArray(data) || data.length !== 1)
                throw new Error("'_Lookup_competencies': réponse API ROMEO V2 non exploitable");
            // if (Trace) {
            //     console.log(`\x1b[33m\t🔍 -> "${CV_text_segment}"\x1b[0m`);
            //     if (data[0].competencesRome.length === 0)
            //         console.log(`\x1b[33m\t\t🔍 -> ABSENCE DE COMPéTENCE\x1b[0m`);
            //     data[0].competencesRome.forEach(competence =>
            //         console.log(`\x1b[33m\t\t🔍 -> "${competence.libelleCompetence}" "${competence.codeCompetence}"\x1b[0m`));
            // }

            //console.log(data);
            // On retourne un tableau de segments de CV avec leurs compétences associées...dans l'affichage
            return new Array({CV_text_segment: CV_text_segment, competencies:data[0].competencesRome});
        } catch (error: unknown) {
            if (Trace)
                console.error(`\x1b[31m\t❌ Erreur recherche compétences "${CV_text_segment}"\x1b[0m`, error);
            throw error;
        }
    }
//
    static async Predict_competencies(ROME0_V2_competency_data_call_back: (data: Array<GARGANTUA_competency_datum>) => void, CV_text_segments: Array<string>): Promise<null | void> {
        try {
            const token = await ROMEO_V2._Get_token();


            if (token === null)
                return Promise.resolve(null);
            for (const segment of CV_text_segments) {
                try {
                    const data: Array<GARGANTUA_competency_datum> = await ROMEO_V2._Lookup_competencies(token, segment);
                    ROME0_V2_competency_data_call_back(data);
                    await ROMEO_V2.Delay(); // l'API ROMEO V2 demande un délai entre 2 requêtes...
                } catch (error: unknown) {
                    if (Trace)
                        console.error(`\x1b[31m\t❌ Erreur prédiction compétences "${segment}"\x1b[0m`, error);
                    ROME0_V2_competency_data_call_back([{
                        CV_text_segment: `❌ Erreur prédiction compétences "${segment}"`,
                        competencies: []
                    }]);
                }
            }
        } catch (error: unknown) {
            if (Trace)
                console.error(`\x1b[31m\t❌ Erreur prédiction compétences\x1b[0m`, error);
            ROME0_V2_competency_data_call_back([{
                CV_text_segment: `❌ Erreur prédiction compétences`,
                competencies: []
            }]);
        }
    }
// Predire les jobs
    static async Predict_jobs(ROME0_V2_job_data_call_back: (data: Array<GARGANTUA_job_datum>) => void, competences: Array<ROMEO_V2_competence>): Promise<null | void> {
        await ROMEO_V2.Delay(); // l'API ROMEO ver. 2 demande un délai entre 2 requêtes...
        try {
            const token = await ROMEO_V2._Get_token_2();
            if (token === null)
                return Promise.resolve(null);
            const options = {
                method: 'POST',
                url: `${ROMEO_V2._API_BASE_URL}/predictionMetiers`,
                headers: {
                    Accept: 'application/json; charset=utf-8, application/json',
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: JSON.stringify({
                    appellations: competences.map((competence) => ({
                        contexte: Settings.FINGERPRINT,
                        identifiant: competence.codeCompetence,
                        intitule: competence.libelleCompetence
                    })),
                    options: {
                        nbResultats: ROMEO_V2._Result_number,
                        nomAppelant: Settings.FINGERPRINT,
                        seuilScorePrediction: ROMEO_V2._Prediction_threshold_score
                    }
                })
            };
            const response = await axios.request(options);
            const data: Array<Reponse_metier> = response.data as Array<Reponse_metier>;
            if (!Array.isArray(data) || data.length === 0) {
                if (Trace)
                    console.error(`\x1b[31m\t❌ 'Predict_jobs': réponse API ROMEO V2 non exploitable\x1b[0m`);
                ROME0_V2_job_data_call_back(new Array({competencies: competences, jobs: []}));
            }
            if (Trace)
                console.assert(competences.length === data.length, "'Predict_jobs' >> 'competences.length === data.length' untrue");
            data.forEach(datum => {
                // if (Trace)
                //     datum.metiersRome.forEach((metier: ROMEO_V2_metier) => console.log(`\x1b[33m\t\t🔍 -> "${metier.libelleAppellation}" ${metier.scorePrediction}\x1b[0m`));
                ROME0_V2_job_data_call_back(new Array({competencies: competences, jobs: datum.metiersRome}));
            });
        } catch (error: unknown) {
            if (Trace)
                console.error(`\x1b[31m\t❌ Erreur prédiction métiers\x1b[0m`, error);
            ROME0_V2_job_data_call_back(new Array({competencies: competences, jobs: []}));
        }
    }
}