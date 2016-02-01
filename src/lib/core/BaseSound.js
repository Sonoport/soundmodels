/**
 * @module Core
 */

'use strict';
var SafeAudioContext = require( '../core/SafeAudioContext' );
var webAudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

/**
 * Pseudo AudioNode class the encapsulates basic functionality of an Audio Node. To be extended by all other Sound Models
 *
 * @class BaseSound
 * @constructor
 * @requires AudioContextMonkeyPatch
 * @param {AudioContext} [context] AudioContext in which this Sound is defined.
 */
function BaseSound( context ) {
    /**
     * Web Audio API's AudioContext. If the context passed to the constructor is an AudioContext, a new one is created here.
     *
     * @property audioContext
     * @type AudioContext
     */
    if ( context === undefined || context === null ) {
        log.debug( 'Making a new AudioContext' );
        this.audioContext = new SafeAudioContext();
    } else {
        this.audioContext = context;
    }

    bootAudioContext( this.audioContext );

    /**
     * Number of inputs
     *
     * @property numberOfInputs
     * @type Number
     * @default 0
     */
    this.numberOfInputs = 0;

    /**
     * Number of outputs
     *
     * @property numberOfOutputs
     * @type Number
     * @default 0
     */
    Object.defineProperty( this, 'numberOfOutputs', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this.releaseGainNode.numberOfOutputs;
        }
    } );

    /**
     *Maximum number of sources that can be given to this Sound
     *
     * @property maxSources
     * @type Number
     * @default 0
     */
    var maxSources_ = 0;
    Object.defineProperty( this, 'maxSources', {
        enumerable: true,
        configurable: false,
        set: function ( max ) {
            if ( max < 0 ) {
                max = 0;
            }
            maxSources_ = Math.round( max );
        },
        get: function () {
            return maxSources_;
        }
    } );

    /**
     *Minimum number of sources that can be given to this Sound
     *
     * @property minSources
     * @type Number
     * @default 0
     */
    var minSources_ = 0;
    Object.defineProperty( this, 'minSources', {
        enumerable: true,
        configurable: false,
        set: function ( max ) {
            if ( max < 0 ) {
                max = 0;
            }
            minSources_ = Math.round( max );
        },
        get: function () {
            return minSources_;
        }
    } );

    /**
     * Release Gain Node
     *
     * @property releaseGainNode
     * @type GainNode
     * @default Internal GainNode
     * @final
     */
    this.releaseGainNode = this.audioContext.createGain();
    this.releaseGainNode.gain.prevEndTime = 0;

    /**
     *  If Sound is currently playing.
     *
     * @property isPlaying
     * @type Boolean
     * @default false
     */
    this.isPlaying = false;

    /**
     *  If Sound is currently initialized.
     *
     * @property isInitialized
     * @type Boolean
     * @default false
     */
    this.isInitialized = false;

    /**
     * The input node that the output node will be connected to. <br />
     * Set this value to null if no connection can be made on the input node
     *
     * @property inputNode
     * @type Object
     * @default null
     **/
    this.inputNode = null;

    /**
     * Set of nodes the output of this sound is currently connected to.
     *
     * @property destinations
     * @type Array
     * @default
     **/
    this.destinations = [];

    /**
     * String name of the model.
     *
     * @property modelName
     * @type String
     * @default "Model"
     **/
    this.modelName = 'Model';

    /**
     * Callback for handling progress events thrown during loading of audio files.
     *
     * @property onLoadProgress
     * @type Function
     * @default null
     */
    this.onLoadProgress = null;

    /**
     * Callback for when loading of audio files is done and the the model is initalized.
     *
     * @property onLoadComplete
     * @type Function
     * @default null
     */
    this.onLoadComplete = null;

    /**
     * Callback for when the audio is about to start playing.
     *
     * @property onAudioStart
     * @type Function
     * @default null
     */
    this.onAudioStart = null;

    /**
     * Callback for the audio is about to stop playing.
     *
     * @property onAudioEnd
     * @type Function
     * @default null
     */
    this.onAudioEnd = null;

    this.isBaseSound = true;

    this.dispatches_ = [];

    this.parameterList_ = [];

    this.connect( this.audioContext.destination );

    function bootAudioContext( context ) {

        var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
        var isSafari = /Safari/.test( navigator.userAgent ) && /Apple Computer/.test( navigator.vendor );
        var desiredSampleRate = typeof desiredSampleRate === 'number' ? desiredSampleRate : 44100;

        if ( isSafari ) {
            if ( context.state && context.state === 'suspended' ) {
                context.resume();
            }
        }

        function createDummyBuffer() {
            // actually this does nothing. support for older devices support iOS 8 and below
            var buffer = context.createBuffer( 1, 1, desiredSampleRate );
            var dummy = context.createBufferSource();
            dummy.buffer = buffer;
            dummy.connect( context.destination );
            dummy.start( 0 );
            dummy.disconnect();
            if ( context.state && context.state === 'suspended' ) {
                context.resume();
            }
            log.debug( 'currentTime & state ', context.currentTime, context.state );
            setTimeout( function () {
                if ( context.state && context.state === 'running' ) {
                    log.debug( 'context state', context.state );
                    document.body.removeEventListener( 'touchend', createDummyBuffer );
                }
            }, 0 );

        }
        if ( iOS || isSafari ) {
            if ( !window.liveAudioContexts ) {
                window.liveAudioContexts = [];
            }
            if ( window.liveAudioContexts.indexOf( context ) < 0 ) {
                log.debug( 'audio context created' );
                document.body.addEventListener( 'touchend', createDummyBuffer );
                window.liveAudioContexts.push( context );
            }
        }
    }
}

/**
 * If the parameter `output` is an AudioNode, it connects to the releaseGainNode.
 * If the output is a BaseSound, it will connect BaseSound's releaseGainNode to the output's inputNode.
 *
 * @method connect
 * @param {AudioNode} destination AudioNode to connect to.
 * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
 * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
 */
BaseSound.prototype.connect = function ( destination, output, input ) {
    if ( destination instanceof AudioNode ) {
        this.releaseGainNode.connect( destination, output, input );
        this.destinations.push( {
            'destination': destination,
            'output': output,
            'input': input
        } );
    } else if ( destination.inputNode instanceof AudioNode ) {
        this.releaseGainNode.connect( destination.inputNode, output, input );
        this.destinations.push( {
            'destination': destination.inputNode,
            'output': output,
            'input': input
        } );
    } else {
        log.error( "No Input Connection - Attempts to connect " + ( typeof destination ) + " to " + ( typeof this ) );
    }
};

/**
 * Disconnects the Sound from the AudioNode Chain.
 *
 * @method disconnect
 * @param {Number} [outputIndex] Index describing which output of the AudioNode to disconnect.
 **/
BaseSound.prototype.disconnect = function ( outputIndex ) {
    this.releaseGainNode.disconnect( outputIndex );
    this.destinations = [];
};

/**
 * Start the AudioNode. Abstract method. Override this method when a Node is defined.
 *
 * @method start
 * @param {Number} when Time (in seconds) when the sound should start playing.
 * @param {Number} [offset] The starting position of the playhead
 * @param {Number} [duration] Duration of the portion (in seconds) to be played
 * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
 */
BaseSound.prototype.start = function ( when, offset, duration, attackDuration ) {
    if ( typeof when === 'undefined' || when < this.audioContext.currentTime ) {
        when = this.audioContext.currentTime;
    }

    // Estimate the current value based on the previous ramp.
    var currentValue = 1;
    if ( this.releaseGainNode.gain.prevEndTime > when ) {
        currentValue = this.releaseGainNode.gain.prevStartValue + ( this.releaseGainNode.gain.prevTargetValue - this.releaseGainNode.gain.prevStartValue ) * ( ( when - this.releaseGainNode.gain.prevStartTime ) / ( this.releaseGainNode.gain.prevEndTime - this.releaseGainNode.gain.prevStartTime ) );
    }

    // Cancel all automation
    this.releaseGainNode.gain.cancelScheduledValues( when );
    if ( typeof attackDuration !== 'undefined' ) {
        log.debug( "Ramping from " + offset + "  in " + attackDuration );
        this.releaseGainNode.gain.setValueAtTime( currentValue, when );
        this.releaseGainNode.gain.linearRampToValueAtTime( 1, when + attackDuration );

        this.releaseGainNode.gain.prevStartTime = when;
        this.releaseGainNode.gain.prevStartValue = currentValue;
        this.releaseGainNode.gain.prevTargetValue = 1;
        this.releaseGainNode.gain.prevEndTime = when + attackDuration;

    } else {
        this.releaseGainNode.gain.setValueAtTime( 1, when );

        this.releaseGainNode.gain.prevStartTime = when;
        this.releaseGainNode.gain.prevStartValue = 1;
        this.releaseGainNode.gain.prevTargetValue = 1;
        this.releaseGainNode.gain.prevEndTime = when;
    }

    var self = this;
    this.dispatch( function () {
        self.isPlaying = true;
    }, when );
};

/**
 * Stop the AudioNode. Abstract method. Override this method when a Node is defined.
 *
 * @method stop
 * @param {Number} [when] Time (in seconds) the sound should stop playing
 */
BaseSound.prototype.stop = function ( when ) {
    if ( typeof when === 'undefined' || when < this.audioContext.currentTime ) {
        when = this.audioContext.currentTime;
    }

    var self = this;
    this.dispatch( function () {
        self.isPlaying = false;
        self.clearDispatches();
    }, when );
};

/**
 * Linearly ramp down the gain of the audio in time (seconds) to 0.
 *
 * @method release
 * @param {Number} [when] Time (in seconds) at which the Envelope will release.
 * @param {Number} [fadeTime] Amount of time (seconds) it takes for linear ramp down to happen.
 * @param {Boolean} [resetOnRelease] Boolean to define if release stops (resets) the playback or just pauses it.
 */
BaseSound.prototype.release = function ( when, fadeTime, resetOnRelease ) {

    if ( this.isPlaying ) {
        var FADE_TIME = 0.5;

        if ( typeof when === 'undefined' || when < this.audioContext.currentTime ) {
            when = this.audioContext.currentTime;
        }

        fadeTime = fadeTime || FADE_TIME;

        // Estimate the current value based on the previous ramp.
        var currentValue = 1;
        if ( this.releaseGainNode.gain.prevEndTime > when ) {
            currentValue = this.releaseGainNode.gain.prevStartValue + ( this.releaseGainNode.gain.prevTargetValue - this.releaseGainNode.gain.prevStartValue ) * ( ( when - this.releaseGainNode.gain.prevStartTime ) / ( this.releaseGainNode.gain.prevEndTime - this.releaseGainNode.gain.prevStartTime ) );
        }

        // Set that value as static value (stop automation);
        this.releaseGainNode.gain.cancelScheduledValues( when );
        this.releaseGainNode.gain.setValueAtTime( currentValue, when );
        this.releaseGainNode.gain.linearRampToValueAtTime( 0, when + fadeTime );

        this.releaseGainNode.gain.prevStartTime = when;
        this.releaseGainNode.gain.prevStartValue = currentValue;
        this.releaseGainNode.gain.prevTargetValue = 0;
        this.releaseGainNode.gain.prevEndTime = when + fadeTime;

        // Pause the sound after currentTime + fadeTime
        if ( !resetOnRelease ) {
            var self = this;
            this.dispatch( function () {
                self.pause();
            }, when + fadeTime );
        }
    }
};

/**
 * Reinitializes the model and sets it's sources.
 *
 * @method setSources
 * @param {Array/AudioBuffer/String/File} sources Single or Array of either URLs or AudioBuffers or File Objects of the audio sources.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
 */
BaseSound.prototype.setSources = function ( sources, onLoadProgress, onLoadComplete ) {
    this.isInitialized = false;

    if ( typeof onLoadProgress === 'function' ) {
        this.onLoadProgress = onLoadProgress;
    }

    if ( typeof onLoadComplete === 'function' ) {
        this.onLoadComplete = onLoadComplete;
    }
};

/**
 * Play sound. Abstract method. Override this method when a Node is defined.
 *
 * @method play
 */
BaseSound.prototype.play = function () {
    this.start( 0 );
};

/**
 * Pause sound. Abstract method. Override this method when a Node is defined.
 *
 * @method pause
 */
BaseSound.prototype.pause = function () {
    this.isPlaying = false;
};

/**
 * Registers a Parameter to the model. This ensures that the Parameter is unwritable and allows
 * to lock in the configurability of the object.
 *
 * @param  {SPAudioParam} audioParam
 */
BaseSound.prototype.registerParameter = function ( audioParam, configurable ) {

    if ( configurable === undefined || configurable === null ) {
        configurable = false;
    }

    Object.defineProperty( this, audioParam.name, {
        enumerable: true,
        configurable: configurable,
        value: audioParam
    } );

    var self = this;
    var replaced = false;
    this.parameterList_.forEach( function ( thisParam, paramIndex ) {
        if ( thisParam.name === audioParam.name ) {
            self.parameterList_.splice( paramIndex, 1, audioParam );
            replaced = true;
        }
    } );

    if ( !replaced ) {
        this.parameterList_.push( audioParam );
    }
};

/**
 * List all SPAudioParams this Sound exposes
 *
 * @method listParams
 * @param {Array} [paramArray] Array of all the SPAudioParams this Sound exposes.
 */
BaseSound.prototype.listParams = function () {
    return this.parameterList_;
};

/**
 * Adds an sound effect to the output of this model, and connects the output of the effect to the Audio Destination
 *
 * @method setOutputEffect
 * @param {Object} effect An Sound Effect of type BaseEffect to be appended to the output of this Sound.
 */
BaseSound.prototype.setOutputEffect = function ( effect ) {
    this.disconnect();
    this.connect( effect );
    effect.connect( this.audioContext.destination );
};

BaseSound.prototype.dispatch = function ( functionCall, time ) {
    var dispatchID = webAudioDispatch( function () {
        if ( typeof dispatchID !== "undefined" ) {
            var idIndex = this.dispatches_.indexOf( dispatchID );
            if ( idIndex > -1 ) {
                this.dispatches_.splice( idIndex, 1 );
            } else {
                log.warn( "Can't find ID", dispatchID, "in the list of dispatches" );
            }
        }
        functionCall();
    }.bind( this ), time, this.audioContext );

    if ( dispatchID !== null ) {
        this.dispatches_.push( dispatchID );
    }
};

BaseSound.prototype.clearDispatches = function () {
    this.dispatches_.forEach( function ( thisId ) {
        log.debug( "Clearing timeout for", thisId );
        window.clearInterval( thisId );
    } );
    this.dispatches_ = [];
};

// Return constructor function
module.exports = BaseSound;
