require(['src/lib/core/FileReader'], function (fr) {

  //fr.open("https://webservice.buddyplatform.com/Service/v1/BuddyService.ashx?Sound_Sounds_GetSound&BuddyApplicationName=Sonoport Buddy AIR App&BuddyApplicationPassword=685F0B35-EE01-4A93-8F53-FF6098A06790&SoundName=nyc_city_ambience_car_horn_07&Quality=High");
  fr.open("http://localhost:8383/javascript-sound-models/long.mp3");
  function handleClick(e) {
    
    fr.play();

  }

  document.getElementById('bPlay').addEventListener('click', handleClick, false);
  
});