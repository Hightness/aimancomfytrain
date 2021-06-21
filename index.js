//jshint esversion: 6
const SECONDI_MAX = 1800; // il numero massimo di "ritardo" in secondi che può avere un treno rispetto all'orario stabilito dall'utente
const express = require("express");
const moment = require("moment");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var fs = require("fs");
const md5 = require("md5");
const app = express();
const salvaId = require(__dirname + "/salvaId.js");
const id = require(__dirname + "/views/ultimiId.json");
const def = require(__dirname + "/impostaDefault.js");
const treno = require(__dirname + "/accessoDatabase.js");
var utente_entrato = false;
var tratte_ids = [],
  postiDisponibili = [];
app.set('views', __dirname + "\\views");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
//exports.app = functions.https.onRequest(app);
treno.inizializza();
var citta = [];
var i, luoghi_str, luoghi_JSON;
var stop = true;
treno.db().collection('luoghi').get('citta').then((snapshot) => {
  for (i = 0; i < snapshot.docs.length; i++) {
    citta.push(snapshot.docs[i].data().citta);
  }
  PopolaLuoghi(citta);
});

function PopolaLuoghi(citta) {
  luoghi_str = JSON.stringify(Object.assign({}, citta)); // convert array to string

  function callback(err) {
    if (err) {
      console.log(err);
    } else {
      //console.log("successo");
    }
  }
  luoghi_JSON = JSON.parse(luoghi_str); // convert string to json object
}


treno.db().collection('tratte').get().then((snapshot) => {
  snapshot.docs.forEach(doc => {
    console.log(doc.data().data.toDate());
  })
})
//def.salvaDati();
// treno.db().collection('utenti').get().then((snapshot) => {
//   snapshot.docs.forEach(doc => {
//     console.log(doc.data());
//     console.log(doc.id);
//   })
// });

//sexports.login = functions
app.get("/", function(req, res) {
  res.render("login", {
    user: ""
  });
});
app.route("/login")
  .post(function(req, res) {
    treno.db().collection('utenti').get().then((snapshot) => {
      var cont = 0;
      snapshot.docs.every(doc => {
        cont++;
        if (doc.data().email == req.body.email) {
          console.log(citta);
          if (md5(req.body.pass) == doc.data().password) {
            utente_entrato = {
              nome: doc.data().nome,
              cognome: doc.data().cognome,
              residenza: doc.data().residenza,
              password: doc.data().password,
              email: doc.data().email,
              id: doc.id
            };
            console.log(utente_entrato);
            res.render("home", {
              luoghi: luoghi_str,
              nome: utente_entrato.nome,
              p: "home",
              posti: "",
              i1: "destinazione",
              i2: "partenza",
              i3: "datetime-local"
            });
          } else {
            res.render("login", {
              user: req.body.email,
              passwd: ""
            });
          }
          return false;
        }
        if (cont == snapshot.docs.length) {
          res.render("register", {
            utente: req.body.email,
            passwd: ""
          });
          return false;
        }

      })
    });
  })
app.route("/register")
  .get(function(req, res) {

    res.render("register", {
      utente: "",
      passwd: ""
    });
  })
  .post(function(req, res) {
    const utente1 = {
      nome: req.body.nome,
      cognome: req.body.cognome,
      residenza: req.body.residenza,
      password: md5(req.body.password),
      email: req.body.email
    };
    treno.db().collection('utenti').get().then((snapshot) => {
      var cont = 0;
      var lunghezza_doc = snapshot.docs.length;
      if (lunghezza_doc == 0) {
        treno.db().collection("utenti").doc(id.utenti.toString()).set(utente1);
        utente_entrato = {
          nome: req.body.nome,
          cognome: req.body.cognome,
          residenza: req.body.residenza,
          password: md5(req.body.password),
          email: req.body.email,
          id: id.utenti.toString()
        };
        salvaId.incUtenti();
        res.render("home", {
          luoghi: luoghi_str,
          posti: "",
          i1: "destinazione",
          nome: utente_entrato.nome,
          p: "home",
          i2: "partenza",
          i3: "datetime-local"
        });
      }
      snapshot.docs.forEach(doc => {
        cont += 1;
        console.log(cont.toString());
        if (doc.data().email == utente1.email) {
          res.render("login", {
            user: utente1.email
          });
        } else if (cont == lunghezza_doc) {
          treno.db().collection("utenti").doc(id.utenti.toString()).set(utente1);
          utente_entrato = {
            nome: req.body.nome,
            cognome: req.body.cognome,
            residenza: req.body.residenza,
            password: md5(req.body.password),
            email: req.body.email,
            id: id.utenti.toString()
          };
          salvaId.incUtenti();
          res.render("home", {
            luoghi: luoghi_str,
            posti: "",
            i1: "destinazione",
            nome: utente_entrato.nome,
            p: "home",
            i2: "partenza",
            i3: "datetime-local"
          });
        }
      })
    });
  });
app.route("/home")
  .get(function(req, res) {
    if (!utente_entrato) {
      res.render("login", {
        user: "",
        passwd: ""
      });
    } else {
      res.render("home", {
        luoghi: luoghi_str,
        posti: "",
        i1: "destinazione",
        nome: utente_entrato.nome,
        i2: "partenza",
        p: "home",
        i3: "datetime-local"
      });
    }
  })

  .post(function(req, res) {
    var id_partenza, id_dest, id_treno, i, start, inaccessibile;
    var dataScelta = moment(req.body.data);
    var prenotazioni_ids = [],
      posti = [];
    treno.db().collection('luoghi').get().then((snapshot) => {

      //#region salvo il luogo di partenza in id_partenza
      for (i = 0; i < snapshot.docs.length; i++) {
        //controllo ogni luogo per ottenere l'id della partenza
        if (snapshot.docs[i].data().citta == req.body.partenza) {
          //id partenza trovato
          id_partenza = snapshot.docs[i].id;
          console.log("luogo partenza selezionato: " + id_partenza.toString());
          break;
        }
      }
      //#endregion

      treno.db().collection('luoghi').get().then((snapshot) => {

        //#region salvo il luogo di destinazione in id_dest
        for (i = 0; i < snapshot.docs.length; i++) {
          if (snapshot.docs[i].data().citta == req.body.destinazione) {
            id_dest = snapshot.docs[i].id;
            console.log("luogo destinazione selezionato: " + id_dest.toString());
            startdest = true;
            break;
          }
        }
        //#endregion

        treno.db().collection('tratte').orderBy("data", "asc").get().then((snapshot) => {

          //#region salvo il treno che passa per le due città selezionate e con data uguale o poco superiore a quella selezionata
          for (i = 0; i < snapshot.docs.length; i++) {
            //controllo ogni tratta per ottenere l'id del treno della tratta giusta
            //cambia codice!! data non deve essere uguale, ma un pochetto superiore va bene
            var dataTratta = moment(snapshot.docs[i].data().data.toDate());
            var differenza = (dataTratta.diff(dataScelta)) / 1000;
            //console.log(snapshot.docs[i].data().data.toDate() - req.body.data.toDate());
            if (differenza < SECONDI_MAX && snapshot.docs[i].data().ek_luogo == id_partenza && differenza > 60) {
              //id treno trovato
              id_treno = snapshot.docs[i].data().ek_treno;
              console.log("trovato treno che parte da " + req.body.partenza + ", id: " + id_treno);
              break;
            }
          }
          //#endregion

          treno.db().collection('tratte').orderBy("data", "asc").get().then((snapshot) => {

            //#region salvo tutte le tratte che occuperà il nuovo cliente (se sono già libere) in tratte_ids
            start = false;
            inaccessibile = true;
            console.log("elenco tratte in mezzo ai due luoghi: ");
            for (i = 0; i < snapshot.docs.length; i++) {
              if (start && snapshot.docs[i].data().ek_treno == id_treno) {
                //non salvo la tratta destinazione, poichè l'utente scenderà in quella fermata.
                if (snapshot.docs[i].data().ek_luogo == id_dest) {
                  console.log("il percorso esiste, salvo tutti le tratte in mezzo..");
                  inaccessibile = false;
                  break;
                }
                //controllo ogni tratta e mi salvo tutte le tratte in mezzo per cui passa il treno
                console.log(snapshot.docs[i].data().ek_treno + ", ");
                tratte_ids.push(snapshot.docs[i].id);
              } else {
                start = (snapshot.docs[i].data().ek_luogo == id_partenza && snapshot.docs[i].data().ek_treno == id_treno) || start;
                //salvo nell'array anche la tratta della partenza (rendendola quindi occupata)
                if (start) tratte_ids.push(snapshot.docs[i].id);
              }
            }
            //#endregion

            //#region per quando non ci sono treni che passano per quella destinazione
            if (inaccessibile) {
              console.log("il treno che parte per " + req.body.partenza + " non passa per quella destinazione..");
              res.render("home", {
                luoghi: luoghi_str,
                p: "home",
                nome: utente_entrato.nome,
                posti: "",
                i1: "destinazione",
                i2: "partenza",
                i3: "datetime-local"
              });
            }
            //#endregion
            else {
              treno.db().collection('occupazioni').get().then((snapshot) => {

                //#region salvo gli id delle prenotazioni già effettuate che occupano una tratta in tratte_ids, salvo in prenotazioni_ids
                console.log("id di prenotazioni già presenti in mezzo a questa tratta: ");
                for (i = 0; i < snapshot.docs.length; i++) {
                  if (tratte_ids.includes(snapshot.docs[i].data().ek_tratta) && !prenotazioni_ids.includes(snapshot.docs[i].data().ek_pr)) {
                    //salvo tutti gli id delle prenotazioni che passano per tutte le tratte prenotate dal nuovo utente
                    console.log(snapshot.docs[i].data().ek_pr + ", ");
                    prenotazioni_ids.push(snapshot.docs[i].data().ek_pr);
                  }
                }
                //#endregion

                treno.db().collection('prenotazioni').get().then((snapshot) => {

                  //#region salvo in posti tutti i posti occupati dalle prenotazioni in prenotazioni_ids
                  console.log("elenco tutti gli id dei posti già occupati: ");
                  for (i = 0; i < snapshot.docs.length; i++) {
                    if (prenotazioni_ids.includes(snapshot.docs[i].id)) {
                      console.log(snapshot.docs[i].data().ek_p);
                      //salvo tutti gli id dei posti prenotati nelle prenotazioni salvate in precedenza
                      posti.push(snapshot.docs[i].data().ek_p);
                    }
                    if (i == snapshot.docs.length - 1) start = true;
                  }
                  //#endregion

                  treno.db().collection('posti').get().then((snapshot) => {

                    //#region salvo in postiDisponibili tutti i posti non presenti in posti (quelli liberi)
                    for (i = 0; i < snapshot.docs.length; i++) {
                      if (!posti.includes(snapshot.docs[i].id) && id_treno == snapshot.docs[i].data().ek_t) {
                        //visualizza tutti i posti disponibili per quel viaggio, in quel determinato treno
                        //console.log(snapshot.docs[i].data().ek_posti + ", ");
                        postiDisponibili.push(snapshot.docs[i]);
                      }
                    }
                    //#endregion
                    console.log("fine !!!!");
                    for (i = 0; i < postiDisponibili.length; i++) {
                      console.log(postiDisponibili[i].id+": num_posto: "+
                                  postiDisponibili[i].data().num_posto+
                                  ": num_carrozza: "+postiDisponibili[i].data().num_carrozza);
                    }
                    var posti_str = JSON.stringify(Object.assign({}, postiDisponibili)); // convert array to string
                    res.render("home", {
                      luoghi: luoghi_str,
                      p: "inserimento",
                      nome: utente_entrato.nome,
                      posti: posti_str,
                      i1: "Num_vagone",
                      i2: "Num_posto",
                      i3: "hidden"
                    });
                    //ora hai tutti i posti disponibili per quel viaggio
                  });
                });
              });
            }
          });
        });
      });
    });
  });

app.post("/inserimento", function(req, res) {
  var id_posto_scelto = "nontrovato",
    i;
  console.log(req.body.Num_vagone + " " + req.body.Num_posto);
  for (i = 0; i < postiDisponibili.length; i++) {
    if (postiDisponibili[i].data().num_carrozza == req.body.Num_vagone && postiDisponibili[i].data().num_posto == req.body.Num_posto) {
      id_posto_scelto = postiDisponibili[i].id;
      break;
    }
  }
  var postoFinale = id_posto_scelto;
  if (postoFinale == "nontrovato") {
    console.log("l'utente non ha scelto un posto valido");
    for (i = 0; i < tratte_ids.length; i++) {
      console.log(tratte_ids[i]);
    }
  } else {
    var id_pren = id.prenotazioni.toString();
    treno.db().collection("prenotazioni").doc(id_pren).set({
      ek_p: postoFinale,
      ek_u: utente_entrato.id
    });

    for (i = 0; i < tratte_ids.length; i++) {
      treno.db().collection("occupazioni").doc((id.occupazioni + i).toString()).set({
        ek_pr: id_pren,
        ek_tratta: tratte_ids[i]
      });
    }
    salvaId.incOccupazioni(tratte_ids.length);
    salvaId.incPrenotazioni();
  }

});


app.listen(3000, function() {
  console.log("Server started on port 80");
});
