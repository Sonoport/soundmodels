/**
 * @module Core
 */
define( [ 'core/Config', 'models/Looper', 'core/FileLoader', 'core/SPEvent' ],
    function ( Config, Looper, FileLoader, SPEvent ) {
        "use strict";

        /**
         * A primitive which allows events on other Sound Models to be queued based on time of execution and executed at the appropriate time. Enables polyphony.
         *
         * @class SoundQueue
         * @constructor
         * @param {AudioContext} context AudioContext to be used in running the queue.
         * @param {Number} [numberOfVoices] Number of polyphonic voices the Queue can have.
         *
         */
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
                    freeVoices_[ i ] = new Looper( null, context, null, onVoiceEnded );
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
                    console.warn( "Need to steal voices" );
                }
                var newVoice = freeVoices_.pop();
                newVoice.eventID = eventID;
                busyVoices_.push( newVoice );
                return newVoice;
            };

            var processSingleEvent = function ( thisEvent ) {
                var selectedVoice = findVoiceWithID( thisEvent.eventID );

                //console.log( "Processing " + thisEvent.type + " : " + thisEvent.eventID + " at " + thisEvent.time + " on " + selectedVoice );

                if ( thisEvent.type == "QESTART" ) {
                    if ( selectedVoice === null ) {
                        selectedVoice = createNewVoice( thisEvent.eventID );
                    }
                    selectedVoice.start( thisEvent.time, null, null, thisEvent.paramValue );
                } else if ( thisEvent.type == "QERELEASE" ) {
                    if ( selectedVoice !== null ) {
                        selectedVoice.release( thisEvent.time, thisEvent.paramValue );
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

            // Public Functions

            /**
             * Enqueue a Start event.
             *
             * @method queueStart
             * @param {Number} time Time (in seconds) at which the voice will start.
             * @param {Number} eventID Arbitary ID which is common for all related events.
             * @param {Number} [attackDuration] Attack Duration (in seconds) for attack envelope during start.
             */
            this.queueStart = function ( time, eventID, attackDuration ) {
                //console.log( eventID + ": Enqueing QESTART at " + time );
                eventQueue_.push( new SPEvent( "QESTART", time, eventID, "attackDur", attackDuration ) );
            };

            /**
             * Enqueue a Release event.
             *
             * @method queueRelease
             * @param {Number} time Time (in seconds) at which the voice will release.
             * @param {Number} eventID Arbitary ID which is common for all related events.
             * @param {Number} releaseDuration Time (in seconds) on the length of the release
             */
            this.queueRelease = function ( time, eventID, releaseDuration ) {
                //console.log( eventID + ": Enqueing QERELEASE at " + time );
                eventQueue_.push( new SPEvent( "QERELEASE", time, eventID, "releaseDur", releaseDuration ) );
            };

            /**
             * Enqueue a Stop event.
             *
             * @method queueStop
             * @param {Number} time Time (in seconds) at which the voice will stop.
             * @param {Number} eventID Arbitary ID which is common for all related events.
             */
            this.queueStop = function ( time, eventID ) {
                //console.log( eventID + ": Enqueing QESTOP at " + time );
                eventQueue_.push( new SPEvent( "QESTOP", time, eventID ) );
            };

            /**
             * Enqueue a Set Parameter event.
             *
             * @method queueSetParameter
             * @param {Number} time Time (in seconds) at which the voice parameter will be set.
             * @param {Number} eventID Arbitary ID which is common for all related events.
             * @param {Boolean/Number} paramValue Value for the Parameter to be set.
             * @param {String} paramName Name of the parameter to be set.
             */
            this.queueSetParameter = function ( time, eventID, paramName, paramValue ) {
                //console.log( eventID + ": Enqueing QESETPARAM at " + time );
                eventQueue_.push( new SPEvent( "QESETPARAM", time, eventID, paramName, paramValue ) );
            };

            /**
             * Enqueue a Set Source event.
             *
             * @method queueSetSource
             * @param {Number} time Time (in seconds) at which the voice source will be set.
             * @param {Number} eventID Arbitary ID which is common for all related events.
             * @param {AudioBuffer} sourceBuffer AudioBuffer to be set as source for a voice.
             */
            this.queueSetSource = function ( time, eventID, sourceBuffer ) {
                //console.log( eventID + ": Enqueing QESETSRC at " + time );
                eventQueue_.push( new SPEvent( "QESETSRC", time, eventID, null, null, sourceBuffer ) );
            };

            /**
             * Connect the SoundQueue to an output. Connects all the internal voices to the output.
             *
             * @method connect
             * @param {AudioNode} destination AudioNode to connect to.
             * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
             * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
             */
            this.connect = function ( destination, output, input ) {
                freeVoices_.forEach( function ( thisVoice ) {
                    thisVoice.connect( destination, output, input );
                } );

                busyVoices_.forEach( function ( thisVoice ) {
                    thisVoice.connect( destination, output, input );
                } );
            };

            /**
             * Disconnects the Sound from the AudioNode Chain.
             *
             * @method disconnect
             * @param {Number} [outputIndex] Index describing which output of the AudioNode to disconnect.
             */
            this.disconnect = function ( outputIndex ) {
                freeVoices_.forEach( function ( thisVoice ) {
                    thisVoice.disconnect( outputIndex );
                } );

                busyVoices_.forEach( function ( thisVoice ) {
                    thisVoice.disconnect( outputIndex );
                } );
            };

            init();
        }

        return SoundQueue;

    } );
