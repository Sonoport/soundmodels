/**
 * @class SoundQueue
 * @description A sound model which loads a sound file and allows it to be looped continuously at variable speed.
 * @module Looper
 */
define( [ 'core/Config', 'models/Looper', 'core/FileLoader', 'core/SPEvent' ],
    function ( Config, Looper, FileLoader, SPEvent ) {
        "use strict";

        function SoundQueue( context, numberOfVoices ) {
            if ( !( this instanceof SoundQueue ) ) {
                throw new TypeError( "SoundQueue constructor cannot be called as a function." );
            }

            if ( typeof numberOfVoices === "undefined" ) {
                numberOfVoices = Config.MAX_VOICES;
            }

            // Private Variables
            var self = this;

            var eventQueue_ = [];
            var busyVoices_ = [];
            var freeVoices_ = [];

            var vIndex;

            // Private Functions

            function soundQueueCallback( timestamp ) {
                processEventsTill( context.currentTime + 1 / Config.NOMINAL_REFRESH_RATE );
                window.requestAnimationFrame( soundQueueCallback );
            }

            var init = function () {
                for ( var i = 0; i < numberOfVoices; i++ ) {
                    freeVoices_[ i ] = new Looper( null, null, onVoiceEnded, context );
                    freeVoices_[ i ].maxLoops.value = 1;
                }

                window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

                window.requestAnimationFrame( soundQueueCallback );

            };

            var onVoiceEnded = function ( endedVoice, trackIndex ) {
                //console.log( trackIndex + " of " + self );
                freeVoices_.push( endedVoice );
                busyVoices_.splice( busyVoices_.indexOf( endedVoice ), 1 );
            };

            var findVoiceWithID = function ( eventID ) {
                for ( vIndex = 0; vIndex < busyVoices_.length; vIndex++ ) {
                    if ( busyVoices_[ vIndex ].eventID == eventID ) {
                        return busyVoices_[ vIndex ];
                    }
                }
                return null;
            };

            var createNewVoice = function ( eventID ) {
                if ( freeVoices_.length < 1 ) {
                    // TODO Steal??
                    console.log( "Need to steal voices" );
                }
                var newVoice = freeVoices_.pop();
                newVoice.eventID = eventID;
                busyVoices_.push( newVoice );
                return newVoice;
            };

            var processSingleEvent = function ( thisEvent ) {
                var selectedVoice = findVoiceWithID( thisEvent.eventID );

                console.log( "Processing " + thisEvent.type + " : " + thisEvent.eventID + " at " + thisEvent.time + " on " + selectedVoice );

                if ( thisEvent.type == "QESTART" ) {
                    if ( selectedVoice === null ) {
                        selectedVoice = createNewVoice( thisEvent.eventID );
                    }
                    selectedVoice.start( thisEvent.time );
                } else if ( thisEvent.type == "QERELEASE" ) {
                    if ( selectedVoice !== null ) {
                        selectedVoice.release( thisEvent.time );
                    }
                } else if ( thisEvent.type == "QESTOP" ) {
                    var resetVoice = function ( selectedVoice ) {
                        freeVoices_.push( selectedVoice );
                        busyVoices_.splice( busyVoices_.indexOf( selectedVoice ), 1 );
                    };

                    if ( selectedVoice !== null ) {
                        selectedVoice.pause( thisEvent.time );
                        window.setTimeout( resetVoice( selectedVoice ), thisEvent.time - context.currentTime );
                    }

                } else if ( thisEvent.type == "QESETPARAM" ) {
                    if ( selectedVoice === null ) {
                        selectedVoice = createNewVoice( thisEvent.eventID );
                    }
                    //console.log( "Setting " + thisEvent.paramName + " to " + thisEvent.paramValue );
                    selectedVoice[ thisEvent.paramName ].setValueAtTime( thisEvent.paramValue, thisEvent.time );
                } else if ( thisEvent.type == "QESETSRC" ) {
                    var setSource = function ( selectedVoice, thisEvent ) {
                        selectedVoice.setSources( thisEvent.audioBuffer );
                    };

                    if ( selectedVoice === null ) {
                        selectedVoice = createNewVoice( thisEvent.eventID );
                    }
                    window.setTimeout( setSource( selectedVoice, thisEvent ), thisEvent.time - context.currentTime );
                } else {
                    throw {
                        name: "Incorrect Parameter type Exception",
                        message: "SoundQueue doesn't recognize this type of event",
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                }
            };

            var processEventsTill = function ( maxTime ) {
                //console.log( "Processing till " + maxTime);
                for ( var eventIndex = 0; eventIndex < eventQueue_.length; eventIndex++ ) {
                    var thisEvent = eventQueue_[ eventIndex ];
                    if ( thisEvent.time <= maxTime ) {
                        processSingleEvent( thisEvent );
                        eventQueue_.splice( eventIndex, 1 );
                        eventIndex--;
                    }
                }
            };

            // Public Properties

            // Public Functions

            //"QENONE", "QESTOP", "QESTART", "QESETPARAM", "QESETSRC", "QERELEASE"

            this.queueStart = function ( time, eventID ) {
                //console.log( eventID + ": Enqueing QESTART at " + time );
                eventQueue_.push( new SPEvent( "QESTART", time, eventID ) );
            };
            this.queueRelease = function ( time, eventID ) {
                //console.log( eventID + ": Enqueing QERELEASE at " + time );
                eventQueue_.push( new SPEvent( "QERELEASE", time, eventID ) );
            };
            this.queueStop = function ( time, eventID ) {
                //console.log( eventID + ": Enqueing QESTOP at " + time );
                eventQueue_.push( new SPEvent( "QESTOP", time, eventID ) );
            };
            this.queueSetParameter = function ( time, eventID, paramValue, paramName ) {
                //console.log( eventID + ": Enqueing QESETPARAM at " + time );
                eventQueue_.push( new SPEvent( "QESETPARAM", time, eventID, paramValue, paramName ) );
            };
            this.queueSetSource = function ( time, eventID, sourceBuffer ) {
                //console.log( eventID + ": Enqueing QESETSRC at " + time );
                eventQueue_.push( new SPEvent( "QESETSRC", time, eventID, null, null, sourceBuffer ) );
            };

            this.connect = function ( audioNode ) {
                freeVoices_.forEach( function ( thisVoice ) {
                    thisVoice.connect( audioNode );
                } );

                busyVoices_.forEach( function ( thisVoice ) {
                    thisVoice.connect( audioNode );
                } );
            };

            init();
        }

        return SoundQueue;

    } );
