import file_system from 'node:fs';

import axios, {AxiosError} from 'axios';

import {France_Travail_IO_type_competence} from "./ROMEO_V2";
import {RIASEC, Trace} from "../../common/Settings";

interface ROME_V4_response {
    config: any;
    data: any | ROME_V4_data;
    headers: any;
    request: any;
    status: any;
    statusText: any;
}

interface ROME_V4_data {
    requete: any;
    resultats: any;
    totalResultats: any;
}

interface ROME_V4_competence {
    categorieSavoir: {
        code: string;
        libelle: string;
        categorie: {
            code: string;
            libelle: string;
        }
    };
    code: string;
    codeOgr?: string;
    libelle: string;
    obsolete?: boolean;
    riasecMajeur?: RIASEC;
    riasecMineur?: RIASEC;
    transitionEcologique?: boolean;
    transitionNumerique?: boolean;
    type: France_Travail_IO_type_competence;
}

interface ROME_V4_metier {
    appellationEsco: {
        uri: string;
        libelle: string
    };
    classification?: string;
    code: string;
    competencesCles: Array<{
        competence: ROME_V4_competence,
        frequence: number
    }>;
    libelle: string;
    libelleCourt: string;
    metier: {
        code: string;
        codeIsco: string;
        domaineProfessionnel: {
            code: string;
            grandDomaine: {
                code: string;
                libelle: string;
            };
            libelle: string;
        }
        libelle: string;
        riasecMajeur: RIASEC;
        riasecMineur: RIASEC;
        transitionEcologique: boolean;
        transitionEcologiqueDetaillee: string;
    };
    obsolete?: boolean;
    transitionEcologique?: boolean;
    transitionEcologiqueDetaillee?: string;
}

enum ROME_V4_job_request {
    appellation = "appellation",
    metier = "metier"
}

const Load_token = (scope: typeof ROME_V4.Scope_competences | typeof ROME_V4.Scope_metiers): {
    token: string | null;
    expires_in: number
} => {
    const token_file_path = scope === ROME_V4.Scope_competences ? ROME_V4.Token_competencies_file_path : ROME_V4.Token_jobs_file_path;
    try {
        const data = JSON.parse(file_system.readFileSync(token_file_path, 'utf-8'));
        console.log(`\x1b[33m\t🔍 'token' chargé ${data.access_token}\x1b[0m`);
        return {token: data.access_token, expires_in: data.expires_in};
    } catch (error) {
        console.log(`\x1b[31m\t⚠️ 'token' non chargé\x1b[0m`);
        return {token: null, expires_in: 0};
    }
};

const Save_token = (scope: typeof ROME_V4.Scope_competences | typeof ROME_V4.Scope_metiers, token: string, expires_in: number): void => {
    const token_file_path = scope === ROME_V4.Scope_competences ? ROME_V4.Token_competencies_file_path : ROME_V4.Token_jobs_file_path;
    try {
        const data = {access_token: token, expires_in};
        file_system.writeFileSync(token_file_path, JSON.stringify(data));
        console.log(`\x1b[33m\t✅ 'token' sauvegardé ${token}... expiration ${new Date(expires_in * 1000).toLocaleString()}`);
    } catch (error) {
        console.log(`\x1b[33m\t⚠️ 'token' non sauvegardé\x1b[0m`);
    }
};

const Get_token = async (scope: typeof ROME_V4.Scope_competences | typeof ROME_V4.Scope_metiers): Promise<string> => {
    const {token, expires_in} = Load_token(scope);
    // Vérifier si le 'token' est valide :
    if (token && Date.now() < expires_in * 1000) {
        console.log(`\x1b[33m\t✅ 'token' valide ${token}... expiration ${new Date(expires_in * 1000).toLocaleString()}\x1b[0m`);
        return token;
    }
    console.log(`\x1b[33m\t🔄 'token' non valide ${token}... récupération en cours...\x1b[0m`);
    const parameters = new URLSearchParams({
        client_id: process.env.ROME_V4_CLIENT_ID,
        client_secret: process.env.ROME_V4_CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: scope
    });
    try {
        const response = await axios.post(ROME_V4.TOKEN_URL, parameters.toString(), {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        });
        Save_token(scope, response.data.access_token, Math.floor(Date.now() / 1000) + response.data.expires_in);
        console.log(`\x1b[33m\t✅ 'token' récupéré ${response.data.access_token}... expiration ${new Date(Math.floor(Date.now() / 1000) + response.data.expires_in * 1000).toISOString()}`);
        return response.data.access_token;
    } catch (error) {
        console.error(`\x1b[31m\t❌ 'token' non sauvegardé\x1b[0m`, error.response?.data || error.message);
    }
};

export default class ROME_V4 {
    private static readonly _API_BASE_COMPETENCES = "https://api.francetravail.io/partenaire/rome-competences/v1";
    private static readonly _API_BASE_METIERS = "https://api.francetravail.io/partenaire/rome-metiers/v1";
    static readonly Scope_competences = "api_rome-competencesv1 nomenclatureRome";
    static readonly Scope_metiers = "api_rome-metiersv1 nomenclatureRome";
    static readonly Token_competencies_file_path = "./resources/Token_competencies.json";
    static readonly Token_jobs_file_path = "./resources/Token_jobs.json";
    static readonly TOKEN_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire";

    static {
        if (Trace) {
            console.log(process.env.ROME_V4_CLIENT_ID, "'process.env.ROME_V4_CLIENT_ID' untrue");
            console.log(process.env.ROME_V4_CLIENT_SECRET, "'process.env.ROME_V4_CLIENT_SECRET' untrue");
        }
    }
    // https://francetravail.io/data/api/rome-4-0-competences/documentation
    static All_competencies = async (): Promise<void> => {
        const token = await Get_token(ROME_V4.Scope_competences);
        try {
            const response = await axios.get(`${ROME_V4._API_BASE_COMPETENCES}/competences/competence`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.log(`\x1b[32m\t✅ Nombre de compétences : ${response.data.length}\x1b[0m`);
            for (let i = 0; i < response.data.length; i++)
                console.info(`\x1b[32m\t\t✅ Compétence : ${JSON.stringify(response.data[i])}\x1b[0m`);
        } catch (error: unknown) {
            const error_ = error as AxiosError;
            console.error(`❌ Erreur recherche compétences "${token}" : ${error_.message}`);
        }
    }
    static One_competency = async (code = "481474"): Promise<void> => {
        const token = await Get_token(ROME_V4.Scope_competences);
        try {
            // ${code}?champs=libelle
            const response = await axios.get(`${ROME_V4._API_BASE_COMPETENCES}/competences/competence/${code}`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.info(`\x1b[32m\t\t✅ Compétence : ${JSON.stringify(response.data)}\x1b[0m`);
        } catch (error: unknown) {
            const error_ = error as AxiosError;
            console.error(`❌ Erreur recherche compétence "${code}" : ${error_.message}`);
        }
    }
    // https://francetravail.io/produits-partages/catalogue/rome-4-0-metiers/documentation
    static All_jobs = async (job_request = ROME_V4_job_request.appellation): Promise<void> => {
        const token = await Get_token(ROME_V4.Scope_metiers);
        try {
            const response = await axios.get(`${ROME_V4._API_BASE_METIERS}/metiers/${job_request}`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.log(`\x1b[32m\t✅ Nombre de métiers : ${response.data.length}\x1b[0m`);
            for (let i = 0; i < response.data.length; i++)
                console.info(`\x1b[32m\t\t✅ Métier : ${JSON.stringify(response.data[i])}\x1b[0m`);
        } catch (error: unknown) {
            const error_ = error as AxiosError;
            console.error(`❌ Erreur recherche métiers "${token}" : ${error_.message}`);
        }
    }
    static One_job = async (code = "38862", competences: string[] = []): Promise<void> => {
        const token = await Get_token(ROME_V4.Scope_metiers);
        try {
            const response = await axios.get(`${ROME_V4._API_BASE_METIERS}/metiers/appellation/${code}`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.info(`\x1b[32m\t\t✅ Métier : ${JSON.stringify(response.data)}\x1b[0m`);
        } catch (error: unknown) {
            const error_ = error as AxiosError;
            console.error(`❌ Erreur recherche métier "${code}" : ${error_.message}`);
        }
    }
    static One_job_ = async (job = "Soudeur", competences: string[] = []): Promise<void> => {
        const token = await Get_token(ROME_V4.Scope_metiers);
        try {
            const response = await axios.get(`${ROME_V4._API_BASE_METIERS}/metiers//metier/requete?q=${job}`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            // console.log(Object.getOwnPropertyNames(response.data).join(" - "));
            // console.assert(response.data.resultats.length === response.data.totalResultats);
            console.log(`\x1b[32m\t✅ Nombre de métiers : ${response.data.resultats.length}\x1b[0m`);
            for (let i = 0; i < response.data.resultats.length; i++)
                console.info(`\x1b[32m\t\t✅ Métier : ${JSON.stringify(response.data.resultats[i])}\x1b[0m`);
        } catch (error: unknown) {
            const error_ = error as AxiosError;
            console.error(`❌ Erreur recherche métier "${job}" : ${error_.message}`);
        }
    }
}
