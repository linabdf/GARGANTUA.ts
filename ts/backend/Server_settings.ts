import file_system from 'node:fs';
//permet de decouper  du texte en phrases,clauses,entités(nos,prénoms,entités(nommms,dates... etx)
import compromise from 'compromise';

import dotenv from 'dotenv'; // Utile uniquement pour Node.js 18 car option '--env-file=.env' absente...
import nexline from 'nexline';
import nlp from 'compromise'
import * as fs from 'fs/promises';
import {regex} from "zod/v4";


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
import * as fs from 'fs/promises';
export async function Segment_CV_text(text_file_path:string):Promise<Array<string>>{
    if(!text_file_path||text_file_path.trim().length===0){
        return [];
    }
    const textChaine=await fs.readFile(text_file_path,{encoding:'utf8'});
    //supprimer les barres ,remplacer les sauts de ligne par un espace
    let textPropre=textChaine.replace(/[|\\/]/g,' ').replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/g,' ').trim();
  //enlever les Guillemets et Point-virgule
    textPropre=textPropre.replace(/^"|"$/g,'').trim();
    textPropre=textPropre.replace(/;$/,'').trim();

    const segmented=Segment_CV_string(textPropre);
    return segmented;
}

export function Segment_CV_string(text: string): Array<string> {
   if (!text || text.trim().length === 0) return [];
        // Normaliser : ajouter un espace après les points si oublié
        const normalized = text.replace(/([a-zA-Z])\.([A-Z])/g, "$1. $2");

        // Utiliser compromise pour extraire les phrases
        const sentences = nlp(normalized).sentences().out('array');

        // Nettoyer les phrases
        return sentences.map(s => s.trim()).filter(s => s.length > 0);
    }
