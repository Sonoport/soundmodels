/**
Envelope class extends BaseSound that implements EnvelopeNode.

@class Envelope
@constructor
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
        if ( typeof context !== "undefined" ) {
            this.audioContext = context;
            console.log( "env current audioContext" );
        }
        // Set gain to 0
        this.releaseGainNode.gain.value = 0;
        this.attackDur = 0.010;
        this.decayDur = 0.010;
        this.sustainDur = 0.010;
        this.releaseDur = 0.010;
        this.sustainVal = 0.5;
        this.useSustain = false;

        console.log( "Envelope Node " );

    }
    // Inherits from BaseSound
    // Use Object.create() to setup inheritance but does not invoke any constructor
    // Using new ChildClass(); will invoke the constructor and create a senario which it is being called twice.
    Envelope.prototype = Object.create( BaseSound.prototype );
    Envelope.prototype.constructor = Envelope;

    // Envelope class methods
    /**
    @method start
     **/
    Envelope.prototype.start = function start() {
        BaseSound.prototype.start.call( this );
    };
    /**
    @method stop
     **/
    Envelope.prototype.stop = function stop() {
        BaseSound.prototype.stop.call( this );
    };
    /**
    @method play
     **/
    Envelope.prototype.play = function play() {
        BaseSound.prototype.play.call( this );
    };
    /**
    @method stop
     **/
    Envelope.prototype.pause = function pause() {
        BaseSound.prototype.pause.call( this );
    };
    /**
    @method connect 
    **/
    Envelope.prototype.connect = function connect( output ) {
        BaseSound.prototype.connect.call( this, output );
        console.log( "env connect" );
    };
    /**
    @method disconnect
    **/
    Envelope.prototype.disconnect = function disconnect( output ) {
        BaseSound.prototype.disconnect.call( this, output );
    };
    /**
    @method release
    **/
    Envelope.prototype.release = function release( fadeTime ) {
        BaseSound.prototype.release.call( this, fadeTime );
        // If there is sustain
        if ( this.useSustain ) {
            console.log( "sustained", this.FADE_TIME_PAD );
            // Set release again
            this.releaseGainNode.gain.linearRampToValueAtTime( 0, this.audioContext.currentTime + this.attackDur + this.decayDur + this.sustainDur + this.releaseDur + fadeTime );
            //this.releaseGainNode.gain.linearRampToValueAtTime( 0, this.audioContext.currentTime + fadeTime );
        }
    };
    /**
    Initialize as a classic four-segment ADSR (Attack, Decay, Sustain, Release) envelope.

    @method initADSR
    @param {Boolean} useSustain   If true, hold the sustain end val indefinitely until stop() is called.
    @param {Number} attackDur     Attack Duration (s)
    @param {Number} decayDur      Decay Duration (s)
    @param {Number} releaseDur    Release Duration (s)
    @param {Number} sustainVal    Sustain Level (s)
    @return null
    **/
    Envelope.prototype.initADSR = function ( useSustain, attackDur, decayDur, sustainDur, releaseDur, sustainVal ) {

        this.useSustain = useSustain || false;
        this.attackDur = attackDur || this.attackDur;
        this.decayDur = decayDur || this.decayDur;
        this.sustainDur = sustainDur || this.sustainDur;
        this.releaseDur = releaseDur || this.releaseDur;
        this.sustainVal = sustainVal || this.sustainVal;

        var attackVal = 1;
        var releaseVal = 0;

        this.releaseGainNode.gain.cancelScheduledValues( this.audioContext.currentTime );

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
        if ( useSustain ) {
            // Continue sustaining until release() is called.
            this.releaseGainNode.gain.linearRampToValueAtTime( this.sustainVal, this.audioContext.currentTime + this.attackDur + this.decayDur + this.sustainDur + this.releaseDur );
        } else {
            // Release
            console.log( "to release" );
            this.releaseGainNode.gain.linearRampToValueAtTime( releaseVal, this.audioContext.currentTime + this.attackDur + this.decayDur + this.sustainDur + this.releaseDur );
        }

        console.log( this.attackDur, this.decayDur, this.sustainDur, this.releaseDur, this.sustainVal, this.useSustain );

    };
    /**
    @method reinit
    **/
    Envelope.prototype.reinit = function () {
        // cancel all scheduled ramps on this releaseGainNode
        this.releaseGainNode.gain.cancelScheduledValues( this.audioContext.currentTime );
    };
    // Return constructor function
    return Envelope;
} );
