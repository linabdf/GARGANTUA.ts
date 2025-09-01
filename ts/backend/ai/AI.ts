import {BONJOUR, SSE_message_type, Trace} from "../../common/Settings";

export default abstract class AI {
    protected static readonly _Prompt = `Extraire du texte entre guillemets
 - des propriétés de type ${SSE_message_type.FORENAME}
 - des propriétés de type ${SSE_message_type.SURNAME}
 - des propriétés de type ${SSE_message_type.BIRTH_DATE}
 - plusieurs propriétés de type ${SSE_message_type.COMPETENCY}
 - plusieurs propriétés de type ${SSE_message_type.JOB} (le cas échéant, déduire des ${SSE_message_type.JOB} à partir des ${SSE_message_type.COMPETENCY})
 - des propriétés de type ${SSE_message_type.LOCALITY}
 - des propriétés de type ${SSE_message_type.PHONE_NUMBER}
 - des propriétés de type ${SSE_message_type.E_MAIL}
 - une propriété de type ${SSE_message_type.CAR_DRIVING_LICENSE}.
Retourner les résultats en format JSON avec ${SSE_message_type.EMPTY} pour un type de propriété demandé mais absent.`

    // Le format est celui de Server-sent events
    protected static _Basic_response(model: string, fingerprint: string, response: string): string {
        return `\ndata: {"${SSE_message_type.AI_LLM}": "${model}", "${SSE_message_type.AI_DIGEST}": "${response}"}\nid: ${fingerprint}\n\n`;
    }

    // Le format est celui de Server-sent events
    protected static _Response(model: string, fingerprint: string, forename: null | string, surname: null | string, e_mail: null | string, phone_number: null | string, competencies: null | string, jobs: null | string, localities: null | string): string {
        forename = forename === null ? '' : forename;
        surname = (surname === null ? '' : ` ${surname}`);
        e_mail = (e_mail === null ? '' : ` ${e_mail}`);
        phone_number = (phone_number === null ? '' : ` ${phone_number}`);
        competencies = competencies === null ? ". " : competencies;
        competencies = (competencies === ". " ? '' : `. ${SSE_message_type.COMPETENCY} : ${competencies}`);
        jobs = jobs === null ? ". " : jobs;
        jobs = (jobs === ". " ? '' : `. ${SSE_message_type.JOB} : ${jobs}`);
        localities = localities === null ? ". " : localities;
        localities = (localities === ". " ? '' : `. ${SSE_message_type.LOCALITY} : ${localities}`);
        const response: string = `${BONJOUR} ${forename}${surname}${e_mail}${phone_number}${competencies}${jobs}${localities}.`;
        if (Trace)
            console.log(`\x1b[32m\t✅ Réponse ${model} fine :\x1b[0m`, response);
        return `\ndata: {"${SSE_message_type.AI_LLM}": "${model}", "${SSE_message_type.AI_DIGEST}": "${response}"}\nid: ${fingerprint}\n\n`;
    }

    static Value(key: SSE_message_type, content: Object): null | string {
        let value = content[key];
        if (value)
            if (value === SSE_message_type.EMPTY) // L'IA n'a pas trouvé et nous le signale "normalement"...
                return null;
            else
                return Array.isArray(value) ? value.filter(item => item !== SSE_message_type.EMPTY).join(' ') : value; // Cas "normal"...
        // La clé (nom du champ JSON) retournée par l'IA est "inattendue"...
        value = content[key + 's']; // "Compétence" -> "Compétences" (gpt-4-turbo)
        if (value && value !== SSE_message_type.EMPTY)
            return Array.isArray(value) ? value.filter(item => item !== SSE_message_type.EMPTY).join(' ') : value;
        value = content[(key as string).replaceAll(/\s/g, '_')]; // "Nom de famille" -> "Nom_de_famille" (mistral:latest)
        if (value && value !== SSE_message_type.EMPTY)
            return Array.isArray(value) ? value.filter(item => item !== SSE_message_type.EMPTY).join(' ') : value;
        return null;
    }
}