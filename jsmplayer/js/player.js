// main file
//'use strict';

var AudioContext = webkitAudioContext || AudioContext;
var context = new AudioContext();

/*
$( "select[name='herolist']" )
    .selectpicker( {
        style: 'btn-primary',
        menuStyle: 'dropdown-inverse'
    } );

// Toggle classes

$( function () {
    var select = $( "#minbeds" );
    var slider = $( "<div id='slider' class='ui-slider'></div>" )
        .insertAfter( select )
        .slider( {
            min: 1,
            max: 6,
            range: "min",
            value: select[ 0 ].selectedIndex + 1,
            slide: function ( event, ui ) {
                select[ 0 ].selectedIndex = ui.value - 1;
            }

        } );
    $( "#minbeds" )
        .change( function () {
            slider.slider( "value", this.selectedIndex + 1 );
        } );
} );
*/
// Test loading of Looper class
require.config( {
    baseUrl: "./"
} );
require( [ "models/Looper", "core/SPAudioParam" ], function ( Looper, SPAudioParam ) {

    var surfURL = "https://dl.dropboxusercontent.com/u/2117088/ocean_edge.mp3";
    var runURL = "https://dl.dropboxusercontent.com/u/2117088/WorkoutTrack.mp3";
    var alienURL = "https://dl.dropboxusercontent.com/u/2117088/spaceship_11.mp3";

    // Looper
    var lp = new Looper( surfURL, onLoad, null, context );

    function onLoad( status ) {
        console.log( "Looper Loaded :" + status );

        // After the files have loaded generate param
        generateParam();
    }
    // toggle sound
    $( "#playbtn" )
        .click( function () {
            // toggle play button
            console.log( "play" );
            lp.play();
        } );
    $( "#pausebtn" )
        .click( function () {
            console.log( "pause" );
            lp.pause();
        } );
    $( "#stopbtn" )
        .click( function () {
            console.log( "stop" );
            lp.stop( 0 );
        } );

    // Load local sources
    var localSources = [];

    function handleFileSelect( evt ) {
        // FileList object
        var files = evt.target.files;

        // files is a FileList of File objects.
        var output = [];
        for ( var i = 0; i < files.length; i++ ) {
            var f = files[ i ];
            localSources.push( f );
        }

        lp.setSources( localSources, onLoad, null, context );

    }

    $( "#filebtn" )
        .on( 'change', handleFileSelect );

    // Set Looper url sources
    $( "#updateSource" )
        .on( "click", function () {
            // Get urls
            var sourceurls = $( "#fileUrls" )
                .val();
            console.log( sourceurls );
            var sources = sourceurls.split( "," );
            console.log( sources );

            lp.setSources( sources, onLoad, null, context );
        } );

    function generateParam() {
        // Loop through all the properties in Looper
        for ( var param in lp ) {
            var prop = lp[ param ];
            var parameterType = Object.prototype.toString.call( prop );
            // Get properties that are of SPAudioParam
            if ( prop instanceof SPAudioParam ) {
                //console.log( "props existed", param );
                var labelnode = "<label class='param-name'>" + param + "</label>";
                var slider = "<div id='" + param + "' class='ui-slider'></div>";
                var outputVal = "<input type='text' id='" + param + "val' class='amount' />";
                $( ".player-params" )
                    .append( "<div class='param-box'>" + labelnode + slider + outputVal + "</div>" );
                makeSlider( param, prop.value, prop.minValue, prop.maxValue, 0.1 );
            }
        }

    }

    function makeSlider( id, val, min, max, step ) {
        $( "#" + id )
            .slider( {
                range: "true",
                value: val,
                min: min,
                max: max,
                step: step,
                slide: function ( event, ui ) {
                    $( "#" + id + "val" )
                        .val( ui.value );
                }
            } );

        $( "#" + id + "val" )
            .val( $( "#" + id )
                .slider( "value" ) );
    }

} );
