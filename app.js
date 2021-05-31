//jshint esversion: 6
const express = require("express");
const bodyParser = require("body-parser");
const functions = require("firebase-functions");
const ejs = require("ejs");
const md5=require("md5");
const app = express();
const salvaId = require(__dirname + "/salvaId.js");
const id = require(__dirname + "/views/ultimiId.json");
const def = require(__dirname + "/impostaDefault.js");
const treno = require(__dirname + "/accessoDatabase.js");
app.set('views', __dirname+"\\views");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


treno.inizializza();
var citta = [];
var i;
var stop=true;
treno.db().collection('luoghi').get('citta').then((snapshot) => {
  for(i=0;i<snapshot.docs.length;i++){
    citta.push(snapshot.docs[i].data().citta);
  }
});
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


app.get("/", function(req, res){

    res.render("login",{user:""});
});
app.route("/login")
  .post(function(req,res){
    treno.db().collection('utenti').get().then((snapshot) => {
      var cont=0;
      snapshot.docs.forEach(doc => {
        cont++;
        if(doc.data().email == req.body.email ){
          console.log("trovato");
          if(md5(req.body.pass) == doc.data().password){
            res.render("home",{citta:citta});
          }else{
            res.render("login",{user:req.body.email,passwd:""});
          }
        }
        if(cont== snapshot.docs.length){
          res.render("register",{utente:req.body.email,passwd:""})
        }

      })
    });
  })
app.route("/register")
    .get(function(req, res){
        res.render("register",{utente:"",passwd:""});
    })
    .post(function(req,res){
        const utente1 = {
            nome: req.body.nome,
            cognome: req.body.cognome,
            residenza:req.body.residenza,
            password: md5(req.body.password),
            email:req.body.email
        };
        treno.db().collection('utenti').get().then((snapshot) => {
          var cont=0;
          var lunghezza_doc= snapshot.docs.length;
          if(lunghezza_doc==0){
            treno.db().collection("utenti").doc(id.utenti.toString()).set(utente1);
            salvaId.incUtenti();
            res.render("home",{citta:citta});
          }
          snapshot.docs.forEach(doc => {
            cont+=1;
            console.log(cont.toString());
            if(doc.data().email == utente1.email){
              res.render("login",{user:utente1.email});
            }
            else if(cont==lunghezza_doc){
              treno.db().collection("utenti").doc(id.utenti.toString()).set(utente1);
              salvaId.incUtenti();
              res.render("home",{citta:citta});
            }
          })
        });
    });
app.route("/home")
  .get(function(req, res){
    res.render("home",{citta:citta});
  })

  .post(function(req,res){
    var i;
    var id_partenza,id_dest,id_treno;
    var tratte_ids=[];
    var start=false,start2=false,inaccessibile=true,startdest=false;
    treno.db().collection('luoghi').get().then((snapshot) => {
      for(i=0;i<snapshot.docs.length;i++){
        //controllo ogni luogo per ottenere l'id della partenza
        if(snapshot.docs[i].data().citta == req.body.partenza){
          //id partenza trovato
          id_partenza= snapshot.docs[i].id;
          console.log("luogo selezionato: "+id_partenza.toString());
          start=true;
          break;
        }
      }});


      treno.db().collection('luoghi').get().then((snapshot) => {
        for(i=0;i<snapshot.docs.length;i++){
          if(snapshot.docs[i].data().citta == req.body.partenza){
            id_dest= snapshot.docs[i].id;
            console.log("luogo destinazione selezionato: "+id_dest.toString());
            startdest=true;
            break;
          }
        }});
      console.log("ancora no..");
      while(!start)continue;
      console.log("fatto");
      start=false;
      treno.db().collection('tratte').get().then((snapshot) => {
        for(i=0;i<snapshot.docs.length;i++){
          //controllo ogni tratta per ottenere l'id del treno della tratta giusta
//cambia codice!! data non deve essere uguale, ma un pochetto superiore va bene
          if(dates.compare(snapshot.docs[i].data().data.toDate(),req.body.data.toDate())==0 && snapshot.docs[i].data().ek_luogo == id_partenza){
            //id treno trovato
            id_treno= snapshot.docs[i].data().ek_treno;
            start=true;
            break;
          }
        }
      });
      while(!start || !startdest)continue;
      start=false;
      var cont=0;
      treno.db().collection('tratte').get().orderBy('data').then((snapshot) => {
        for(i=0;i<snapshot.docs.length;i++){
          if(start2 && snapshot.docs[i].data().ek_treno == id_treno){
            cont++;
            if(cont== snapshot.docs.length){
              start=true;
              break;
            }
            //controllo ogni tratta e mi salvo tutte le tratte in mezzo per cui passa il treno
            //non salvo la tratta destinazione, poichè l'utente scenderà in quella fermata.
            if(snapshot.docs[i].data().ek_treno == id_dest){
              start= true;
              inaccessibile=false;
              break;
            }
          }else{
            tratte_ids.push(snapshot.docs[i].data().ek_treno);
            start2 = snapshot.docs[i].data().ek_luogo == id_partenza;
          }
        }
        snapshot.docs.every(doc => {

        })
      });
      if(inaccessibile){
        console.log("il treno che parte per "+ req.body.partenza +" non passa per quella destinazione..");
        //stop!!!!
      }

      var prenotazioni_ids=[];
      while(!start)continue;
      start=false;
      treno.db().collection('occupazioni').get().then((snapshot) => { //salvo gli id delle prenotazioni già effettuate che passano per una di quelle città richieste dall'utente nuovo
        for(i=0;i<snapshot.docs.length;i++){
          if(tratte_ids.includes(snapshot.docs[i].data().ek_tratte)){
            //salvo tutti gli id delle prenotazioni che passano per tutte le tratte prenotate dal nuovo utente
            prenotazioni_ids.push(doc._fieldsProto.ek_prenotazioni.stringValue);
          }
          if(i==snapshot.docs.length-1)start=true;
        }
      });
      while(!start)continue;
      start=false;
      treno.db().collection('prenotazioni').get().then((snapshot) => {
        for(i=0;i<snapshot.docs.length;i++){
          if(prenotazioni_ids.includes(snapshot.docs[i].id)){
            //salvo tutti gli id dei posti prenotati nelle prenotazioni salvate in precedenza
            posti.push(snapshot.docs[i].data().ek_posti);
          }
          if(i==snapshot.docs.length-1)start=true;
        }
      });
      while(!start)continue;
      start=false;
      treno.db().collection('posti').get().then((snapshot) => {
        for(i=0;i<snapshot.docs.length;i++){
          if(!posti.includes(snapshot.docs[i].id && id_treno == snapshot.docs[i].data().ek_treno)){
            //visualizza tutti i posti disponibili per quel viaggio, in quel determinato treno
            console.log(snapshot.docs[i].data().ek_posti+", ");
            posti.push(snapshot.docs[i].data().ek_posti);
          }
          if(i==snapshot.docs.length-1)start=true;
        }
      });
      while(!start)continue;
      //ora hai tutti i posti disponibili per quel viaggio
    });


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 80");
});
