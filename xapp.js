var dogBarkingBuffer = null;
// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var source;
var startOffset = 0;
var startTime = 0;
var bPaused = false;
var pbRate = 1;

function playSound(buffer) {
  echo("start before");
  startTime = context.currentTime;
  
  echo("start after");
  source = context.createBufferSource(); // creates a sound source
  source.buffer = buffer;     
  source.playbackRate.value = pbRate;// tell the source which sound to play
  source.connect(context.destination);  
//  source.playbackRate.value = 3;// connect the source to the context's destination (the speakers)
  
  
//  startOffset += source.playbackRate.value * 3.6;
  console.log(startOffset);
//  source.start(0);                           // play the source now
   source.start(0, startOffset % buffer.duration * source.playbackRate.value);                                          // note: on older systems, may have to use deprecated noteOn(time);
}

function onError() {
  
  
  
}

function loadDogSound(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      
      dogBarkingBuffer = buffer;
      playSound(buffer);
    }, onError);
  };
  request.send();
}

function handlePlay(e) {
    
      playSound(dogBarkingBuffer);
   
  }

function handlePause(e) {
    
  if (!bPaused) {
     source.stop();
       echo("pause before");
      startOffset += context.currentTime - startTime;
       echo("pause after");
       bPaused = true;
     } else {
       
       playSound(dogBarkingBuffer);
       bPaused = false;
       
     }
       
  };
  
  function handlePlaySpeed(e) {
      
      var nTime = Math.random() * 5;
      
      console.log("Setting playSpeed to " + nTime);
      
      pbRate = nTime;
      
   
  }
  
 function echo(name) {
   
   console.log("*** " + name);
   console.log("startOffset: " + startOffset);
   console.log("context.currentTime: " + context.currentTime);
   console.log("startTime: " + startTime);
   
   
 } 
  
  document.getElementById('bPlay').addEventListener('click', handlePlay, false);
document.getElementById('bPause').addEventListener('click', handlePause, false);
document.getElementById('bPlaySpeed').addEventListener('click', handlePlaySpeed, false);

loadDogSound('http://localhost:8383/javascript-sound-models/long.mp3');