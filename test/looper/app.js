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
      lp = new Looper([buffer], onLoad);

      // buffer and link
      //lp = new Looper([buffer, 'http://localhost:8383/javascript-sound-models/bullet.mp3'], onLoad);
      //lp = new Looper([buffer, 'http://localhost:8383/javascript-sound-models/bullet.mp3'], function(){});
      //lp = new Looper('https://dl.dropboxusercontent.com/u/77191118/deep_loop.wav', function() {});

    }, onError);
  };
  request.send();
}

function onError() {};

//lp = new Looper('https://dl.dropboxusercontent.com/u/77191118/deep_loop.wav', function() {console.log("hello!!");});
//loadDogSound('http://localhost:8383/javascript-sound-models/short.mp3');
//loadDogSound('http://localhost:8383/javascript-sound-models/long.mp3');
loadDogSound('http://localhost:8383/javascript-sound-models/bullet.mp3');

function onLoad(bResult) {
  
  console.log("Loaded file: " + bResult);
  
}
  
  
  function handlePlay(e) {
    
    lp.decayTime.value = 5;
    lp.riseTime.value = 5;
    lp.play();
    
    for (var i = 0; i < lp.multiTrackGain.length; i++) {
      
      var nTime = 0.5;
      lp.multiTrackGain[i].value = nTime;
      
    }
   
  }
  
  function handleStop(e) {
    
    var nTime = Math.random() * 20;
    
    console.log("Stopping in " + (context.currentTime + nTime) );
    
    lp.stop(context.currentTime + nTime);
   
  }
  
  function handlePause(e) {
    
      lp.pause();
   
  }
  
  function handlePlaySpeed(e) {
      
      var nTime = Math.random() * 5;
      
      console.log("Setting playSpeed to " + nTime);
      
      lp.playSpeed.exponentialRampToValueAtTime( nTime);
      
  }
  
  function handleRiseTime(e) {
      
      var nTime = Math.random() * 10;
      
      console.log("Setting riseTime to " + nTime);
      
      lp.riseTime.value = nTime;
   
  }
  
  function handleDecayTime(e) {
      
      var nTime = Math.random() * 10;
      
      console.log("Setting decayTime to " + nTime);
      
      lp.decayTime.value = nTime;
      
  }
  
  function handleStartPoint(e) {
      
    var nTime = Math.random() * 1;
      
    console.log("Setting startPoint to " + nTime);
      
    lp.startPoint.value = nTime;
    //lp.startPoint.exponentialRampToValueAtTime( nTime);
  
  }
  
  function handleRelease(e) {
    
      var nTime = Math.random() * 1;
    
      console.log("Setting release to " + nTime);
      
      lp.release(nTime);
   
  }
  
  function handleGain(e) {
    
    for (var i = 0; i < lp.multiTrackGain.length; i++) {
      
      var nTime = Math.random() * 1;
      
      console.log("Setting gain to " + nTime);
      
      lp.multiTrackGain[i].value = nTime; 
      //lp.multiTrackGain[i].exponentialRampToValueAtTime(nTime); 
      
    }
    
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