/**
 *  @module Core
 */
'use strict';
var BaseSound = require( '../core/BaseSound' );

/**
 * Implements an ASDR Envelope.
 *
 * @class Envelope
 * @constructor
 * @extends BaseSound
 * @param {AudioContext} context AudioContext in which this Sound is defined.
 */
function Envelope( context ) {
    // This first guard ensures that the callee has invoked our Class' constructor function
    // with the `new` keyword - failure to do this will result in the `this` keyword referring
    // to the callee's scope (typically the window global) which will result in the following fields
    // (name and _age) leaking into the global namespace and not being set on this object.
    // source: https://gist.github.com/jonnyreeves/2474026
    if ( !( this instanceof Envelope ) ) {
        throw new TypeError( "Envelope constructor cannot be called as a function." );
    }
    // Pass in an audioContext
    BaseSound.call( this, context );

    if ( typeof context !== 'undefined' ) {
        this.audioContext = context;
    }

    this.numberOfInputs = 1;
    this.numberOfOutputs = 1;
    /**
     * The input node that the output node will be connected to.
     *
     * @property inputNode
     * @type Object
     * @default Internal Release-GainNode
     */
    this.inputNode = this.releaseGainNode;

    // Set gain to 0
    this.releaseGainNode.gain.value = 0;

    // Envelope Characteristics
    var attackDur;
    var decayDur;
    var sustainDur;
    var releaseDur;
    var sustainVal;
    var useSustain;

    // Constants
    var attackVal = 1;
    var releaseVal = 0;

    /**
     * Start the Envelope.
     *
     * @method start
     * @param {Number} [when] Time (in seconds) at which the Envelope will start.
     */
    this.start = function start( when ) {
        BaseSound.prototype.start.call( this, when );
        if ( typeof when === 'undefined' || when < this.audioContext.currentTime ) {
            when = this.audioContext.currentTime;
        }

        // Set the ADSR using Web Audio default audio param
        // Clamp the current gain value at this time
        // If this is not done, the attack linearRampToValueAtTime does not ramp up to 1 smoothly, rather it jumps to 1.
        this.releaseGainNode.gain.setValueAtTime( this.releaseGainNode.gain.value, when );

        // Attack - now this ramp up nicely
        this.releaseGainNode.gain.linearRampToValueAtTime( attackVal, when + attackDur );

        // Decay
        this.releaseGainNode.gain.linearRampToValueAtTime( sustainVal, when + attackDur + decayDur );

        // Sustain
        this.releaseGainNode.gain.linearRampToValueAtTime( sustainVal, when + attackDur + decayDur + sustainDur );

        if ( !useSustain ) {
            // Release
            this.releaseGainNode.gain.linearRampToValueAtTime( releaseVal, when + attackDur + decayDur + sustainDur + releaseDur );
        }
    };

    /**
     * Stop the Envelope.
     *
     * @method stop
     * @param {Number} [when] Time (in seconds) at which the Envelope will stop.
     */
    this.stop = function stop( when ) {
        BaseSound.prototype.stop.call( this, when );
        if ( typeof when === 'undefined' ) {
            when = this.audioContext.currentTime;
        }
        // cancel all scheduled ramps on this releaseGainNode
        this.releaseGainNode.gain.cancelScheduledValues( when );
    };

    /**
     * Connect to release Gain Node.
     *
     * @method connect
     * @param {AudioNode} destination AudioNode to connect to.
     * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
     * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
     */
    this.connect = function connect( destination, output, input ) {
        BaseSound.prototype.connect.call( this, destination, output, input );
    };

    /**
     * Disconnect from release Gain Node.
     *
     * @method disconnect
     * @param {Number} [outputIndex]  Index describing which output of the AudioNode to disconnect.
     */
    this.disconnect = function disconnect( outputIndex ) {
        BaseSound.prototype.disconnect.call( this, outputIndex );
    };

    /**
     * Linearly ramps down the gain of releaseGainNode from current value to 0 in fadeTime (s). It is better to call this method on a user initiated event or after some time (in seconds) has passed.
     *
     * @method release
     * @param {Number} [fadeTime] Amount of time (seconds) taken to release or fade out the sound.
     * @param {Number} [when] Time (in seconds) at which the Envelope will release.
     */
    this.release = function release( fadeTime, when ) {
        if ( typeof when === 'undefined' ) {
            when = this.audioContext.currentTime;
        }

        if ( typeof fadeTime === 'undefined' ) {
            fadeTime = releaseDur;
        }

        BaseSound.prototype.release.call( this, fadeTime, when );
    };

    /**
     * Initialize as a classic four-segment ADSR (Attack, Decay, Sustain, Release) envelope.
     *
     * @method initADSR
     * @param {Object} [options] Values that can be passed in to change the shape of the ADSR Envelope.
     *  @param {Boolean} [options.useSustain=false]   If true, hold the sustain end val indefinitely until stop() is called.
     * @param {Number} [options.attackDur=0.01]     Attack Duration (s)
     * @param {Number} [options.decayDur=0.01]      Decay Duration (s)
     * @param {Number} [options.releaseDur=0.01]    Release Duration (s)
     * @param {Number} [options.sustainVal=0.5]    Sustain Level (s)
     */
    this.initADSR = function ( options ) {
        if ( options ) {
            useSustain = options.useSustain || false;
            attackDur = options.attackDur || 0.01;
            decayDur = options.decayDur || 0.01;
            sustainDur = options.sustainDur || 0.01;
            releaseDur = options.releaseDur || 0.01;
            sustainVal = options.sustainVal || 0.5;
        } else {
            useSustain = false;
            attackDur = 0.01;
            decayDur = 0.01;
            sustainDur = 0.01;
            releaseDur = 0.01;
            sustainVal = 0.5;
        }

        this.releaseGainNode.gain.value = 0;
    };

    /**
     * Resets all flags and counters to begin a new envelope traversal.
     *
     * @method reinit
     * @param {Boolean} [hard]  If true, do 'hard' reinit, otherwise attempt to smoothly continue current envelope value.
     * @param {Number} [when] Time (in seconds) at which the Envelope will reinit.
     */
    this.reinit = function ( hard, when ) {
        hard = hard || false;
        if ( typeof when === 'undefined' ) {
            when = this.audioContext.currentTime;
        }
        if ( hard ) {
            // cancel all scheduled ramps on this releaseGainNode
            this.releaseGainNode.gain.cancelScheduledValues( when );
            // Set gain to 0
            this.releaseGainNode.gain.value = 0;
        } else {
            // Clamp the current gain value at this time
            // If this is not done, the attack linearRampToValueAtTime does not ramp up to 1 smoothly, rather it jumps to 1.
            this.releaseGainNode.gain.setValueAtTime( this.releaseGainNode.gain.value, when );
        }
    };

    this.initADSR();
}

Envelope.prototype = Object.create( BaseSound.prototype );
// Return constructor function
module.exports = Envelope;
