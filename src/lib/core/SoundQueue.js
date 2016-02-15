/**
 * @module Core
 */
"use strict";
var Config = require( '../core/Config' );
var Looper = require( '../models/Looper' );
var webaudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

/**
 * A primitive which allows events on other Sound Models to be queued based on time of execution and executed at the appropriate time. Enables polyphony.
 *
 * Currently supports these types of events. </br>
 * ["QESTOP", "QESTART", "QESETPARAM", "QESETSRC", "QERELEASE" ]
 *
 * @class SoundQueue
 * @constructor
 * @param {AudioContext} context AudioContext to be used in running the queue.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 * @param {Number} [numberOfVoices] Number of polyphonic voices the Queue can have.
 *
 */
function SoundQueue( context, onAudioStart, onAudioEnd, numberOfVoices ) {
    if ( !( this instanceof SoundQueue ) ) {
        throw new TypeError( "SoundQueue constructor cannot be called as a function." );
    }

    if ( typeof numberOfVoices === 'undefined' ) {
        numberOfVoices = Config.MAX_VOICES;
    }

    // Private Variables
    var self = this;

    this.onAudioEnd = onAudioEnd;
    this.onAudioStart = onAudioStart;

    var eventQueue_ = [];
    var busyVoices_ = [];
    var freeVoices_ = [];

    var vIndex;

    // Private Functions

    function soundQueueCallback() {
        processEventsTill( context.currentTime + 1 / Config.NOMINAL_REFRESH_RATE );
        window.requestAnimationFrame( soundQueueCallback );
    }

    function init() {
        for ( var i = 0; i < numberOfVoices; i++ ) {
            freeVoices_[ i ] = new Looper( context, null, null, null, null, null, onVoiceEnded );
            freeVoices_[ i ].disconnect();
            freeVoices_[ i ].maxLoops.value = 1;
            freeVoices_[ i ].voiceIndex = i;
        }

        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

        window.requestAnimationFrame( soundQueueCallback );

    }

    function onVoiceEnded( endedVoice ) {
        log.debug( "freeing " + endedVoice.voiceIndex );
        freeVoices_.push( endedVoice );
        busyVoices_.splice( busyVoices_.indexOf( endedVoice ), 1 );

        var noPlayableEvents = eventQueue_.reduce( function ( prev, thisEvent ) {
            return prev || thisEvent.type !== 'QESTART';
        }, ( eventQueue_.length === 0 ) );

        if ( self.isPlaying && busyVoices_.length === 0 && noPlayableEvents ) {
            self.isPlaying = false;
            if ( typeof self.onAudioEnd === 'function' ) {
                self.onAudioEnd();
            }
        }
    }

    function findVoiceWithID( eventID ) {
        for ( vIndex = 0; vIndex < busyVoices_.length; vIndex++ ) {
            if ( busyVoices_[ vIndex ].eventID == eventID ) {
                return busyVoices_[ vIndex ];
            }
        }
        return null;
    }

    function dequeueEventsHavingID( eventID ) {
        for ( var eventIndex = 0; eventIndex < eventQueue_.length; eventIndex++ ) {
            var thisEvent = eventQueue_[ eventIndex ];
            if ( thisEvent.eventID === eventID ) {
                eventQueue_.splice( eventIndex, 1 );
                eventIndex--;
            }
        }
    }

    function getFreeVoice( eventID, eventTime ) {
        var newVoice;
        if ( freeVoices_.length < 1 ) {
            log.debug( "No free voices left. Stealing the oldest" );
            newVoice = busyVoices_.shift();
            dequeueEventsHavingID( newVoice.eventID );
            newVoice.eventID = eventID;
            newVoice.release( context.currentTime, eventTime - context.currentTime, true );
            busyVoices_.push( newVoice );
        } else {
            newVoice = freeVoices_.shift();
            newVoice.eventID = eventID;
            busyVoices_.push( newVoice );
        }

        return newVoice;
    }

    function processSingleEvent( thisEvent ) {
        var selectedVoice = findVoiceWithID( thisEvent.eventID );

        if ( ( thisEvent.type == 'QESTART' || thisEvent.type == 'QESETPARAM' || thisEvent.type == 'QESETSRC' ) && selectedVoice === null ) {
            selectedVoice = getFreeVoice( thisEvent.eventID, thisEvent.time );
        }

        // If voice is still null/defined, then skip the event
        if ( !selectedVoice ) {
            return;
        }

        log.debug( "Processing " + thisEvent.type + " : " + thisEvent.eventID + " at " + thisEvent.time + " on " + selectedVoice.voiceIndex );

        if ( thisEvent.type == 'QESTART' ) {
            log.info( "starting " + selectedVoice.voiceIndex );
            selectedVoice.start( thisEvent.time, thisEvent.offset, undefined, thisEvent.attackDuration );
            webaudioDispatch( function () {
                if ( !self.isPlaying ) {
                    self.isPlaying = true;
                    if ( typeof self.onAudioStart === 'function' ) {
                        self.onAudioStart();
                    }
                }
            }, thisEvent.time, context );
        } else if ( thisEvent.type == 'QESETPARAM' ) {
            if ( selectedVoice[ thisEvent.paramName ] ) {
                selectedVoice[ thisEvent.paramName ].setValueAtTime( thisEvent.paramValue, thisEvent.time );
            }
        } else if ( thisEvent.type == 'QESETSRC' ) {
            selectedVoice.setSources( thisEvent.sourceBuffer );
        } else if ( thisEvent.type == 'QERELEASE' ) {
            log.debug( "releasing " + selectedVoice.voiceIndex );
            selectedVoice.release( thisEvent.time, thisEvent.releaseDuration );
        } else if ( thisEvent.type == 'QESTOP' ) {
            selectedVoice.pause( thisEvent.time );
            webaudioDispatch( function () {
                freeVoices_.push( selectedVoice );
                busyVoices_.splice( busyVoices_.indexOf( selectedVoice ), 1 );
            }, thisEvent.time, context );
        } else {
            log.warn( "Unknown Event Type : " + thisEvent );
        }
    }

    function processEventsTill( maxTime ) {
        for ( var eventIndex = 0; eventIndex < eventQueue_.length; eventIndex++ ) {
            var thisEvent = eventQueue_[ eventIndex ];
            if ( thisEvent.time <= maxTime ) {
                processSingleEvent( thisEvent );
                eventQueue_.splice( eventIndex, 1 );
                eventIndex--;
            }
        }
    }

    // Public Properties
    this.isPlaying = false;

    // Public Functions

    /**
     * Enqueue a Start event.
     *
     * @method queueStart
     * @param {Number} time Time (in seconds) at which the voice will start.
     * @param {Number} eventID Arbitary ID which is common for all related events.
     * @param {Number} [offset] The starting in seconds position of the playhead.
     * @param {Number} [attackDuration] Attack Duration (in seconds) for attack envelope during start.
     */
    this.queueStart = function ( time, eventID, offset, attackDuration ) {
        eventQueue_.push( {
            'type': 'QESTART',
            'time': time,
            'eventID': eventID,
            'offset': offset,
            'attackDuration': attackDuration
        } );
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
        eventQueue_.push( {
            'type': 'QERELEASE',
            'time': time,
            'eventID': eventID,
            'releaseDuration': releaseDuration
        } );
    };

    /**
     * Enqueue a Stop event.
     *
     * @method queueStop
     * @param {Number} time Time (in seconds) at which the voice will stop.
     * @param {Number} eventID Arbitary ID which is common for all related events.
     */
    this.queueStop = function ( time, eventID ) {
        eventQueue_.push( {
            'type': 'QESTOP',
            'time': time,
            'eventID': eventID
        } );
    };

    /**
     * Enqueue a Set Parameter event.
     *
     * @method queueSetParameter
     * @param {Number} time Time (in seconds) at which the voice parameter will be set.
     * @param {Number} eventID Arbitary ID which is common for all related events.
     * @param {String} paramName Name of the parameter to be set.
     * @param {Boolean/Number} paramValue Value for the Parameter to be set.

     */
    this.queueSetParameter = function ( time, eventID, paramName, paramValue ) {
        eventQueue_.push( {
            'type': 'QESETPARAM',
            'time': time,
            'eventID': eventID,
            'paramName': paramName,
            'paramValue': paramValue
        } );
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
        eventQueue_.push( {
            'type': 'QESETSRC',
            'time': time,
            'eventID': eventID,
            'sourceBuffer': sourceBuffer
        } );
    };

    /**
     * Updates the Queued Event(s).
     *
     * @method queueUpdate
     * @param {String} Type of the event to be updated.
     * @param {Number} eventID ID of the event to be updated. Null for all events of this type.
     * @param {String} propertyName Name of the property to be updated.
     * @param {Boolean/Number} propertyValue Value for the property to be updated
     */
    this.queueUpdate = function ( eventType, eventID, propertyName, propertyValue ) {
        for ( var eventIndex = 0; eventIndex < eventQueue_.length; eventIndex++ ) {
            var thisEvent = eventQueue_[ eventIndex ];
            if ( thisEvent.type === eventType && ( !eventID || thisEvent.eventID == eventID ) ) {
                if ( thisEvent.hasOwnProperty( propertyName ) ) {
                    thisEvent[ propertyName ] = propertyValue;
                }
            }
        }
    };

    /**
     * Pauses the SoundQueue. All queued voices are stopped and released.
     *
     * @method clear
     */
    this.pause = function () {
        this.stop( 0, 0.01 );
    };

    /**
     * Clears the SoundQueue. All queued voices are stopped and released.
     *
     * @method clear
     * @param {Number} [when] A timestamp describing when to clear the SoundQueue
     * @param {Number} [fadeTime] Amount of time (seconds) it takes for linear ramp down to happen.
     * @param {Number} [resetOnRelease] Boolean to define if release stops (resets) the playback or just pauses it.
     */
    this.stop = function ( when, fadeTime, resetOnRelease ) {
        processEventsTill( when );
        eventQueue_ = [];
        busyVoices_.forEach( function ( thisVoice ) {
            thisVoice.release( when, fadeTime, resetOnRelease );
        } );
        freeVoices_.forEach( function ( thisVoice ) {
            thisVoice.stop( when );
        } );
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

module.exports = SoundQueue;
