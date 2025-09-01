import Fuse, {FuseResult} from 'fuse.js';

import Settings from "../../common/Settings";

const Provided_competencies = ["Diplôme en gestion et marketing", "Assurer le suivi de la satisfaction clients", "Contrôler la qualité des services fournis aux clients", "BTS banque, conseiller de clientèle (particuliers)"];
const Provided_jobs = ["Responsable relations bancaires", "Chargé / Chargée de clientèle professionnelle de banque", "Chargé / Chargée de clientèle particuliers de banque", "Modèle Vivant", "Chargé / Chargée d'affaires bancaires professionnelles"];

const Required_competencies = ["Chargé de clientèles en assurance et banque", "Conseiller clientèle en banque et assurance"];
const Required_jobs = ["Chargé / Chargée de clientèle professionnelle de banque", "Chargé / Chargée de clientèle entreprises de banque", "Conseiller / Conseillère de clientèle bancaire", "Chargé / Chargée de clientèle particuliers de banque"];

const Required_competencies_2 = ["Gériatrie", "Gérer les urgences médicales en gériatrie"];
const Required_jobs_2 = ["Infirmier / Infirmière en gériatrie", "Auxiliaire de gériatrie"];

function Match(provided: Array<string>, required: Array<string>, threshold = Settings.FUSE_js_threshold) {
    const fuse = new Fuse(provided, {
        findAllMatches: true,
        includeScore: true
    });
    let count = 0;
    required.forEach(r => {
        fuse.search(r).filter((find: FuseResult<string>) => (find.score ? find.score : 1) <= threshold).forEach((find: FuseResult<string>) =>
            console.log("\n\t" + (++count) + ". Sought '" + r + "' (" + find.score + ") that matches '" + find.item + "'"));
    });
}

/** Test */
// Match(Provided_competencies.concat(Provided_jobs), Required_competencies.concat(Required_jobs), Settings.FUSE_js_threshold);
// console.log("\nMismatch, must be empty:");
// Match(Provided_competencies.concat(Provided_jobs), Required_competencies_2.concat(Required_jobs_2), Settings.FUSE_js_threshold);
// Match(["Diplôme supérieur en marketing, commerce et gestion", "Diplôme en gestion et marketing", "Assurer le suivi de la satisfaction clients", "Contrôler la qualité des services fournis aux clients", "BTS banque, conseiller de clientèle (particuliers)"], ["Chargé de clientèles en assurance et banque", "Conseiller clientèle en banque et assurance"], Settings.FUSE_js_threshold);
// Match(["Chargé / Chargée de clientèle professionnelle de banque"], ["Identifier les opportunités de développement professionnel"]);

// Régler à 2/3 pour éviter les "matches" :
Match(["Diplôme supérieur en marketing, commerce et gestion"], ["Gériatre"]/*, 2 / 3*/); // 0.82
Match(["Diplôme supérieur en marketing, commerce et gestion"], ["Gériatrie"]/*, 2 / 3*/); // 0.79
Match(["Empathie envers les clients"], ["Gériatrie"]/*, 2 / 3*/); // 0.74

