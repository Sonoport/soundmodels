( function () {
    "use strict";

    var AudioContext = webkitAudioContext || AudioContext;
    var context = new AudioContext();

    var scrubber;

    require( [ "models/Scrubber" ], function ( Scrubber ) {

        //console.log(Looper);

        //var url = "https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Marked.mp3";
        // var url = "https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Original.wav";
        // var url = "https://dl.dropboxusercontent.com/u/77191118/DeepIntoIt.wav";

        var url = "https://dl.dropboxusercontent.com/u/77191118/sounds/gettysburg_address.mp3";
        // Single test
        scrubber = new Scrubber( url, context, function () {
            var slider = document.getElementById( 'scrubber' );
            slider.disabled = false;

            slider.addEventListener( 'input', function () {
                if ( !scrubber.isPlaying ) {
                    scrubber.play();
                }
                scrubber.playPosition.value = parseFloat( slider.value );
            } );
        } );

    } );
} )();
