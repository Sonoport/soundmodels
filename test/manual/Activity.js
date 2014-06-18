( function () {
    "use strict";

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();

    var activity;

    require( [ "models/Activity" ], function ( Activity ) {

        var url = "https://dl.dropboxusercontent.com/u/77191118/DeepIntoIt.wav";
        // Single test
        activity = new Activity( url, context, function () {
            var slider = document.getElementById( 'activity' );
            slider.disabled = false;

            slider.addEventListener( 'input', function () {
                if ( !activity.isPlaying ) {
                    activity.play();
                }
                activity.action.value = parseFloat( slider.value );
            } );
        } );

    } );
} )();
