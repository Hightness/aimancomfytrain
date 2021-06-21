const treno = require(__dirname + "/accessoDatabase.js");
const id = require(__dirname + "/views/ultimiId.json");
const salvaId = require(__dirname + "/salvaId.js");
treno.inizializza();
var i,j;
for(i=1;i<=5;i++){
  for(j=1;j<=10;j++){
    treno.db().collection("posti").doc((id.posti+ (i-1)*10+j -1).toString()).set({
      ek_t: "1",
      num_carrozza:i.toString(),
      num_posto:j.toString()
    });
  }
}
salvaId.incPosti(50);
console.log("finito..");
