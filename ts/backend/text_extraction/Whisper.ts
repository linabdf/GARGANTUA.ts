import {exec} from 'node:child_process';
import {promisify} from 'node:util';

const Async_exec = promisify(exec);

import * as nodejs_whisper from 'nodejs-whisper'; // https://www.npmjs.com/package/nodejs-whisper

import {To_suffix, Trace} from "../../common/Settings";

export default class Whisper {
    static {
    }

    /** La qualité du texte extrait est faible avec le modèle 'small'
     * 'éclense' au lieu de 'expérience'
     * 'm'attrape' au lieu de 'm'interpelle'
     * 'que vous portera' au lieu de 'que vous porterez'
     * Etc.
     */

    static async Text_extraction(audio_file_path: string, output_dir: string, model = 'turbo'): Promise<null | string> {
        // Attention, le fichier extrait a le suffixe 'txt'...
        try {
            // Available models: https://github.com/openai/whisper/blob/main/README.md#available-models-and-languages
            // 'large' va donner un meilleur résultat que 'small' ou 'turbo' (défaut) mais ça prend plus de temps :
            const command = `whisper "${audio_file_path}" --language fr --model ${model} --output_format txt --output_dir "${output_dir}"`;
            const {stdout, stderr} = await Async_exec(command);
            // if (stderr)  // Messages que produit 'Whisper' sans forcément de conséquence sur le résultat attendu :
            //     if (Trace)
            //         console.warn("\x1b[35m\t🔍 -Whisper- 'stderr' flow: ", stderr + "\x1b[0m");
            return Promise.resolve(To_suffix(audio_file_path, 'txt'));
        } catch (error: unknown) {
            return Promise.resolve(null);
        }
    }

    static async Text_extraction_(audio_file_path: string, model = "turbo"): Promise<null | string> {
        return Promise.resolve("NOT YET IMPLEMENTED");
    }
}
