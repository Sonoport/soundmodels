require.config({
	baseUrl: 'src/lib/'
	
});
 
require(['models/Looper', 'core/FileReader'], function (Looper) {

var context;
var lp;

window.AudioContext = window.AudioContext||window.webkitAudioContext;
context = new AudioContext();

function loadDogSound(url) {
  
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
  
      // buffer only
      //lp = new Looper([buffer], onLoad);

      // buffer and link
      lp = new Looper([buffer, 'http://localhost:8383/javascript-sound-models/bullet.mp3'], onLoad);
  

    }, onError);
  };
  request.send();
}

function onError() {
  
  
  
}

loadDogSound('http://localhost:8383/javascript-sound-models/short.mp3');
//loadDogSound('http://localhost:8383/javascript-sound-models/long.mp3');
//loadDogSound('http://localhost:8383/javascript-sound-models/bullet.mp3');

function onLoad(bResult) {
  
  console.log("Loaded file: " + bResult);
  
}
  
  
  function handlePlay(e) {
    
    lp.play();
   
  }
  
  function handleStop(e) {
    
      lp.stop();
   
  }
  
  function handlePause(e) {
    
      lp.pause();
   
  }
  
  function handlePlaySpeed(e) {
      
      var nTime = Math.random() * 5;
      
      console.log("Setting playSpeed to " + nTime);
      
      lp.playSpeed = nTime;
      
  }
  
  function handleRiseTime(e) {
      
      var nTime = Math.random() * 5;
      
      console.log("Setting riseTime to " + nTime);
      
      lp.riseTime = nTime;
   
  }
  
  function handleDecayTime(e) {
      
      var nTime = Math.random() * 5;
      
      console.log("Setting decayTime to " + nTime);
      
      lp.decayTime = nTime;
   
  }
  
  function handleStartPoint(e) {
      
      var nTime = Math.random() * 1;
      
      console.log("Setting startPoint to " + nTime);
      
      lp.startPoint = nTime;
   
  }
  
  function handleRelease(e) {
    
      lp.release(5);
   
  }
  
  function handleGain(e) {
    
    //lp.multiTrackGain[5] = 666;
    
    for (var i = 0; i < lp.multiTrackGain.length; i++) {
      
      lp.multiTrackGain[i] = Math.random() * 1;
      
    }
    
    console.log("Setting individual gains to: " + lp.multiTrackGain);
   
  }

  document.getElementById('bPlay').addEventListener('click', handlePlay, false);
  document.getElementById('bStop').addEventListener('click', handleStop, false);
  document.getElementById('bPause').addEventListener('click', handlePause, false);
  document.getElementById('bRelease').addEventListener('click', handleRelease, false);
  
  document.getElementById('bPlaySpeed').addEventListener('click', handlePlaySpeed, false);
  document.getElementById('bRiseTime').addEventListener('click', handleRiseTime, false);
  document.getElementById('bDecayTime').addEventListener('click', handleDecayTime, false);
  document.getElementById('bStartPoint').addEventListener('click', handleStartPoint, false);
  document.getElementById('bGain').addEventListener('click', handleGain, false);
  
});