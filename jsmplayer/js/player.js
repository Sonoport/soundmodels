// main file
//'use strict';

var AudioContext = webkitAudioContext || AudioContext;
var context = new AudioContext();

$( document )
    .ready( function () {
        // select options dropdown menu for selecting sound models
        $( "select[name='jsm']" )
            .selectpicker( {
                style: 'btn-lg btn-primary',
                menuStyle: 'dropdown-inverse'
            } );
    } );
// Test loading of Looper class
require.config( {
    baseUrl: "./"
} );
require( [ "models/Looper", "core/SPAudioParam" ], function ( Looper, SPAudioParam ) {

    var surfURL = "https://dl.dropboxusercontent.com/u/2117088/ocean_edge.mp3";
    var runURL = "https://dl.dropboxusercontent.com/u/2117088/WorkoutTrack.mp3";
    var alienURL = "https://dl.dropboxusercontent.com/u/2117088/spaceship_11.mp3";

    // Looper
    var lp = new Looper( runURL, onLoad, null, context );

    var generatedOnce = 0;

    function onLoad( status ) {
        // After sound is loaded
        console.log( "Looper Loaded :" + status );
        generatedOnce++;
        // Generate the sliders on the first load
        if ( generatedOnce === 1 ) {
            generateParam( lp );
        }
    }
    // Pass in the sound model object to tie interface to the model
    generateInterface( lp );

    function generateInterface( snd ) {
        $( document )
            .ready( function () {
                // toggle sound
                $( "#playbtn" )
                    .click( function () {
                        // toggle play button
                        console.log( "play" );
                        snd.play();
                    } );
                $( "#pausebtn" )
                    .click( function () {
                        console.log( "pause" );
                        snd.pause();
                    } );
                $( "#stopbtn" )
                    .click( function () {
                        console.log( "stop" );
                        snd.stop( 0 );
                    } );

                function handleFileSelect( evt ) {
                    // Load local sources
                    var localSources = [];
                    // FileList object
                    var files = evt.target.files;
                    // files is a FileList of File objects.
                    var output = [];
                    for ( var i = 0; i < files.length; i++ ) {
                        var f = files[ i ];
                        localSources.push( f );
                    }
                    // Stop sound before setting source
                    if ( snd.isPlaying ) {
                        snd.stop();

                    }
                    snd.setSources( localSources, onLoad, null, context );

                }

                $( "#filebtn" )
                    .on( 'change', handleFileSelect );

                // Set Looper url sources
                $( "#updateSource" )
                    .on( "click", function () {
                        // Get urls
                        var sourceurls = $( "#fileUrls" )
                            .val();
                        var sources = sourceurls.split( "," );
                        //console.log( sources, snd.isPlaying );
                        // Stop sound before setting source
                        if ( snd.isPlaying ) {
                            snd.stop();

                        }
                        //console.log( "stop", lp.isPlaying );
                        snd.setSources( sources, onLoad, null, context );
                    } );

            } );
    }

    function generateParam( snd ) {
        // Loop through all the properties in Sound Model
        for ( var param in snd ) {
            var prop = snd[ param ];
            var parameterType = Object.prototype.toString.call( prop );
            // Get properties that are of SPAudioParam
            if ( prop instanceof SPAudioParam ) {
                //console.log( "props existed", param );
                var labelnode = "<div class='param-name'><label class='label label-info param-name'>" + param + "</label></div>";
                var slider = "<div class='pull-left param-slider'><div id='" + param + "' class='ui-slider'></div></div>";
                var outputVal = "<div class='amount'><input type='text' id='" + param + "val' class='form-control input-sm' /></div>";
                $( ".player-params" )
                    .append( "<div class='param-box'>" + labelnode + slider + outputVal + "</div>" );
                makeSlider( snd, param, prop.value, prop.minValue, prop.maxValue, 0.1 );
            }
        }

    }

    function makeSlider( snd, id, val, min, max, step ) {
        // Make sliders
        $( "#" + id )
            .tickslider( {
                min: min,
                max: max,
                value: snd[ id ].value,
                slide: function ( event, ui ) {
                    // Update input label box
                    $( "#" + id + "val" )
                        .val( ui.value );
                },
                change: function ( event, ui ) {
                    snd[ id ].value = ui.value;
                    console.log( ui.value, lp.playSpeed.value, snd[ id ].value );
                }
            } );
        // Update text input when slider is sliding
        $( "#" + id + "val" )
            .val( $( "#" + id )
                .tickslider( "value" ) );
        // Update Slider thumb with text input
        $( "#" + id + "val" )
            .change( function () {
                $( "#" + id )
                    .tickslider( "value", this.value );
            } );
    }

} );
