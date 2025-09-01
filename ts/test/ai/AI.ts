import AI from "../../backend/ai/AI";
import {SSE_message_type} from "../../common/Settings";

function Test() {
    const content = {
        'Prénom': 'Max',
        Nom_de_famille: 'Leclerc',
        Date_de_naissance: 'EMPTY',
        'Compétence': ["Soudage à l'arc électrique", 'Soudage au laser'],
        'Métier': ['Soudeur'],
        'Localité': ['Dax', 'Tarbes', 'Lourdes'],
        'Numéro_de_téléphone': 'EMPTY',
        'E-mail': 'EMPTY',
        Permis_de_conduire_voiture: 'EMPTY'
    };
    const forename = AI.Value(SSE_message_type.FORENAME, content);
    const surname = AI.Value(SSE_message_type.SURNAME, content);
    const e_mail = AI.Value(SSE_message_type.E_MAIL, content);
    const phone_number = AI.Value(SSE_message_type.PHONE_NUMBER, content);
    const competencies = AI.Value(SSE_message_type.COMPETENCY, content);
    const jobs = AI.Value(SSE_message_type.JOB, content);
    const localities = AI.Value(SSE_message_type.LOCALITY, content);
    console.log("TEST: " + `${forename} ${surname} ${e_mail} ${phone_number} ${competencies} ${jobs} ${localities}\n`);
}

function Test_() {
    const content = {
        'Prénom': 'Max',
        'Nom de famille': 'Leclerc',
        'Date de naissance': 'EMPTY',
        'Compétences': ["soudage à l'arc électrique", 'soudage au laser'],
        'Métiers': ['soudeur'],
        'Localité': ['Dax', 'Tarbes', 'Lourdes'],
        'Numéro de téléphone': 'EMPTY',
        'E-mail': 'EMPTY',
        'Permis de conduire voiture': 'EMPTY'
    };
    const forename = AI.Value(SSE_message_type.FORENAME, content);
    const surname = AI.Value(SSE_message_type.SURNAME, content);
    const e_mail = AI.Value(SSE_message_type.E_MAIL, content);
    const phone_number = AI.Value(SSE_message_type.PHONE_NUMBER, content);
    const competencies = AI.Value(SSE_message_type.COMPETENCY, content);
    const jobs = AI.Value(SSE_message_type.JOB, content);
    const localities = AI.Value(SSE_message_type.LOCALITY, content);
    console.log("TEST_: " + `${forename} ${surname} ${e_mail} ${phone_number} ${competencies} ${jobs} ${localities}\n`);
}

function Test__() {
    const content = {
        'Prénom': 'Henri',
        Nom_de_famille: 'EMPTY',
        Date_de_naissance: 'EMPTY',
        'Compétence': ["Soudage à l'arc électrique", 'Soudage au laser'],
        'Métier': ['Soudeur'],
        'Localité': ['Dax', 'Tarbes', 'Lourdes'],
        'Numéro_de_téléphone': 'EMPTY',
        'E-mail': 'EMPTY',
        Permis_de_conduire_voiture: 'EMPTY'
    };
    const forename = AI.Value(SSE_message_type.FORENAME, content);
    const surname = AI.Value(SSE_message_type.SURNAME, content);
    const e_mail = AI.Value(SSE_message_type.E_MAIL, content);
    const phone_number = AI.Value(SSE_message_type.PHONE_NUMBER, content);
    const competencies = AI.Value(SSE_message_type.COMPETENCY, content);
    const jobs = AI.Value(SSE_message_type.JOB, content);
    const localities = AI.Value(SSE_message_type.LOCALITY, content);
    console.log("TEST__: " + `${forename} ${surname} ${e_mail} ${phone_number} ${competencies} ${jobs} ${localities}\n`);
}

function Test___() {
    const content = {
        'Prénom': 'EMPTY',
        'Nom de famille': 'EMPTY',
        'Date de naissance': 'EMPTY',
        'Compétence': ["soudure à l'arbre", 'soudure au laser'],
        'Métier': ['EMPTY'],
        'Localité': 'Pau',
        'Numéro de téléphone': 'EMPTY',
        'E-mail': 'EMPTY',
        'Permis de conduire voiture': 'EMPTY'
    };
    const forename = AI.Value(SSE_message_type.FORENAME, content);
    const surname = AI.Value(SSE_message_type.SURNAME, content);
    const e_mail = AI.Value(SSE_message_type.E_MAIL, content);
    const phone_number = AI.Value(SSE_message_type.PHONE_NUMBER, content);
    const competencies = AI.Value(SSE_message_type.COMPETENCY, content);
    const jobs = AI.Value(SSE_message_type.JOB, content);
    const localities = AI.Value(SSE_message_type.LOCALITY, content);
    console.log("TEST___: " + `${forename} ${surname} ${e_mail} ${phone_number} ${competencies} ${jobs} ${localities}\n`);
}

function Test____() {
    const content = {
        'Prénom': 'Astrid',
        'Nom de famille': 'EMPTY',
        'Date de naissance': 'EMPTY',
        'Compétence': [
            'Master en économie et gestion avec une spécialisation en marketing',
            "Participation à l'élaboration et la mise en place d'une nouvelle stratégie pour améliorer la qualité de suivi des meilleurs clients",
            'Expérience unique dans le domaine bancaire',
            'Orientation client',
            "Maîtrise d'Excel"
        ],
        'Métier': ['Commercial', 'EMPTY'],
        'Localité': 'EMPTY',
        'Numéro de téléphone': 'EMPTY',
        'E-mail': 'EMPTY',
        'Permis de conduire voiture': 'EMPTY'
    };
    const forename = AI.Value(SSE_message_type.FORENAME, content);
    const surname = AI.Value(SSE_message_type.SURNAME, content);
    const e_mail = AI.Value(SSE_message_type.E_MAIL, content);
    const phone_number = AI.Value(SSE_message_type.PHONE_NUMBER, content);
    const competencies = AI.Value(SSE_message_type.COMPETENCY, content);
    const jobs = AI.Value(SSE_message_type.JOB, content);
    const localities = AI.Value(SSE_message_type.LOCALITY, content);
    console.log("TEST____: " + `${forename} ${surname} ${e_mail} ${phone_number} ${competencies} ${jobs} ${localities}\n`);
}

/** Test */
Test();
Test_();
Test__();
Test___();
Test____();