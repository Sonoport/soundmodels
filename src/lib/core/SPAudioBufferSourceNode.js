/**
 * @module Core
 */

"use strict";
var SPPlaybackRateParam = require( '../core/SPPlaybackRateParam' );
var webAudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

/**
 * A wrapper around the AudioBufferSourceNode to be able to track the current playPosition of a AudioBufferSourceNode.
 *
 * @class SPAudioBufferSourceNode
 * @constructor
 * @param {AudioContext} AudioContext to be used in timing the parameter automation events
 */
function SPAudioBufferSourceNode( audioContext ) {
    var bufferSourceNode_ = audioContext.createBufferSource();
    var counterNode_;

    var scopeNode_ = audioContext.createScriptProcessor( 256, 1, 1 );
    var trackGainNode_ = audioContext.createGain();
    var lastPos = 0;

    this.audioContext = audioContext;
    this.playbackState = 0;

    this.channelCount = null;
    this.channelCountMode = null;
    this.channelInterpretation = null;
    this.numberOfInputs = null;
    this.numberOfOutputs = null;

    /**
     * Playback States Constant.
     *
     * @property UNSCHEDULED_STATE
     * @type Number
     * @default "Model"
     **/
    this.UNSCHEDULED_STATE = 0;

    /**
     * Playback States Constant.
     *
     * @property SCHEDULED_STATE
     * @type Number
     * @default "1"
     **/
    this.SCHEDULED_STATE = 1;

    /**
     * Playback States Constant.
     *
     * @property PLAYING_STATE
     * @type Number
     * @default "2"
     **/
    this.PLAYING_STATE = 2;

    /**
     * Playback States Constant.
     *
     * @property FINISHED_STATE
     * @type Number
     * @default "3"
     **/
    this.FINISHED_STATE = 3;

    /**
     * The speed at which to render the audio stream. Its default value is 1. This parameter is a-rate.
     *
     * @property playbackRate
     * @type AudioParam
     * @default 1
     *
     */
    this.playbackRate = null;

    /**
     * An optional value in seconds where looping should end if the loop attribute is true.
     *
     * @property loopEnd
     * @type Number
     * @default 0
     *
     */
    Object.defineProperty( this, 'loopEnd', {
        enumerable: true,
        configurable: false,
        set: function ( loopEnd ) {
            bufferSourceNode_.loopEnd = loopEnd;
            counterNode_.loopEnd = loopEnd;
        },
        get: function () {
            return bufferSourceNode_.loopEnd;
        }
    } );

    /**
     * An optional value in seconds where looping should begin if the loop attribute is true.
     *
     * @property loopStart
     * @type Number
     * @default 0
     *
     */
    Object.defineProperty( this, 'loopStart', {
        enumerable: true,
        configurable: false,
        set: function ( loopStart ) {
            bufferSourceNode_.loopStart = loopStart;
            counterNode_.loopStart = loopStart;
        },
        get: function () {
            return bufferSourceNode_.loopStart;
        }
    } );

    /**
     * A property used to set the EventHandler for the ended event that is dispatched to AudioBufferSourceNode node types
     *
     * @property onended
     * @type Function
     * @default null
     *
     */
    Object.defineProperty( this, 'onended', {
        enumerable: true,
        configurable: false,
        set: function ( onended ) {
            bufferSourceNode_.onended = wrapAroundOnEnded( this, onended );
        },
        get: function () {
            return bufferSourceNode_.onended;
        }
    } );

    /**
     * Indicates if the audio data should play in a loop.
     *
     * @property loop
     * @type Boolean
     * @default false
     *
     */
    Object.defineProperty( this, 'loop', {
        enumerable: true,
        configurable: false,
        set: function ( loop ) {
            bufferSourceNode_.loop = loop;
            counterNode_.loop = loop;
        },
        get: function () {
            return bufferSourceNode_.loop;
        }
    } );

    /**
     * Position (in seconds) of the last frame played back by the AudioContext
     *
     * @property playbackPosition
     * @type Number
     * @default 0
     *
     */
    Object.defineProperty( this, 'playbackPosition', {
        enumerable: true,
        configurable: false,
        get: function () {
            return lastPos;
        }
    } );

    /**
     * Represents the audio asset to be played.
     *
     * @property buffer
     * @type AudioBuffer
     * @default null
     *
     */
    Object.defineProperty( this, 'buffer', {
        enumerable: true,
        configurable: false,
        set: function ( buffer ) {
            if ( bufferSourceNode_ ) {
                bufferSourceNode_.disconnect();
            }

            if ( counterNode_ ) {
                counterNode_.disconnect();
            }

            bufferSourceNode_ = audioContext.createBufferSource();
            counterNode_ = audioContext.createBufferSource();
            if ( buffer.isSPAudioBuffer ) {
                bufferSourceNode_.buffer = buffer.buffer;
                counterNode_.buffer = createCounterBuffer( buffer.buffer );
            } else if ( buffer instanceof AudioBuffer ) {
                bufferSourceNode_.buffer = buffer;
                counterNode_.buffer = createCounterBuffer( buffer );
            }

            counterNode_.connect( scopeNode_ );
            bufferSourceNode_.connect( trackGainNode_ );

            this.channelCount = bufferSourceNode_.channelCount;
            this.channelCountMode = bufferSourceNode_.channelCountMode;
            this.channelInterpretation = bufferSourceNode_.channelInterpretation;
            this.numberOfInputs = bufferSourceNode_.numberOfInputs;
            this.numberOfOutputs = bufferSourceNode_.numberOfOutputs;

            this.playbackRate = new SPPlaybackRateParam( this, bufferSourceNode_.playbackRate, counterNode_.playbackRate );

        },
        get: function () {
            return bufferSourceNode_.buffer;
        }
    } );

    /**
     * Track gain for this specific buffer.
     *
     * @property buffer
     * @type AudioBuffer
     * @default null
     *
     */
    Object.defineProperty( this, 'gain', {
        enumerable: true,
        configurable: false,
        get: function () {
            return trackGainNode_.gain;
        }
    } );

    /**
     * Connects the AudioNode to the input of another AudioNode.
     *
     * @method connect
     * @param {AudioNode} destination AudioNode to connect to.
     * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
     * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
     *
     */
    this.connect = function ( destination, output, input ) {
        trackGainNode_.connect( destination, output, input );
    };

    /**
     * Disconnects the AudioNode from the input of another AudioNode.
     *
     * @method disconnect
     * @param {Number} [output] Index describing which output of the AudioNode to disconnect.
     *
     */
    this.disconnect = function ( output ) {
        trackGainNode_.disconnect( output );
    };

    /**
     * Schedules a sound to playback at an exact time.
     *
     * @method start
     * @param {Number} when Time (in seconds) when the sound should start playing.
     * @param {Number} [offset] Offset time in the buffer (in seconds) where playback will begin
     * @param {Number} [duration] Duration of the portion (in seconds) to be played
     *
     */
    this.start = function ( when, offset, duration ) {
        if ( this.playbackState === this.UNSCHEDULED_STATE ) {
            if ( duration === undefined || duration === null ) {
                bufferSourceNode_.start( when, offset );
                counterNode_.start( when, offset );
            } else {
                bufferSourceNode_.start( when, offset, duration );
                counterNode_.start( when, offset, duration );
            }

            this.playbackState = this.SCHEDULED_STATE;
        }

        var self = this;
        webAudioDispatch( function () {
            self.playbackState = self.PLAYING_STATE;
        }, when, this.audioContext );
    };

    /**
     * Schedules a sound to stop playback at an exact time.
     *
     * @method stop
     * @param {Number} when Time (in seconds) when the sound should stop playing.
     *
     */
    this.stop = function ( when ) {
        if ( this.playbackState === this.PLAYING_STATE || this.playbackState === this.SCHEDULED_STATE ) {
            bufferSourceNode_.stop( when );
            counterNode_.stop( when );
        }
    };

    /**
     * Resets the SP Buffer Source with a fresh BufferSource.
     *
     * @method resetBufferSource
     * @param {Number} when Time (in seconds) when the Buffer source should be reset.
     * @param {AudioNode} output The output to which the BufferSource is to be connected.
     *
     */
    this.resetBufferSource = function ( when, output ) {

        var self = this;
        webAudioDispatch( function () {
            log.debug( 'Resetting BufferSource', self.buffer.length );
            // Disconnect source(s) from output.

            // Disconnect scope node from trackGain
            scopeNode_.disconnect();

            var newTrackGain = self.audioContext.createGain();
            newTrackGain.gain.value = trackGainNode_.gain.value;
            trackGainNode_ = newTrackGain;

            // Create new sources and copy all the parameters over.
            var newSource = self.audioContext.createBufferSource();
            newSource.buffer = bufferSourceNode_.buffer;
            newSource.loopStart = bufferSourceNode_.loopStart;
            newSource.loopEnd = bufferSourceNode_.loopEnd;
            newSource.onended = wrapAroundOnEnded( self, bufferSourceNode_.onended );

            // Remove onended callback from old buffer
            bufferSourceNode_.onended = null;

            // Throw away the counter node;
            counterNode_.disconnect();

            var newCounterNode = audioContext.createBufferSource();
            newCounterNode.buffer = counterNode_.buffer;

            // Assign the new local variables to new sources
            bufferSourceNode_ = newSource;
            counterNode_ = newCounterNode;

            // Create new parameters for rate parameter
            var playBackRateVal = self.playbackRate.value;
            self.playbackRate = new SPPlaybackRateParam( self, bufferSourceNode_.playbackRate, counterNode_.playbackRate );
            self.playbackRate.setValueAtTime( playBackRateVal, 0 );

            // Reconnect to output.
            counterNode_.connect( scopeNode_ );
            bufferSourceNode_.connect( trackGainNode_ );
            scopeNode_.connect( trackGainNode_ );
            self.connect( output );
            self.playbackState = self.UNSCHEDULED_STATE;
        }, when, this.audioContext );
    };

    // Private Methods

    function createCounterBuffer( buffer ) {
        var array = new Float32Array( buffer.length );
        var audioBuf = audioContext.createBuffer( 1, buffer.length, 44100 );

        for ( var index = 0; index < buffer.length; index++ ) {
            array[ index ] = index;
        }

        audioBuf.getChannelData( 0 ).set( array );
        return audioBuf;
    }

    function init() {
        scopeNode_.connect( trackGainNode_ );
        scopeNode_.onaudioprocess = savePosition;
    }

    function savePosition( processEvent ) {
        var inputBuffer = processEvent.inputBuffer.getChannelData( 0 );
        lastPos = inputBuffer[ inputBuffer.length - 1 ] || 0;
    }

    function wrapAroundOnEnded( node, onended ) {
        return function ( event ) {
            node.playbackState = node.FINISHED_STATE;
            if ( typeof onended === 'function' ) {
                onended( event );
            }
        };
    }

    init();

}
module.exports = SPAudioBufferSourceNode;
