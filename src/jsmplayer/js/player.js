// main file
( function ( $ ) {
    "use strict";
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();

    // Save the name of the Sound Model class
    var modelClass = "";
    var modelURL = "models/" + modelClass;
    $( document )
        .ready( function () {
            var $jsmDropdownTitle = $( ".dropdown-toggle:first-child" );
            $( ".dropdown-toggle" )
                .dropdown();

            var location = ( window.location.href )
                .split( [ "#" ] )[ 1 ];

            window.onhashchange = urlChange;

            function urlChange() {
                window.location.reload();
                console.log( "reload " );
            }

            if ( typeof location !== 'undefined' ) {
                // Save models
                modelClass = location;
                modelURL = "models/" + modelClass;
            } else {
                modelClass = $( ".dropdown-menu li:first-child" )
                    .text();
                modelURL = "models/" + modelClass;
            }

            // Make the top dropdown title to be the last selected sound model
            $jsmDropdownTitle
                .html( modelClass + '<span class="caret"></span>' );
            // Make the selected value to be at the top
            $( ".dropdown-menu li a" )
                .click( function () {
                    $jsmDropdownTitle
                        .html( $( this )
                            .text() + '<span class="caret"></span>' );
                    $jsmDropdownTitle
                        .val( $( this )
                            .text() );
                } );

            //console.log( "mc", typeof modelClass, modelURL );
            // Swap models
            if ( typeof modelClass !== 'undefined' ) {
                swapModels( modelClass, modelURL );
            }

        } );

    function swapModels( mc, url ) {

        require.config( {
            baseUrl: "./"
        } );

        var Model = mc;

        require( [ url ], function ( Model ) {

            var surfURL = "https://dl.dropboxusercontent.com/u/2117088/ocean_edge.mp3";
            var runURL = "https://dl.dropboxusercontent.com/u/2117088/WorkoutTrack.mp3";
            var alienURL = "https://dl.dropboxusercontent.com/u/2117088/spaceship_11.mp3";
            var voiceURL = "https://dl.dropboxusercontent.com/u/77191118/sounds/gettysburg_address.mp3";

            var bongoURL1 = "https://dl.dropboxusercontent.com/u/2117088/bongo1.wav";
            var bongoURL2 = "https://dl.dropboxusercontent.com/u/2117088/bongo2.wav";
            var bongoURL3 = "https://dl.dropboxusercontent.com/u/2117088/bongo3.wav";
            var bongoURL4 = "https://dl.dropboxusercontent.com/u/2117088/bongo4.wav";

            // Buffer error with these files!!!
            var drumURL1 = "https://dl.dropboxusercontent.com/u/2117088/drum-2-1.mp3";
            var drumURL2 = "https://dl.dropboxusercontent.com/u/2117088/drum-2-2.mp3";
            var drumURL3 = "https://dl.dropboxusercontent.com/u/2117088/drum-2-3.mp3";
            var drumURL4 = "https://dl.dropboxusercontent.com/u/2117088/drum-2-4.mp3";

            var drumurl = "";
            var keyurl = "";
            var guitar = "";

            var files = null;

            // Switch files loading for different sound models
            switch ( mc ) {
            case "Looper":
            case "Activity":
                files = runURL;
                break;
            case "Trigger":
            case "MultiTrigger":
                files = [ drumURL1, drumURL2, drumURL3, drumURL4 ];
                break;
            case "Extender":
                files = surfURL;
                break;
            case "Scrubber":
                files = voiceURL;
                break;
            }

            // Load model class
            var sndModel = new Model( context, files, null, onLoad, onAudioStart, onAudioEnd );
            var $playerParams = $( '.player-params' );

            $( "#filebtn" )
                .on( 'change', handleFileSelect );

            function onAudioStart() {
                $( "#speaker" )
                    .removeClass( "icon-nosound" )
                    .addClass( "icon-sound" );
            }

            function onAudioEnd() {
                $( "#speaker" )
                    .removeClass( "icon-sound" )
                    .addClass( "icon-nosound" );
            }

            function onLoad( status ) {
                // After sound is loaded
                console.log( "Audio file Loaded: " + status );
                // Pass in the sound model object to tie interface to the model
                generateInterface( sndModel );
                // Generate sliders again everytime a new file is loaded.
                generateParam( sndModel );
            }

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
                if ( sndModel.isPlaying ) {
                    sndModel.stop();

                }
                // Remove sliders
                $playerParams.empty();
                sndModel.setSources( localSources, null, onLoad );
            }

            function generateInterface( snd ) {
                $( document )
                    .ready( function () {
                        $( "#startbtn" )
                            .unbind( 'click' )
                            .attr( "disabled", false );
                        $( "#playbtn" )
                            .unbind( 'click' )
                            .attr( "disabled", false );
                        $( "#pausebtn" )
                            .unbind( 'click' )
                            .attr( "disabled", true );
                        $( "#stopbtn" )
                            .unbind( 'click' )
                            .attr( "disabled", true );
                        $( "#releasebtn" )
                            .unbind( 'click' )
                            .attr( "disabled", true );

                        // toggle sound
                        $( "#startbtn" )
                            .click( function () {
                                // toggle play button
                                //console.log( "play" );
                                snd.start( 0 );
                                $( "#pausebtn" )
                                    .attr( "disabled", false );
                                $( "#stopbtn" )
                                    .attr( "disabled", false );
                                $( "#releasebtn" )
                                    .attr( "disabled", false );
                            } );

                        $( "#playbtn" )
                            .click( function () {
                                // toggle play button
                                //console.log( "play" );
                                snd.play();
                                $( "#pausebtn" )
                                    .attr( "disabled", false );
                                $( "#stopbtn" )
                                    .attr( "disabled", false );
                                $( "#releasebtn" )
                                    .attr( "disabled", false );
                            } );

                        $( "#pausebtn" )
                            .click( function () {
                                //console.log( "pause" );
                                snd.pause();
                            } );
                        $( "#stopbtn" )
                            .click( function () {
                                //console.log( "stop" );
                                snd.stop( 0 );
                            } );

                        $( "#releasebtn" )
                            .click( function () {
                                //console.log( "stop" );
                                snd.release();
                            } );

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
                                // Remove sliders
                                $playerParams.empty();
                                snd.setSources( sources, onLoad );
                            } );

                    } );
            }

            function generateParam( snd ) {
                // Loop through all the properties in Sound Model
                var parambox = "";
                var allParams = snd.listParams();
                for ( var pIndex = 0; pIndex < allParams.length; pIndex++ ) {
                    var param = allParams[ pIndex ];
                    var paramName = param.name;
                    //console.log( "props existed", paramName );
                    var labelnode = "<div class='param-name'><label class='label label-info param-name'>" + paramName + "</label></div>";
                    var slider = "<div class='pull-left param-slider'><div id='" + paramName + "' class='ui-slider'></div></div>";
                    var switchBtn = "<div class='switch " + paramName + "'><input type='checkbox' checked data-toggle='switch' on-label='true' off-label='false' /></div>";
                    var outputVal = "<div class='amount'><input type='text' id='" + paramName + "val' class='form-control input-sm' /></div>";
                    // eventRand turns out to be a number!
                    if ( typeof param.value === 'number' ) { // The rest of SPAudioParam
                        $playerParams
                            .append( "<div class='param-box'>" + labelnode + slider + outputVal + "</div>" );
                        makeSlider( snd, paramName, param.value, param.minValue, param.maxValue );
                    } else if ( typeof param.value === 'boolean' ) {
                        $playerParams
                            .append( "<div class='param-box'>" + labelnode + switchBtn + outputVal + "</div>" );
                        makeSwitch( snd, paramName, param.value, param.minValue, param.maxValue );
                    }
                }
            }

            function makeSlider( snd, id, val, min, max ) {
                // Make sliders
                $( "#" + id )
                    .tickslider( {
                        step: 0.001,
                        min: min,
                        max: max,
                        value: snd[ id ].value,
                        slide: function ( event, ui ) {
                            // Update input label box
                            $( "#" + id + "val" )
                                .val( ui.value );
                            snd[ id ].value = ui.value;
                        },
                        change: function ( event, ui ) {
                            snd[ id ].value = ui.value;
                            //console.log( ui.value, snd[ id ].value );
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

            function makeSwitch( snd, id, val, min, max ) {

                // Make switch
                $( "." + id )
                    .bootstrapSwitch();

                $( "." + id )
                    .bootstrapSwitch( "setState", val, true );

                $( "#" + id + "val" )
                    .val( $( "." + id )
                        .bootstrapSwitch( "status" ) );

                $( "#" + id + "val" )
                    .change( function ( event, ui ) {
                        //console.log( "change", event.target.value );
                        if ( event.target.value === "false" ) {
                            $( "." + id )
                                .bootstrapSwitch( "setState", false, true );
                            snd[ id ].value = false;
                        } else if ( event.target.value === "true" ) {
                            $( "." + id )
                                .bootstrapSwitch( "setState", true, true );
                            snd[ id ].value = true;
                        }

                    } );
                $( "." + id )
                    .on( "switch-change", function ( event, data ) {
                        $( "#" + id + "val" )
                            .val( data.value );
                        snd[ id ].value = data.value;
                        //console.log( "data ", data.value, snd[ id ].value );
                    } );

            }

        } ); // end requirejs

    }

} )( jQuery );
