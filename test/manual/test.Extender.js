( function () {
    "use strict";

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if ( !window.context ) {
        window.context = new AudioContext();
    }

    var extender;

    require( [ "models/Extender" ], function ( Extender ) {

        var url = "https://dl.dropboxusercontent.com/u/77191118/sounds/Ocean_Surf.mp3";

        extender = new Extender( context, url, function ( progressEvent, sound ) {
            console.log( "Loading.. ", sound, ( progressEvent.loaded / progressEvent.total ) );
        }, function () {
            var slider = document.getElementById( 'extender' );
            slider.disabled = false;
            extender.play();

            slider.addEventListener( 'input', function () {
                extender.eventPeriod.value = parseFloat( slider.value );
            } );
        }, function () {
            console.log( "Starting...", context.currentTime );
        }, function () {
            console.log( "Ended...", context.currentTime );
        } );

        window.setTimeout( function () {
            console.log( "pausing" );
            extender.release();
        }, 2000 );

    } );
} )();
