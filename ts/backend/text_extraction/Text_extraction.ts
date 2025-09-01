import AssembyAI from "./AssemblyAI";
import Whisper from "./Whisper";

export default class Text_extraction {
    static async Text_extraction(audio_file_path: string, output_dir: string): Promise<null | string> {
        return Promise.race([/*AssembyAI.Text_extraction(audio_file_path),*/ Whisper.Text_extraction(audio_file_path, output_dir)]);
    }
}