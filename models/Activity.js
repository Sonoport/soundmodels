/**
 * @module Models
 *
 */
"use strict";

var Config = require( '../core/Config' );
var BaseSound = require( '../core/BaseSound' );
var Looper = require( '../models/Looper' );
var SPAudioParam = require( '../core/SPAudioParam' );
var webAudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

/**
 * A model plays back the source at various speeds based on the movement of the activity parameter.
 *
 *
 * @class Activity
 * @constructor
 * @extends BaseSound
 * @param {AudioContext} [context] AudioContext to be used.
 * @param {Array/String/AudioBuffer/File} [source] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when the source has finished loading.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 */
function Activity( options ) {
    if ( !( this instanceof Activity ) ) {
        return new Activity( options );
    }
    var legacyArgumentsMode = arguments.length > 1 || ( options || {} ).currentTime; // Test to guess whether user is using old-style multiple argument constructor instead.
    var context = legacyArgumentsMode ? arguments[ 0 ] : options.context;
    var source = legacyArgumentsMode ? arguments[ 1 ] : options.source;
    var onLoadProgress = legacyArgumentsMode ? arguments[ 2 ] : options.onLoadProgress;
    var onLoadComplete = legacyArgumentsMode ? arguments[ 3 ] : options.onLoadComplete;
    var onAudioStart = legacyArgumentsMode ? arguments[ 4 ] : options.onAudioStart;
    var onAudioEnd = legacyArgumentsMode ? arguments[ 5 ] : options.onAudioEnd;

    BaseSound.call( this, context );
    /*Support upto 8 seperate voices*/
    this.maxSources = Config.MAX_VOICES;
    this.minSources = 1;
    this.modelName = 'Activity';

    this.onLoadProgress = onLoadProgress;
    this.onLoadComplete = onLoadComplete;
    var onAudioStart_ = onAudioStart;
    var onAudioEnd_ = onAudioEnd;

    Object.defineProperty( this, 'onAudioStart', {
        enumerable: true,
        configurable: false,
        set: function ( startCallback ) {
            if ( internalLooper_ ) {
                onAudioStart_ = startCallback;
                internalLooper_.onAudioStart = startCallback;
            }
        },
        get: function () {
            return onAudioStart_;
        }
    } );

    Object.defineProperty( this, 'onAudioEnd', {
        enumerable: true,
        configurable: false,
        set: function ( endCallback ) {
            onAudioEnd_ = endCallback;
            if ( internalLooper_ ) {
                internalLooper_.onAudioEnd = endCallback;
            }
        },
        get: function () {
            return onAudioEnd_;
        }
    } );

    // Private vars
    var self = this;

    // Private Variables
    var internalLooper_ = null;
    var lastPosition_ = 0;
    var lastUpdateTime_ = 0;
    var smoothDeltaTime_ = 0;
    var timeoutID = null;
    var endEventTimeout = null;
    var audioPlaying = false;

    // Constants

    var MIN_SENSITIVITY = 0.1;
    var MAX_SENSITIVITY = 100.0;
    var MAX_OVERSHOOT = 1.2;
    var MAX_TIME_OUT = 0.1;
    var MIN_DIFF = 0.001;

    // Private Functions

    function onLoadAll( status, audioBufferArray ) {
        internalLooper_.playSpeed.setValueAtTime( Config.ZERO, self.audioContext.currentTime );
        if ( status ) {
            self.isInitialized = true;
        }
        lastPosition_ = 0;
        lastUpdateTime_ = 0;
        smoothDeltaTime_ = 0;

        if ( typeof self.onLoadComplete === 'function' ) {
            window.setTimeout( function () {
                if ( typeof self.onLoadComplete === 'function' ) {
                    self.onLoadComplete( status, audioBufferArray );
                }
            }, 0 );
        }
    }

    function init( source ) {
        internalLooper_ = new Looper( self.audioContext, source, self.onLoadProgress, onLoadAll, self.onAudioStart, self.onAudioEnd );
        internalLooper_.easeIn.value = self.easeIn.value;
        internalLooper_.easeOut.value = self.easeOut.value;
    }

    function actionSetter_( aParam, value, audioContext ) {
        if ( self.isInitialized ) {

            var newPosition = value;
            var time = audioContext.currentTime;

            var deltaPos = Math.abs( newPosition - lastPosition_ );
            var deltaTime = ( time - lastUpdateTime_ );

            log.debug( "delta time", deltaTime );

            if ( deltaTime > 0 ) {

                // The target level is dependent on the rate of motion and the sensitivity.

                // The sensitivity slider is mapped logarithmically to a very wide range of sensitivities [0.1 100.0].
                var logMinSens = Math.log( MIN_SENSITIVITY );
                var logMaxSens = Math.log( MAX_SENSITIVITY );
                var sensitivityLg = Math.exp( logMinSens + self.sensitivity.value * ( logMaxSens - logMinSens ) );

                // Sometimes updates to the position get "bunched up", resulting in misleadingly
                // small deltaTime values. This bit of code applies a low-pass filter to delta time.
                // The general idea is that if you move the mouse at constant speed, the position update
                // should come in at regular time *and* position intervals, and deltaPos/deltaTime should be
                // fairly stable. In reality, however, deltaPos is pretty stable, but deltaTime is highly
                // irregular. Applying a low-pass filter to to the time intervals fixes things.
                if ( smoothDeltaTime_ > MIN_DIFF ) {
                    smoothDeltaTime_ = ( 0.5 * smoothDeltaTime_ + 0.5 * deltaTime );
                } else {
                    smoothDeltaTime_ = deltaTime;
                }

                var maxRate = self.maxSpeed.value;

                //var sensivityScaling:Number = Math.pow( 10, getParamVal(SENSITIVITY) );
                var targetPlaySpeed_ = maxRate * sensitivityLg * deltaPos / smoothDeltaTime_;

                // Target level is always positive (hence abs).  We clamp it at some maximum to avoid generating ridiculously large levels when deltaTime is small (which happens if the mouse events get delayed and clumped up).
                // The maximum is slightly *higher* than the max rate, i.e. we allow some overshoot in the target value.
                //This is so that if you're shaking the "Action" slider vigorously, the rate will get pinned at the maximum, and not momentarily drop below the maximum during those very brief instants when the target rate drops well below the max.

                targetPlaySpeed_ = Math.min( Math.abs( targetPlaySpeed_ ), MAX_OVERSHOOT * maxRate );

                internalLooper_.playSpeed.value = targetPlaySpeed_;

                if ( targetPlaySpeed_ > 0 && !audioPlaying ) {
                    audioPlaying = true;
                    self.play();
                }

                // We use a timeout to prevent the target level from staying at a non-zero value
                // forever when motion stops.  For best response, we adapt the timeout based on
                // how frequently we've been getting position updates.
                if ( timeoutID ) {
                    window.clearTimeout( timeoutID );
                }
                timeoutID = window.setTimeout( function () {
                    internalLooper_.playSpeed.value = 0;
                }, 1000 * Math.min( 10 * deltaTime, MAX_TIME_OUT ) );

                if ( endEventTimeout ) {
                    window.clearTimeout( endEventTimeout );
                }
                endEventTimeout = window.setTimeout( function () {
                    if ( audioPlaying ) {
                        audioPlaying = false;
                        self.release();
                    }
                }, 1000 * internalLooper_.easeOut.value );
            }

            lastPosition_ = newPosition;
            lastUpdateTime_ = time;
        }
    }

    function easeInSetter_( aParam, value ) {
        if ( self.isInitialized ) {
            internalLooper_.easeIn.value = value;
        }
    }

    function easeOutSetter_( aParam, value ) {
        if ( self.isInitialized ) {
            internalLooper_.easeOut.value = value;
        }
    }

    // Public Properties

    /**
     *  Maximum value at which the playback speed of the source will be capped to.
     *
     * @property maxSpeed
     * @type SPAudioParam
     * @default 1
     * @minvalue 0.05
     * @maxvalue 8.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'maxSpeed', 0.05, 8.0, 1 ) );

    /**
     * Controls the playback of the source. The more this parameter is moved, the higher the speed of playback.
     *
     * @property action
     * @type SPAudioParam
     * @default 0
     * @minvalue 0.0
     * @maxvalue 1.0
     */
    this.registerParameter( new SPAudioParam( this, 'action', 0, 1.0, 0.0, null, null, actionSetter_ ) );

    /**
     * Maximum value for random pitch shift of the triggered voices in semitones.
     *
     * @property sensitivity
     * @type SPAudioParam
     * @default 0.5
     * @minvalue 0.0
     * @maxvalue 1.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'sensitivity', 0.0, 1.0, 0.5 ) );

    /**
     * Rate of increase of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
     *
     * @property easeIn
     * @type SPAudioParam
     * @default 1
     * @minvalue 0.05
     * @maxvalue 10.0
     */
    this.registerParameter( new SPAudioParam( this, 'easeIn', 0.05, 10.0, 1, null, null, easeInSetter_ ) );

    /**
     *  Rate of decrease of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
     *
     * @property easeOut
     * @type SPAudioParam
     * @default 1
     * @minvalue 0.05
     * @maxvalue 10.0
     */
    this.registerParameter( new SPAudioParam( this, 'easeOut', 0.05, 10.0, 1, null, null, easeOutSetter_ ) );

    // Public Functions

    /**
     * Reinitializes a Activity and sets it's sources.
     *
     * @method setSources
     * @param {Array/AudioBuffer/String/File} source Single or Array of either URLs or AudioBuffers of audio sources.
     * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
     * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
     */
    this.setSources = function ( source, onLoadProgress, onLoadComplete ) {
        BaseSound.prototype.setSources.call( this, source, onLoadProgress, onLoadComplete );
        internalLooper_.setSources( source, onLoadProgress, onLoadAll );
    };

    /**
     * Enable playback.
     *
     * @method play
     * @param {Number} [when] At what time (in seconds) the source be triggered
     *
     */
    this.play = function ( when ) {
        if ( !this.isInitialized ) {
            log.warn( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
            return;
        }
        internalLooper_.play( when );
        BaseSound.prototype.play.call( this, when );
    };

    /**
     * Start playing after specific time and from a specific offset.
     *
     * @method start
     * @param {Number} when The delay in seconds before playing the model
     * @param {Number} [offset] The starting position of the playhead
     * @param {Number} [duration] Duration of the portion (in seconds) to be played
     * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
     */
    this.start = function ( when, offset, duration, attackDuration ) {
        if ( !this.isInitialized ) {
            log.warn( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
            return;
        }
        internalLooper_.start( when, offset, duration );
        BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
    };

    /**
     * Stops the source and resets play head to 0.
     * @method stop
     * @param {Number} when Time offset to stop
     */
    this.stop = function ( when ) {
        internalLooper_.stop( when );
        BaseSound.prototype.stop.call( this, when );
    };

    /**
     * Pause the currently playing source at the current position.
     *
     * @method pause
     */
    this.pause = function () {
        internalLooper_.pause();
        BaseSound.prototype.pause.call( this );
    };

    /**
     * Linearly ramp down the gain of the audio in time (seconds) to 0.
     *
     * @method release
     * @param {Number} [when] Time (in seconds) at which the Envelope will release.
     * @param {Number} [fadeTime] Amount of time (seconds) it takes for linear ramp down to happen.
     */
    this.release = function ( when, fadeTime ) {
        internalLooper_.release( when, fadeTime );
        var self = this;
        webAudioDispatch( function () {
            self.isPlaying = false;
        }, when + fadeTime, this.audioContext );
        //BaseSound.prototype.release.call( this, when, fadeTime );
    };

    /**
     * Disconnects the Sound from the AudioNode Chain.
     *
     * @method disconnect
     * @param {Number} [outputIndex] Index describing which output of the AudioNode to disconnect.
     **/
    this.disconnect = function ( outputIndex ) {
        internalLooper_.disconnect( outputIndex );
    };

    /**
     * If the parameter `output` is an AudioNode, it connects to the releaseGainNode.
     * If the output is a BaseSound, it will connect BaseSound's releaseGainNode to the output's inputNode.
     *
     * @method connect
     * @param {AudioNode} destination AudioNode to connect to.
     * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
     * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
     */
    this.connect = function ( destination, output, input ) {
        internalLooper_.connect( destination, output, input );
    };

    // Initialize the sources.
    init( source );
}

Activity.prototype = Object.create( BaseSound.prototype );

module.exports = Activity;
