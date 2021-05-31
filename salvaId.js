var fs= require ("fs");
var data=fs.readFileSync(__dirname + "/views/ultimiId.json");
var ids= JSON.parse(data);
exports.incUtenti = function(){
  ids.utenti ++;
  data = JSON.stringify(ids);
  fs.writeFile(__dirname + "/views/ultimiId.json",data,callback);
  function callback(err){
    if(err){
      console.log(err);
    }else{
      console.log("successo");
    }
  }
}

exports.incTreni = function(){
  ids.treni ++;
  data = JSON.stringify(ids);
  fs.writeFile(__dirname + "/views/ultimiId.json",data,callback);
  function callback(err){
    if(err){
      console.log(err);
    }else{
      console.log("successo");
    }
  }
}

exports.incOccupazioni = function(){
  ids.occupazioni ++;
  data = JSON.stringify(ids);
  fs.writeFile(__dirname + "/views/ultimiId.json",data,callback);
  function callback(err){
    if(err){
      console.log(err);
    }else{
      console.log("successo");
    }
  }
}

exports.incPosti = function(){
  ids.posti ++;
  data = JSON.stringify(ids);
  fs.writeFile(__dirname + "/views/ultimiId.json",data,callback);
  function callback(err){
    if(err){
      console.log(err);
    }else{
      console.log("successo");
    }
  }
}

exports.incPrenotazioni = function(){
  ids.prenotazioni ++;
  data = JSON.stringify(ids);
  fs.writeFile(__dirname + "/views/ultimiId.json",data,callback);
  function callback(err){
    if(err){
      console.log(err);
    }else{
      console.log("successo");
    }
  }
}

exports.incTratte = function(){
  ids.tratte ++;
  data = JSON.stringify(ids);
  fs.writeFile(__dirname + "/views/ultimiId.json",data,callback);
  function callback(err){
    if(err){
      console.log(err);
    }else{
      console.log("successo");
    }
  }
}

exports.incLuoghi = function(n){
  ids.luoghi+=n;
  data = JSON.stringify(ids);
  fs.writeFile(__dirname + "/views/ultimiId.json",data,callback);
  function callback(err){
    if(err){
      console.log(err);
    }else{
      console.log("successo");
    }
  }
}
