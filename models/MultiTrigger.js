/**
 * @module Models
 */

"use strict";

var Config = require( '../core/Config' );
var BaseSound = require( '../core/BaseSound' );
var SoundQueue = require( '../core/SoundQueue' );
var SPAudioParam = require( '../core/SPAudioParam' );
var multiFileLoader = require( '../core/MultiFileLoader' );
var Converter = require( '../core/Converter' );
var webAudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

/**
 * A model which triggers a single or multiple sources with multiple voices (polyphony)
 * repeatedly.
 *
 *
 * @class MultiTrigger
 * @constructor
 * @extends BaseSound
 * @extends BaseSound
 * @param {AudioContext} [context] AudioContext to be used.
 * @param {Array/String/AudioBuffer/File} [sources] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 */
function MultiTrigger( options ) {
    if ( !( this instanceof MultiTrigger ) ) {
        return new MultiTrigger( options );
    }
    var legacyArgumentsMode = arguments.length > 1 || ( options || {} ).currentTime; // Test to guess whether user is using old-style multiple argument constructor instead.
    var context = legacyArgumentsMode ? arguments[ 0 ] : options.context;
    var sources = legacyArgumentsMode ? arguments[ 1 ] : options.sources;
    var onLoadProgress = legacyArgumentsMode ? arguments[ 2 ] : options.onLoadProgress;
    var onLoadComplete = legacyArgumentsMode ? arguments[ 3 ] : options.onLoadComplete;
    var onAudioStart = legacyArgumentsMode ? arguments[ 4 ] : options.onAudioStart;
    var onAudioEnd = legacyArgumentsMode ? arguments[ 5 ] : options.onAudioEnd;

    // Call superclass constructor
    BaseSound.call( this, context );

    var self = this;
    this.maxSources = Config.MAX_VOICES;
    this.minSources = 1;
    this.modelName = 'MultiTrigger';

    this.onLoadProgress = onLoadProgress;
    this.onLoadComplete = onLoadComplete;

    var onAudioStart_ = onAudioStart;
    var onAudioEnd_ = onAudioEnd;

    Object.defineProperty( this, 'onAudioStart', {
        enumerable: true,
        configurable: false,
        set: function ( startCallback ) {
            if ( soundQueue_ ) {
                onAudioStart_ = startCallback;
                soundQueue_.onAudioStart = startCallback;
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
            if ( soundQueue_ ) {
                soundQueue_.onAudioEnd = endCallback;
            }
        },
        get: function () {
            return onAudioEnd_;
        }
    } );

    var lastEventTime_ = 0;
    var timeToNextEvent_ = 0;

    // Private Variables
    var sourceBuffers_ = [];
    var soundQueue_;
    var currentEventID_ = 0;
    var currentSourceID_ = 0;

    var wasPlaying_ = false;
    // Private Functions
    function init( sources ) {
        multiFileLoader.call( self, sources, self.audioContext, self.onLoadProgress, onLoadAll );
    }

    var onLoadAll = function ( status, audioBufferArray ) {
        sourceBuffers_ = audioBufferArray;
        timeToNextEvent_ = updateTimeToNextEvent( self.eventRate.value );
        soundQueue_.connect( self.releaseGainNode );

        if ( status ) {
            self.isInitialized = true;
        }
        if ( typeof self.onLoadComplete === 'function' ) {
            window.setTimeout( function () {
                if ( typeof self.onLoadComplete === 'function' ) {
                    self.onLoadComplete( status, audioBufferArray );
                }
            }, 0 );
        }
    };

    function triggerOnce( eventTime ) {

        // Release Older Sounds

        if ( currentEventID_ >= self.maxSources - 2 ) {
            var releaseID = currentEventID_ - ( self.maxSources - 2 );
            var releaseDur = eventTime - lastEventTime_;
            soundQueue_.queueRelease( eventTime, releaseID, releaseDur );
        }

        var length = sourceBuffers_.length;

        if ( self.eventRand.value ) {
            if ( length > 2 ) {
                currentSourceID_ = ( currentSourceID_ + Math.floor( Math.random() * length ) ) % length;
            } else {
                currentSourceID_ = Math.floor( Math.random() * length );
            }
        } else {
            currentSourceID_ = currentSourceID_ % length;
        }

        var timeStamp = eventTime;
        var playSpeed = Converter.semitonesToRatio( self.pitchShift.value + Math.random() * self.pitchRand.value );

        soundQueue_.queueSetSource( timeStamp, currentEventID_, sourceBuffers_[ currentSourceID_ ] );
        soundQueue_.queueSetParameter( timeStamp, currentEventID_, 'playSpeed', playSpeed );
        soundQueue_.queueStart( timeStamp, currentEventID_ );
        currentEventID_++;
        currentSourceID_++;

    }

    function multiTiggerCallback() {

        var currentTime = context.currentTime;
        var endTime = currentTime + 1 / Config.NOMINAL_REFRESH_RATE;

        while ( lastEventTime_ + timeToNextEvent_ < endTime ) {
            var eventTime = Math.max( currentTime, lastEventTime_ + timeToNextEvent_ );
            triggerOnce( eventTime );
            lastEventTime_ = eventTime;
            timeToNextEvent_ = updateTimeToNextEvent( self.eventRate.value );
        }

        // Keep making callback request if model is still playing.
        if ( self.isPlaying ) {
            window.requestAnimationFrame( multiTiggerCallback );
        }
    }

    function updateTimeToNextEvent( eventRate ) {
        var period = 1.0 / eventRate;
        var randomness = Math.random() - 0.5;
        var jitterRand = ( 1.0 + 2.0 * self.eventJitter.value * randomness );

        var updateTime = period * jitterRand;

        if ( isFinite( updateTime ) ) {
            //Update releaseDur of Loopers being released
            var releaseDur = Math.max( 0.99 * period * ( 1 - self.eventJitter.value ), 0.01 );
            soundQueue_.queueUpdate( 'QERELEASE', null, 'releaseDuration', releaseDur );
        } else {
            // 1  year in seconds.
            updateTime = 365 * 24 * 3600;
        }

        return updateTime;
    }

    function eventRateSetter_( aParam, value ) {
        if ( value === 0 ) {
            if ( self.isPlaying ) {
                wasPlaying_ = true;
                soundQueue_.pause();
                BaseSound.prototype.pause.call( self );
            }
        } else {
            if ( self.isInitialized && !self.isPlaying && wasPlaying_ ) {
                self.play();
            }
            if ( self.isInitialized ) {
                timeToNextEvent_ = updateTimeToNextEvent( value );
            }
        }

    }

    // Public Properties

    /**
     * Pitch shift of the triggered voices in semitones.
     *
     * @property pitchShift
     * @type SPAudioParam
     * @default 0
     * @minvalue -60.0
     * @maxvalue 60.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'pitchShift', -60.0, 60.0, 0 ) );

    /**
     * Maximum value for random pitch shift of the triggered voices in semitones.
     *
     * @property pitchRand
     * @type SPAudioParam
     * @default 0.0
     * @minvalue 0.0
     * @maxvalue 24.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'pitchRand', 0.0, 24.0, 0.0 ) );

    /**
     * Enable randomness in the order of sources which are triggered.
     *
     * @property eventRand
     * @type SPAudioParam
     * @default false
     * @minvalue true
     * @maxvalue false
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'eventRand', true, false, false ) );

    /**
     * Trigger rate for playing the model in Hz.
     *
     * @property eventRate
     * @type SPAudioParam
     * @default 10.0
     * @minvalue 0.0
     * @maxvalue 60.0
     */
    this.registerParameter( new SPAudioParam( this, 'eventRate', 0, 60.0, 10.0, null, null, eventRateSetter_ ) );
    /**
     * Maximum deviation from the regular trigger interval (as a factor of 1).
     *
     * @property eventJitter
     * @type SPAudioParam
     * @default 0.0
     * @minvalue 0.0
     * @maxvalue 0.99
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'eventJitter', 0, 0.99, 0 ) );

    // Public Functions

    /**
     * Start repeated triggering.
     *
     * @method start
     * @param {Number} when The delay in seconds before playing the model
     * @param {Number} [offset] The starting position of the playhead
     * @param {Number} [duration] Duration of the portion (in seconds) to be played
     * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
     *
     */
    this.start = function ( when, offset, duration, attackDuration ) {
        if ( !this.isInitialized ) {
            log.warn( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
            return;
        }
        BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
        webAudioDispatch( multiTiggerCallback, when, this.audioContext );
    };

    /**
     * Start repeated triggering immediately
     *
     * @method play
     *
     */
    this.play = function () {
        this.start( 0 );
    };

    /**
     * Stops playing all voices.
     *
     * @method stop
     *
     */
    this.stop = function ( when ) {
        soundQueue_.stop( when );
        wasPlaying_ = false;
        BaseSound.prototype.stop.call( this, when );
    };

    /**
     * Pauses playing all voices.
     *
     * @method pause
     *
     */
    this.pause = function () {
        soundQueue_.pause();
        wasPlaying_ = false;
        BaseSound.prototype.pause.call( this );
    };

    /**
     * Reinitializes a MultiTrigger and sets it's sources.
     *
     * @method setSources
     * @param {Array/AudioBuffer/String/File} sources Single or Array of either URLs or AudioBuffers or File Objects of audio sources.
     * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
     * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
     */
    this.setSources = function ( sources, onLoadProgress, onLoadComplete ) {
        BaseSound.prototype.setSources.call( this, sources, onLoadProgress, onLoadComplete );
        init( sources );
    };
    // SoundQueue based model.
    soundQueue_ = new SoundQueue( this.audioContext, this.onAudioStart, this.onAudioEnd );

    init( sources );

}

MultiTrigger.prototype = Object.create( BaseSound.prototype );

module.exports = MultiTrigger;
