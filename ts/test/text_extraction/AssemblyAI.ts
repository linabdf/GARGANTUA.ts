import Settings from "../../common/Settings";
import AssembyAI from "../../backend/text_extraction/AssemblyAI";

/** Test */
AssembyAI.Text_extraction(Settings.Banque_commercial_suivi_client_mp3).then(text_file_path => console.info(`\x1b[30m\tTEST -AssembyAI-: '${text_file_path}'\x1b[0m`));