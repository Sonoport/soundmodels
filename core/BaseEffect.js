/**
 * @module Core
 */
'use strict';
var SafeAudioContext = require( '../core/SafeAudioContext' );
var log = require( 'loglevel' );

/**
 * Pseudo AudioNode class the encapsulates basic functionality of an Audio Node. To be extended by all other Effects
 *
 * @class BaseEffect
 * @constructor
 * @requires AudioContextMonkeyPatch
 * @param {AudioContext} [context] AudioContext in which this Sound is defined.
 */
function BaseEffect( context ) {
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
     * The output node of this effect. This node will be connected to the next Effect or destination
     *
     * @property inputNode
     * @type AudioNode
     * @final
     */
    this.inputNode = null;

    /**
     * Number of inputs
     *
     * @property numberOfInputs
     * @type Number
     * @default 0
     */
    Object.defineProperty( this, 'numberOfInputs', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this.inputNode.numberOfOutputs || 0;
        }
    } );

    /**
     * The output node of this effect. This node will be connected to the next Effect or destination
     *
     * @property outputNode
     * @type AudioNode
     * @final
     */
    this.outputNode = null;

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
            return this.outputNode.numberOfOutputs || 0;
        }
    } );

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
     * Set of nodes the output of this effect is currently connected to.
     *
     * @property destinations
     * @type Array
     * @default
     **/
    this.destinations = [];

    /**
     * String name of the effect.
     *
     * @property modelName
     * @type String
     * @default "Model"
     **/
    this.effectName = 'Effect';

    this.isBaseEffect = true;

    this.parameterList_ = [];

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
        if ( iOS ) {
            if ( !window.liveAudioContexts ) {
                window.liveAudioContexts = [];
            }
            if ( window.liveAudioContexts.indexOf( context ) < 0 ) {
                document.body.addEventListener( 'touchend', createDummyBuffer );
                window.liveAudioContexts.push( context );
            }
        }
    }
}

/**
 * If the parameter `output` is an AudioNode, it connects to the outputNode.
 * If the output is a BaseEffect, it will connect BaseEffect's outputNode to the output's inputNode.
 *
 * @method connect
 * @param {AudioNode} destination AudioNode to connect to.
 * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
 * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
 */
BaseEffect.prototype.connect = function ( destination, output, input ) {
    if ( destination instanceof AudioNode ) {
        this.outputNode.connect( destination, output, input );
        this.destinations.push( {
            'destination': destination,
            'output': output,
            'input': input
        } );
    } else if ( destination.inputNode instanceof AudioNode ) {
        this.outputNode.connect( destination.inputNode, output, input );
        this.destinations.push( {
            'destination': destination.inputNode,
            'output': output,
            'input': input
        } );
    } else {
        log.error( "No Input Connection - Attempts to connect " + ( typeof output ) + " to " + ( typeof this ) );
    }
};

/**
 * Disconnects the Sound from the AudioNode Chain.
 *
 * @method disconnect
 * @param {Number} [outputIndex] Index describing which output of the AudioNode to disconnect.
 **/
BaseEffect.prototype.disconnect = function ( outputIndex ) {
    this.outputNode.disconnect( outputIndex );
    this.destinations = [];
};

/**
 * Registers a Parameter to the model. This ensures that the Parameter is unwritable and allows
 * to lock in the configurability of the object.
 *
 * @param  {SPAudioParam} audioParam
 */
BaseEffect.prototype.registerParameter = function ( audioParam, configurable ) {

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
BaseEffect.prototype.listParams = function () {
    return this.parameterList_;
};

// Return constructor function
module.exports = BaseEffect;
