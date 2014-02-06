require(['src/lib/core/FileReader'], function (fr) {

function handleFileSelect(evt) {
    
  fr.open(evt.target.files);
//  alert(fr.getFiles().length);
    var aFiles = fr.getFiles();
    console.log(aFiles[0].name);

  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);

});