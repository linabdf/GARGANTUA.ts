import Settings from "../../common/Settings";
import ROMEO_V2, {GARGANTUA_competency_datum} from "../../backend/francetravail.io/ROMEO_V2";

/** Test */
function ROME0_V2_call_back(this: string, data: Array<GARGANTUA_competency_datum>) {
    // L'appel est fait avec 'bind' ayant pour premier paramètre 'fingerprint'
    // Attention, 'this.constructor.name === "String"'. On teste donc sur '==' et non '===' :
    console.assert(Settings.FINGERPRINT == this, "'Settings.FINGERPRINT == this' untrue");
    console.info(JSON.stringify(data));
}

const competencies = ROMEO_V2.Predict_competencies(ROME0_V2_call_back.bind(Settings.FINGERPRINT), ["Je viens d'obtenir un master en économie et gestion avec une spécialisation en marketing."]);
competencies.then((competencies) => {
    if (competencies === null)
        console.log(`\x1b[31m\t\t❌ Si 'null' alors problème avec 'token'\x1b[0m`);
});

