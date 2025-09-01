import Settings from "../../common/Settings";
import {OpenAI_text_extraction} from "../../backend/text_extraction/OpenAI";

/** Test */
OpenAI_text_extraction.Text_extraction(Settings.Banque_commercial_suivi_client_mp3).then(transcription => {
    if (transcription !== null)
        OpenAI_text_extraction.Get_data(transcription).then(data => {
            if (data !== null)
                console.log(data);
        });
});

