( function () {
    "use strict";

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if ( !window.context ) {
        window.context = new AudioContext();
    }

    require( [ 'models/Looper', 'core/SPAudioBuffer', 'effects/Compressor' ], function ( Looper, SPAudioBuffer, Compressor ) {

        var workout = new SPAudioBuffer( window.context, 'https://dl.dropboxusercontent.com/u/77191118/sounds/DeepIntoItUncompressed.mp3' );
        // var guitar = 'https://dl.dropboxusercontent.com/u/77191118/sounds/guitar.mp3';
        // var piano = 'https://dl.dropboxusercontent.com/u/77191118/sounds/piano.mp3';

        var compressor = new Compressor( context );

        var looper = new Looper( context, workout, function ( progressEvent, sound ) {
            console.log( "Loading.. ", sound, ( progressEvent.loaded / progressEvent.total ) );
        }, function () {
            console.log( "Loaded..." );
            compressor.ratio.value = 12;
            compressor.threshold.value = -48;
            // compressor.ratio.setValueAtTime( 2, context.currentTime + 1 );
            // compressor.ratio.setTargetAtTime( 14, context.currentTime + 10, 0.5 );

            var compressorSlider = document.getElementById( 'compressor' );
            compressorSlider.disabled = false;

            compressorSlider.addEventListener( 'input', function () {
                compressor.ratio.value = parseFloat( compressorSlider.value );
            } );
            looper.play();
        }, function () {
            console.log( "Starting...", context.currentTime );
        }, function () {
            console.log( "Ended...", context.currentTime );
        }, function ( event, track ) {
            console.log( "Track end... ", track );
        } );

        looper.setOutputEffect( compressor );
        window.compressor = compressor;
    } );
} )();
