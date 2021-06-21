const admin = require("firebase-admin");
const chiavi = require("./views/trenoelaborato_chiave.json");
exports.inizializza = function(){
  admin.initializeApp({
    credential: admin.credential.cert(chiavi)
  });
  db = admin.firestore();
};
exports.db = function(){
  return db;
};
