/**
Envelope class that extends BaseSound which implements an EnvelopeNode.

@class Envelope
@param {AudioContext} context
@constructor
@extends BaseSound
**/
define( [ 'core/BaseSound' ], function ( BaseSound ) {
    'use strict';

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
        /**
        Inherits the audioContext defined from BaseSound.

        @property audioContext
        @type AudioContext
        **/
        if ( typeof context !== "undefined" ) {
            this.audioContext = context;
        }
        /**
        Number of inputs

        @property numberOfInputs
        @type Number
        @default 1
        **/
        this.numberOfInputs = 1;
        /**
        Number of outputs

        @property numberOfOutputs
        @type Number
        @default 1
        **/
        this.numberOfOutputs = 1;
        /**
        Attack duration of the ADSR Envelope.

        @property attackDur
        @type Number
        @default 0.010
        **/
        this.attackDur = 0.010;
        /**
        Decay duration of the ADSR Envelope.

        @property decayDur
        @type Number
        @default 0.010
        **/
        this.decayDur = 0.010;
        /**
        Sustain duration of the ADSR Envelope.

        @property sustainDur
        @type Number
        @default 0.010
        **/
        this.sustainDur = 0.010;
        /**
        Release duration of the ADSR Envelope.

        @property releaseDur
        @type Number
        @default 0.010
        **/
        this.releaseDur = 0.010;
        /**
        Sustain value.

        @property sustainVal
        @type Number
        @default 0.5
        **/
        this.sustainVal = 0.5;
        /**
        If true, continue to sustain the envelope on sustainVal until release() is called

        @property useSustain
        @type Boolean
        @default false
        **/
        this.useSustain = false;
        /**
        The input node that the output node will be connected to. <br />
        It is currently points to the release gain node.

        @property inputNode
        @type Object
        @default null
        **/
        this.inputNode = this.releaseGainNode;
        // Set gain to 0
        this.releaseGainNode.gain.value = 0;

    }
    // Inherits from BaseSound
    // Use Object.create() to setup inheritance but does not invoke any constructor
    // Using new ChildClass(); will invoke the constructor and create a senario which it is being called twice.
    Envelope.prototype = Object.create( BaseSound.prototype );
    Envelope.prototype.constructor = Envelope;
    /**
    Stop sound.

    @method stop
    @return null
    **/
    Envelope.prototype.stop = function stop( startTime ) {
        BaseSound.prototype.stop.call( this, startTime );
        if ( typeof startTime === "undefined" ) {
            startTime = 0;
        }
        // cancel all scheduled ramps on this releaseGainNode
        this.releaseGainNode.gain.cancelScheduledValues( this.audioContext.currentTime + startTime );
    };
    // Envelope class methods
    /**
    Connect to release Gain Node.

    @method connect
    @param {Object} output connects releaseGainNode to another Audio Node.
    @return null
    **/
    Envelope.prototype.connect = function connect( output ) {
        BaseSound.prototype.connect.call( this, output );
    };
    /**
    Disconnect from release Gain Node.

    @method disconnect
    @param {Number} outputIndex disconnects releaseGainnode from an Audio Node.
    @return null
    **/
    Envelope.prototype.disconnect = function disconnect( outputIndex ) {
        BaseSound.prototype.disconnect.call( this, outputIndex );
    };
    /**
    Linearly ramps down the gain of releaseGainNode from current value to 0 in fadeTime (s).
    It is better to call this method on a user initiated event or after some time (in seconds) has passed. 

    @method release
    @param {Number} fadeTime
    @return null
    **/
    Envelope.prototype.release = function release( fadeTime ) {
        BaseSound.prototype.release.call( this, fadeTime );
        fadeTime = fadeTime || this.FADE_TIME;
        // Clamp the current gain value at this point of time to prevent sudden jumps.
        this.releaseGainNode.gain.setValueAtTime( this.releaseGainNode.gain.value, this.audioContext.currentTime );
        this.releaseGainNode.gain.linearRampToValueAtTime( 0, this.audioContext.currentTime + fadeTime );
    };
    /**
    Initialize as a classic four-segment ADSR (Attack, Decay, Sustain, Release) envelope.

    @method initADSR
    @param {Object} [options] Values that can be passed in to change the shape of the ADSR Envelope.
        @param {Boolean} [options.useSustain=false]   If true, hold the sustain end val indefinitely until stop() is called.
        @param {Number} [options.attackDur=0.01]     Attack Duration (s)
        @param {Number} [options.decayDur=0.01]      Decay Duration (s)
        @param {Number} [options.releaseDur=0.01]    Release Duration (s)
        @param {Number} [options.sustainVal=0.5]    Sustain Level (s)
    @return null
    **/
    Envelope.prototype.initADSR = function ( options ) {
        if ( options ) {
            this.useSustain = options.useSustain || false;
            this.attackDur = options.attackDur || 0.01;
            this.decayDur = options.decayDur || 0.01;
            this.sustainDur = options.sustainDur || 0.01;
            this.releaseDur = options.releaseDur || 0.01;
            this.sustainVal = options.sustainVal || 0.5;
        }

        var attackVal = 1;
        var releaseVal = 0;

        // Set the ADSR using Web Audio default audio param
        // Clamp the current gain value at this time
        // If this is not done, the attack linearRampToValueAtTime does not ramp up to 1 smoothly, rather it jumps to 1.
        this.releaseGainNode.gain.setValueAtTime( this.releaseGainNode.gain.value, this.audioContext.currentTime );
        // Attack 
        // now this ramp up nicely
        this.releaseGainNode.gain.linearRampToValueAtTime( attackVal, this.audioContext.currentTime + this.attackDur );
        // Decay
        this.releaseGainNode.gain.linearRampToValueAtTime( this.sustainVal, this.audioContext.currentTime + this.attackDur + this.decayDur );
        // Sustain
        this.releaseGainNode.gain.linearRampToValueAtTime( this.sustainVal, this.audioContext.currentTime + this.attackDur + this.decayDur + this.sustainDur );
        if ( !this.useSustain ) {
            // Release
            this.releaseGainNode.gain.linearRampToValueAtTime( releaseVal, this.audioContext.currentTime + this.attackDur + this.decayDur + this.sustainDur + this.releaseDur );
        }
    };
    /**
    Resets all flags and counters to begin a new envelope traversal.

    @method reinit
    @param {Boolean} hard   If true, do 'hard' reinit, otherwise attempt to smoothly continue current envelope value.
    @return null
    **/
    Envelope.prototype.reinit = function ( hard ) {

        hard = hard || false;

        if ( hard ) {
            // cancel all scheduled ramps on this releaseGainNode
            this.releaseGainNode.gain.cancelScheduledValues( this.audioContext.currentTime );
            // Set gain to 0
            this.releaseGainNode.gain.value = 0;
        } else {
            // Clamp the current gain value at this time
            // If this is not done, the attack linearRampToValueAtTime does not ramp up to 1 smoothly, rather it jumps to 1.
            this.releaseGainNode.gain.setValueAtTime( this.releaseGainNode.gain.value, this.audioContext.currentTime );
        }

    };
    // Return constructor function
    return Envelope;
} );
