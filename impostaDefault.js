const treno = require(__dirname + "/accessoDatabase.js");
const id = require(__dirname + "/views/ultimiId.json");
const salvaId = require(__dirname + "/salvaId.js");
const utente1 = {
    nome: "Aiman",
    cognome:"Rattab",
    residenza:"Viterbo"
};
const luogo1 = {
    citta: "Napoli",
    n_abitanti:12,
    regione:"Campania"
};
const luogo2 = {
    citta: "Viterbo",
    n_abitanti:12,
    regione:"Lazio"
};
const luogo3 = {
    citta: "Roma",
    n_abitanti:12,
    regione:"Lazio"
};
const occupazione1 = {
    ek_prenotazione: 1,
    ek_tratta:1,
};
const posto1 = {
    ek_treno: 1,
    num_carrozza:1,
    num_posto:1
};
const pren1 = {
    ek_prenotazione: 1,
    ek_utente:1,
    qr:""
};
// const trat1 = {
//     data: data.getDate(),
//     ek_luogo:1,
//     ek_treno:1
// };

const t = {
    codice:1,
};
exports.salvaDati = function(){
    //treno.db.collection("utenti").doc(id.utenti.toString()).set(utente1);
    //treno.db.collection("prenotazioni").doc(id.prenotazioni.toString()).set(pren1);
    //salvaId.incPrenotazioni();
    treno.db().collection("luoghi").doc(id.luoghi.toString()).set(luogo1);
    treno.db().collection("luoghi").doc((id.luoghi+1).toString()).set(luogo2);
    salvaId.incLuoghi(2);
    //treno.db().collection("luoghi").doc(id.luoghi.toString()).set(luogo3);

    // treno.db.collection("tratte").doc(id.tratte.toString()).set(trat1);
    // salvaId.incTratte();
};
