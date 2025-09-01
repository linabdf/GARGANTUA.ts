import Settings, {Trace} from "../../common/Settings";
import Whisper from "../../backend/text_extraction/Whisper";

/** Test */
if (Trace)
    console.assert(process.env.AUDIO_directory, "'process.env.AUDIO_directory' untrue");
Whisper.Text_extraction(Settings.Banque_commercial_suivi_client_mp3, process.env.AUDIO_directory).then(text_file_path => console.info(`\x1b[30m\tTEST -Whisper- '${text_file_path}'\x1b[0m`));
