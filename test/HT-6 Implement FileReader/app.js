require(['src/lib/core/FileReader'], function (fr) {

var context;

window.AudioContext = window.AudioContext||window.webkitAudioContext;
context = new AudioContext();
    
//fr.setContext(context);


//fr.open("https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Original.wav");  
fr.open("https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Marked.mp3");
  
  function handleClick(e) {
    
    // Start your engines
    if (fr.isLoaded()) {
      
      var source = fr.getContext().createBufferSource();

      source.loop = true;
      source.buffer = fr.getBuffer();
      source.connect(fr.getContext().destination);
      source.start(0);
      
    }

  }

  document.getElementById('bPlay').addEventListener('click', handleClick, false);
  
});