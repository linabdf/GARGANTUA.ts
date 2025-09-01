/* 'DO NOT CHANGE' **/
export const AUDIO = "audio"; // Attention utilisé comme chemin dans URL...
export const IMAGE = "image";
export const VIDEO = "video"; // Attention utilisé comme chemin dans URL...
export const GET_AUDIO_CV = "get_audio_cv"; // Attention utilisé comme chemin dans URL...
export const GET_IMAGE_CV = "get_image_cv"; // Attention utilisé comme chemin dans URL...
export const GET_VIDEO_CV = "get_video_cv"; // Attention utilisé comme chemin dans URL...
/* End of 'DO NOT CHANGE' **/
/** Utilities */
export const AU_REVOIR = "au_revoir"; // Attention utilisé comme chemin dans URL...
export const BONJOUR = "Bonjour";
export const DOT = '.';
export const FINGERPRINT = "FINGERPRINT";
export const SEPARATOR = "-----";
export const WebRTC_Default_Audio_format = 'mp3';
export const WebRTC_Default_Audio_MIME_type = 'audio/webm';
export const WebRTC_MP3_Audio_MIME_type = 'audio/mp3';
export const WebRTC_WAV_Audio_MIME_type = 'audio/wav';
export const WebRTC_Default_Video_MIME_type = 'video/webm';

export const Trace = true; // 'false' in production mode...

export enum RIASEC { //« Réaliste », « Investigateur », « Artistique », « Social », « Entreprenant », « Conventionnel »
    R = 'R',
    I = 'I',
    A = 'A',
    S = 'S',
    E = 'E',
    C = 'C'
}

export enum SSE_message_type {
    /** Nom (clef) des champs JSON utilisés dans un message retournant un CV... */
    audio_or_video = "audio_or_video",
    audio_file_path = "audio_file_path",
    curriculum_vitae_text = "curriculum_vitae_text",
    image_file_path = "image_file_path",
    provided_competencies = "provided_competencies",
    provided_jobs = "provided_jobs",
    text_file_path = "text_file_path",
    video_file_path = "video_file_path",
    /** Fin */
    AI_DIGEST = "AI DIGEST",
    AI_LLM = "AI LLM",
    BIRTH_DATE = "Date de naissance",
    CAR_DRIVING_LICENSE = "Permis de conduire voiture",
    COMPETENCY = "Compétence",
    E_MAIL = "E-mail",
    EMPTY = "EMPTY",
    FORENAME = "Prénom",
    JOB = "Métier",
    LOCALITY = "Localité",
    PHONE_NUMBER = "Numéro de téléphone",
    SCORE = "Score",
    STATUS = "Status",
    SURNAME = "Nom de famille",
    TRUCK_DRIVING_LICENSE = "Permis de conduire camion"
}

export default class Settings {
    static readonly EMPLOYMENT = "EMPLOYMENT"; // Nom du champ pour la requête dans 'POST_JOB_APPLICATION_OR_OPPORTUNITY'...
    static readonly FUSE_js_threshold = 0.95;

    static readonly AUCUNE_COMPETENCE = "&#9760; Aucune compétence";
    static readonly AUCUN_CURRICULUM_VITAE = "&#9760; Aucun curriculum vitae";
    static readonly COMPETENCES_OFFERTES = "<b>-compétences offertes-</b>";
    static readonly COMPETENCES_RECHERCHEES = "<b>-compétences recherchées-</b>";
    static readonly FIN_COMPETENCES = "<b>-fin des compétences-</b>";
    static readonly METIERS_OFFERTS = "<b>-métiers offerts-</b>";
    static readonly METIERS_RECHERCHES = "<b>-métiers recherchés-</b>";
    static readonly FIN_METIERS = "<b>-fin des métiers-</b>";

    /** Samples for test */
    static readonly Banque_commercial_suivi_client = "Voyons ici un exemple d'une vidéo de candidat effective.\
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
    static readonly Banque_commercial_suivi_client_mp3 = "./audio/Banque_commercial_suivi_client.mp3";
    static readonly Banque_commercial_suivi_client_mp4 = "./video/Banque_commercial_suivi_client.mp4";

    static readonly Marketing_digital = "Bonjour, moi c'est Benjamin, j'ai 22 ans et j'habite à Rennes.\
Dans la vie, ce que j'aime, c'est la photo, l'aventure et le voyage.\
Je suis aussi un grand passionné de football et je pratique la course à pied régulièrement.\
Après mon bac, j'ai fait un BTS MUC, puis une licence responsable de centre de profit en alternance à NatureSource,\
 où j'ai pu développer mes compétences en gestion et management.\
Ensuite, j'ai été embauché en CDI dans cette même entreprise, où j'ai également fait de la communication,\
 et c'est vraiment ce qui m'intéressait le plus.\
 Suite à cette expérience, j'ai repris mes études et fait un bachelor marketing digital et communication,\
 où j'ai effectué un stage de 6 mois au sein d'une entreprise dans le domaine de l'événementiel.\
Lors de ce stage, j'ai créé un nouveau site internet sous WordPress, développé les réseaux sociaux,\
 créé de nouveaux supports de communication, mais également réalisé des études de marché.\
Je maîtrise également la mise en page avec InDesign, les retouches avec Photoshop,\
 ainsi que la création de montages vidéo avec Adobe Premiere.\
En septembre prochain, je débute un master dans le marketing et la communication\
 et recherche une entreprise qui pourra m'accueillir en contrat de professionnalisation.\
Sérieux, dynamique, curieux, créatif et surtout très motivé, j'ai envie d'apprendre encore et encore,\
 mais surtout appliquer mes connaissances sur le terrain et contribuer au développement de votre entreprise.\
Mon profil vous intéresse ? Contactez-moi !";

    static readonly Soudure = "Bonjour, je m'appelle Henri, je suis à la recherche d'un emploi dans le domaine de la soudure et j'ai des compétences en soudage à l'arc électrique et en soudage au laser.\
J'opère principalement dans les environs de Dax, Tarbes et Lourdes.";
  static readonly  Geriatrie=" Bonjour, je m'appelle Franck Barbier. Mon numéro de téléphone est 0608272562.Mon adresse mail est franck.barbier.com. Je suis infirmier spécialiste en gériatrie et je recherche un emploi dans un hôpital ou une clinique autour de Mont-de-Marsan dans les Landes."

    static readonly Soudure_mp4 = "./video/Soudure.mp4";
    static readonly Soudure_wav = "./audio/Soudure.wav";

    static readonly Default_Image_MIME_type = 'image/png';
    static readonly FINGERPRINT = "B--Di";
    static readonly GARGANTUA_PORT = 1963;
    static readonly GARGANTUA_SERVER_SENT_EVENTS_PATH = "server_sent_events";
    static readonly GARGANTUA_URL = "http://localhost:";

    static readonly Audio_file_maximal_size = 50 * 1024 * 1024; // 50 MB...
    static readonly Video_file_maximal_size = 200 * 1024 * 1024; // 200 MB...

    static readonly Rien_a_telecharger = "&#9760; Rien à télécharger";

    static readonly Audio_invalid = "&#9760; Invalidité de l’audio";
    static readonly Video_invalid = "&#9760; Invalidité de la vidéo";
    static readonly Bad_audio_file = "&#9760; L’audio n’est pas traitable en l’état";
    static readonly Bad_video_file = "&#9760; La vidéo n’est pas traitable en l’état";
    static readonly Too_big_audio_file = "&#9760; L’audio est trop volumineux";
    static readonly Too_big_video_file = "&#9760; La vidéo est trop volumineuse";

    static readonly Image_absent = "&#9760; Absence d’image";

    static readonly Audio_extraction_failed = "&#9760; Son de la vidéo non extractible";
    static readonly Audio_extraction_succeeded = "&#9996; Son de la vidéo extrait";
    static readonly Dysfonctionnement_API_AssemblyAI = "&#9760; Dysfonctionnement API AssemblyAI <code>assemblyai.com</code>";
    static readonly Dysfonctionnement_API_OpenAI = "&#9760; Dysfonctionnement API OpenAI <code>openai.com</code>";
    static readonly Dysfonctionnement_API_ROMEO_ver__2 = "&#9760; Dysfonctionnement API ROMEO ver. 2 <code>francetravail.io</code>";
    static readonly Session_ended_abnormal = "&#9760; Analyse IA terminée &rarrc; échec";
    static readonly Session_ended_normal = "&#9996; Analyse IA terminée &rarrc; succès";
    static readonly Session_ended_warning = "&#9760; Dépassement du nombre autorisé d’analyses IA";
    static readonly Text_extraction_failed = "&#9760; Texte de l’audio ou de la vidéo non extractible";
    static readonly Text_extraction_succeeded = "&#9996; Texte de l’audio ou de la vidéo extrait";

    static readonly Server_started = "&#9996; Serveur fonctionnel";
    static readonly Server_stopped = "&#9760; Serveur dysfonctionnel";
}

export function AUDIO_or_VIDEO(media_type: string): typeof AUDIO | typeof VIDEO | undefined {
    const audio_or_video = media_type.split('/')[0];
    return audio_or_video && (audio_or_video === AUDIO || audio_or_video === VIDEO) ? audio_or_video : undefined;
}

export function Suffix(file_name: null | string, media_type: string): string | undefined {
    if (file_name === null)
        return media_type.split('/').pop();
    return file_name.split(DOT).pop() || media_type.split('/').pop();
}

export function To_suffix(file_name: string, suffix = 'txt'): string {
    return file_name.split(DOT).slice(0, -1).join(DOT) + DOT + suffix;
}
