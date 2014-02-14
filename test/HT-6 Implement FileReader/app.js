require(['src/lib/core/FileReader'], function (FileReader) {

var context;

window.AudioContext = window.AudioContext||window.webkitAudioContext;
context = new AudioContext();

var fr = new FileReader(context);
var source;

//fr.open("https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Original.wav");  
fr.open("https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Marked.mp3", helloWorld);
  
function helloWorld() {
  
  console.log("File finished loading");
  
  source = fr.context.createBufferSource();
  source.loop = true;
  source.buffer = fr.getBuffer();
  source.connect(fr.context.destination);
 
  
}  
  
  function handleClick(e) {
    
    console.log("Clicked");
     source.start(0);
   
  }

  document.getElementById('bPlay').addEventListener('click', handleClick, false);
  
});