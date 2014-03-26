/**
 * @class SoundQueue
 * @description A sound model which loads a sound file and allows it to be looped continuously at variable speed.
 * @module Looper
 */
define( [ 'models/Looper', 'core/FileLoader', 'core/SPEvent' ],
    function ( Looper, FileLoader, SPEvent ) {
        "use strict";

        function SoundQueue( context, numberOfVoices ) {
            if ( !( this instanceof SoundQueue ) ) {
                throw new TypeError( "SoundQueue constructor cannot be called as a function." );
            }

            if ( typeof numberOfVoices === "undefined" ) {
                numberOfVoices = 4;
            }

            // Private Variables
            var self = this;

            var eventQueue_ = [];
            var busyVoices_ = [];
            var freeVoices_ = [];

            var vIndex;

            var NOMINAL_REFRESH_RATE = 60;

            // Private Functions

            function soundQueueCallback( timestamp ) {
                processEventsTill( context.currentTime + 1 / NOMINAL_REFRESH_RATE );
                window.requestAnimationFrame( soundQueueCallback );
            }

            var init = function () {
                for ( var i = 0; i < numberOfVoices; i++ ) {
                    freeVoices_[ i ] = new Looper( null, null, context );
                }

                window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

                window.requestAnimationFrame( soundQueueCallback );

            };

            var processSingleEvent = function ( thisEvent ) {
                if ( thisEvent.type == "QESTART" ) {
                    if ( freeVoices_.length < 1 ) {
                        // TODO Steal??
                        var steal = 0;
                        steal++;
                    }
                    var newVoice = freeVoices_.pop();
                    newVoice.start( thisEvent.time );
                    busyVoices_.push( newVoice );
                } else if ( thisEvent.type == "QERELEASE" ) {
                    for ( vIndex = 0; vIndex < busyVoices_.length; vIndex++ ) {
                        if ( busyVoices_[ vIndex ].eventID == thisEvent.eventID ) {
                            busyVoices_[ vIndex ].release( thisEvent.time );
                            break;
                        }
                    }
                } else if ( thisEvent.type == "QESTOP" ) {
                    var resetVoice = function ( index ) {
                        freeVoices_.push( busyVoices_[ vIndex ] );
                        busyVoices_.splice( index, 1 );
                    };

                    for ( vIndex = 0; vIndex < busyVoices_.length; vIndex++ ) {
                        if ( busyVoices_[ vIndex ].eventID == thisEvent.eventID ) {
                            busyVoices_[ vIndex ].pause( thisEvent.time );
                            window.setTimeOut( resetVoice( vIndex ), thisEvent.time - context.currentTime );
                            break;
                        }
                    }
                } else if ( thisEvent.type == "QESETPARAM" ) {
                    for ( vIndex = 0; vIndex < busyVoices_.length; vIndex++ ) {
                        if ( busyVoices_[ vIndex ].eventID == thisEvent.eventID ) {
                            busyVoices_[ vIndex ][ thisEvent.parameterName ].setValueAtTime( thisEvent.parameterValue, thisEvent.time );
                            break;
                        }
                    }
                } else if ( thisEvent.type == "QESETSRC" ) {
                    var setSource = function ( index, thisEvent ) {
                        busyVoices_[ index ].setSources( thisEvent.sourceBuffer );
                    };

                    for ( vIndex = 0; vIndex < busyVoices_.length; vIndex++ ) {
                        if ( busyVoices_[ vIndex ].eventID == thisEvent.eventID ) {
                            window.setTimeOut( setSource( vIndex, thisEvent ), thisEvent.time - context.currentTime );
                            break;
                        }
                    }
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

            var processEventsTill = function ( maxTimeStamp ) {

                for ( var eventIndex = 0; eventIndex < eventQueue_.length; eventIndex++ ) {
                    var thisEvent = eventQueue_[ eventIndex ];
                    if ( eventIndex.time <= maxTimeStamp ) {
                        processSingleEvent( thisEvent );
                        eventQueue_.splice( eventIndex, 1 );
                        eventIndex--;
                    }
                }
            };

            // Public Properties

            // Public Functions

            //"QENONE", "QESTOP", "QESTART", "QESETPARAM", "QESETSRC", "QERELEASE"

            this.queueStart = function ( timeStamp, eventID ) {
                eventQueue_.push( new SPEvent( "QESTART", timeStamp, eventID ) );
            };
            this.queueRelease = function ( timeStamp, eventID ) {
                eventQueue_.push( new SPEvent( "QERELEASE", timeStamp, eventID ) );
            };
            this.queueStop = function ( timeStamp, eventID ) {
                eventQueue_.push( new SPEvent( "QESTOP", timeStamp, eventID ) );
            };
            this.queueSetParameter = function ( timeStamp, eventID, parameterName, parameterValue ) {
                eventQueue_.push( new SPEvent( "QESETPARAM", timeStamp, eventID, parameterName, parameterValue ) );
            };
            this.queueSetSource = function ( timeStamp, eventID, sourceBuffer ) {
                eventQueue_.push( new SPEvent( "QESETSRC", timeStamp, eventID, null, null, sourceBuffer ) );
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
