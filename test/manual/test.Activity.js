( function () {
    "use strict";

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if ( !window.context ) {
        window.context = new AudioContext();
    }

    var activity;

    require( [ 'models/Activity' ], function ( Activity ) {

        var url = 'https://dl.dropboxusercontent.com/u/77191118/sounds/DeepIntoIt.wav';
        // Single test
        activity = new Activity( context, url, function ( progressEvent, sound ) {
            console.log( "Loading.. ", sound, ( progressEvent.loaded / progressEvent.total ) );
        }, function () {
            var slider = document.getElementById( 'activity' );
            slider.disabled = false;
            activity.easeOut.value = 10;
            slider.addEventListener( 'input', function () {
                if ( !activity.isPlaying ) {
                    activity.play();
                }
                activity.action.value = parseFloat( slider.value );
            } );
        }, function () {
            console.log( "Starting...", context.currentTime );
        }, function () {
            console.log( "Ended...", context.currentTime );
        } );

    } );
} )();
