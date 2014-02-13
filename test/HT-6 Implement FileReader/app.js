require(['src/lib/core/FileReader'], function (FileReader) {

var context;

window.AudioContext = window.AudioContext||window.webkitAudioContext;
context = new AudioContext();

var fr = new FileReader(context);
    
//fr.open("https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Original.wav");  
fr.open("https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Marked.mp3");
  
  function handleClick(e) {
    
    // Start your engines
    if(fr.isLoaded()) {
      
      var source = fr.context.createBufferSource();
      source.loop = true;
      source.buffer = fr.getBuffer();
      source.connect(fr.context.destination);
      source.start(0);
      
    }
   
  }

  document.getElementById('bPlay').addEventListener('click', handleClick, false);
  
});