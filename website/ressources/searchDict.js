function getAutocomplete() {
  $.getJSON('ressources/searchDict.json', function(data) {         
    let currentText = $("#search").val();
    if (!(currentText.length == 0)) {
      handleAutoComplete(currentText, data);
    } else {
      $('#autocomplete-items').empty();
    }
  });
}

function handleAutoComplete(currentText, data) {
  let nameMatches = [];
    let pathMatches = [];
    for (let i=0; i<data.nameArray.length; i++) {
      let name = data.nameArray[i];
      let path = data.pathArray[i];
      let sliced = name.slice(0, currentText.length);
      if (sliced.trim() === currentText.trim()) {
        nameMatches.push(name);
        pathMatches.push(path);
      }
    }
    $('#autocomplete-items').empty();
    for (i=0; i<nameMatches.length; i++) {
      $('#autocomplete-items').append(`<a href=${pathMatches[i]}><div>${nameMatches[i]}</div></a>`);
    }
}
