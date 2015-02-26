/**
 * @module Models
 */
"use strict";

var Config = require( '../core/Config' );
var BaseSound = require( '../core/BaseSound' );
var SoundQueue = require( '../core/SoundQueue' );
var SPAudioParam = require( '../core/SPAudioParam' );
var multiFileLoader = require( '../core/multiFileLoader' );
var Converter = require( '../core/Converter' );

/**
 * A model which triggers a single or multiple audio sources with multiple voices (polyphony).
 *
 *
 * @class Trigger
 * @constructor
 * @extends BaseSound
 * @param {AudioContext} [context] AudioContext to be used.
 * @param {Array/String/AudioBuffer/File} [sources] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 */
function Trigger( context, sources, onLoadProgress, onLoadComplete, onAudioStart, onAudioEnd ) {
    if ( !( this instanceof Trigger ) ) {
        throw new TypeError( "Trigger constructor cannot be called as a function." );
    }

    // Call superclass constructor
    BaseSound.call( this, context );
    /*Support upto 8 seperate voices*/
    this.maxSources = Config.MAX_VOICES;
    this.minSources = 1;
    this.modelName = 'Trigger';

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

    // Private vars
    var self = this;

    // Private Variables
    var sourceBuffers_ = [];
    var soundQueue_;
    var currentEventID_ = 0;
    var currentSourceID_ = 0;
    var allSounds;

    // Private Functions

    var onLoadAll = function ( status, audioBufferArray ) {
        sourceBuffers_ = audioBufferArray;
        soundQueue_.connect( self.releaseGainNode );
        if ( status ) {
            self.isInitialized = true;
        }
        if ( typeof self.onLoadComplete === 'function' ) {
            self.onLoadComplete( status, audioBufferArray );
        }
    };

    function init( sources ) {
        multiFileLoader.call( self, sources, self.audioContext, self.onLoadProgress, onLoadAll );
        allSounds = sources;
    }

    // Public Properties

    /**
     * Pitch shift of the triggered voices in semitones.
     *
     * @property pitchShift
     * @type SPAudioParam
     * @default 0.0
     * @minvalue -60
     * @maxvalue 60
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'pitchShift', -60.0, 60.0, 0 ) );

    /**
     * Maximum value for random pitch shift of the triggered voices in semitones.
     *
     * @property pitchRand
     * @type SPAudioParam
     * @default 0.0
     * @minvalue 0.0
     * @maxvalue 24
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'pitchRand', 0.0, 24.0, 0 ) );

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

    // Public Functions

    /**
     * Reinitializes the model and sets it's sources.
     *
     * @method setSources
     * @param {Array/AudioBuffer/String/File} sources Single or Array of either URLs or AudioBuffers of sources.
     * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
     * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
     */
    this.setSources = function ( sources, onLoadProgress, onLoadComplete ) {
        BaseSound.prototype.setSources.call( this, sources, onLoadProgress, onLoadComplete );
        init( sources );
    };

    /**
     * Stops playing all voices.
     *
     * @method stop
     *
     */
    this.stop = function ( when ) {
        soundQueue_.stop( when );
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
        BaseSound.prototype.pause.call( this );
    };

    /**
     * Triggers a single voice immediately.
     *
     * @method play
     *
     */
    this.play = function () {
        this.start( 0 );
    };

    /**
     * Triggers a single voice at the given time
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
            console.error( this.modelName, "hasn't finished Initializing yet. Please wait before calling start/play" );
            return;
        }

        if ( typeof when === 'undefined' || when < this.audioContext.currentTime ) {
            when = this.audioContext.currentTime;
        }

        var length = 1;
        if ( Object.prototype.toString.call( allSounds ) === '[object Array]' ) {
            length = allSounds.length;
        }

        if ( this.eventRand.value ) {
            if ( length > 2 ) {
                currentSourceID_ = ( currentSourceID_ + Math.floor( Math.random() * ( length - 1 ) ) ) % length;
            } else {
                currentSourceID_ = Math.floor( Math.random() * ( length - 1 ) );
            }
        } else {
            currentSourceID_ = currentSourceID_ % length;
        }

        var timeStamp = when;
        var playSpeed = Converter.semitonesToRatio( this.pitchShift.value + Math.random() * this.pitchRand.value );

        soundQueue_.queueSetSource( timeStamp, currentEventID_, sourceBuffers_[ currentSourceID_ ] );
        soundQueue_.queueSetParameter( timeStamp, currentEventID_, 'playSpeed', playSpeed );
        soundQueue_.queueStart( timeStamp, currentEventID_ );
        currentEventID_++;
        currentSourceID_++;

        BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
    };

    // SoundQueue based model.
    soundQueue_ = new SoundQueue( this.audioContext, this.onAudioStart, this.onAudioEnd );

    window.setTimeout( function () {
        init( sources );
    }, 0 );
}

Trigger.prototype = Object.create( BaseSound.prototype );

module.exports = Trigger;
