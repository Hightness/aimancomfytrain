var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};
var luoghi_str = document.getElementById('luoghi').value;
var luoghi_JSON = JSON.parse(luoghi_str);
var luoghi_array = [];
var i;
for(i=0;i<luoghi_JSON.length;i++){
  luoghi_array.push(luoghi_JSON[i]);
}

$('#ricerca .typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
},
{
  name: 'luoghi',
  source: substringMatcher(luoghi_JSON)
});
