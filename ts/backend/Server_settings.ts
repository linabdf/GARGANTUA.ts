import file_system from 'node:fs';
//permet de decouper  du texte en phrases,clauses,entités(nos,prénoms,entités(nommms,dates... etx)
import compromise from 'compromise';

import dotenv from 'dotenv'; // Utile uniquement pour Node.js 18 car option '--env-file=.env' absente...
import nexline from 'nexline';


// import path from 'node:path'; // 'tsx'

// export const __DIRNAME = path.dirname(__FILENAME); // 'tsx'

export const __DIRNAME = __dirname;
export const __FILENAME = __filename;

// Attention à ce réglage fait sur le texte "Chargé de clientèle bancaire" ("required") envers "Banque_commercial_suivi_client.mp4" ("provided")...
export const FUSE_js_threshold = 0.785;

class Server_settings {
    static {
        dotenv.config(); // Utile uniquement pour Node.js 18 car option '--env-file=.env' absente...
    }
}
//fonction qui fait le decoupage
export async function Segment_CV_text(text_file_path: string): never | Promise<Array<string>> {
    const segments = new Array;
    // Exception à gérer : lire le txte ligne par ligne
    const text = nexline({ // 'nexline' library...
        input: file_system.createReadStream(text_file_path)
    });
    while (true) {
        const segment = await text.next();
        if (segment === null) break; // End of text is reached...
        if (segment.length === 0) continue; // Ignore empty line...
        // https://observablehq.com/@spencermountain/compromise-selections
        segments.push(...compromise(segment.trim()).clauses().out('array'));
    }
    // if (Trace)
    //     console.log(`\x1b[33m\t\t>> ${segments.join(" *** ")}\x1b[0m`);
    return segments;
}
//fonction qui decoupe un paragraphe je vais la remplacer apres parla fonction segeents cv qui prend  un fichier
export function Segment_CV_string(text: string): Array<string> {
    // Découpe le texte en lignes (ou en paragraphes)
    const lines = text.split(/\n+/);
    const segments: string[] = [];

    for (const line of lines) {
        if (line.trim().length === 0) continue; // ignorer les lignes vides
        // Découpe chaque ligne en clauses avec compromise
        segments.push(...compromise(line.trim()).clauses().out('array'));
    }

    return segments;
}