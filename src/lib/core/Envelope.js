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

        this.isSustained = false;
        this.attackDur = 0.010;
        this.decayDur = 0.010;
        this.sustainDur = 0.010;
        this.releaseDur = 0.010;
        this.sustainVal = 0.5;

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
    Envelope.prototype.release = function release( fadeTime ) {
        BaseSound.prototype.release.call( this, fadeTime );
        // If there is sustain
        if ( this.isSustained ) {
            console.log( "sustained" );
            // Cancel all audioparam in ADSR
            var now = this.audioContext.currentTime;
            this.releaseGainNode.gain.cancelScheduledValues( now );
            // Anchor gain value
            //this.releaseGainNode.gain.setValueAtTime( this.releaseGainNode.gain.value, now );
            // Set release again
            this.releaseGainNode.gain.linearRampToValueAtTime( 0, now + fadeTime );
            // Stops the sound after currentTime + fadeTime + FADE_TIME_PAD
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

        useSustain = useSustain || false;
        attackDur = attackDur || this.attackDur;
        decayDur = decayDur || this.decayDur;
        sustainDur = sustainDur || this.sustainDur;
        releaseDur = releaseDur || this.releaseDur;
        sustainVal = sustainVal || this.sustainVal;

        this.isSustained = useSustain;

        var attackVal = 1.0;
        var releaseVal = 0;

        // Set the ADSR using Web Audio default audio param
        // Attack
        this.releaseGainNode.gain.linearRampToValueAtTime( attackVal, this.audioContext.currentTime );
        // Decay
        this.releaseGainNode.gain.linearRampToValueAtTime( sustainVal, this.audioContext.currentTime + attackDur );
        // Sustain
        this.releaseGainNode.gain.linearRampToValueAtTime( sustainVal, this.audioContext.currentTime + attackDur + decayDur );
        if ( useSustain ) {
            // Continue sustaining until release() is called.
            this.releaseGainNode.gain.linearRampToValueAtTime( sustainVal, this.audioContext.currentTime + attackDur + decayDur + sustainDur );
        } else {
            // Release
            console.log( "to release" );
            this.releaseGainNode.gain.linearRampToValueAtTime( releaseVal, this.audioContext.currentTime + attackDur + decayDur + sustainDur );
        }

    };
    Envelope.prototype.reinit = function () {
        // 
    };
    // Return constructor function
    return Envelope;
} );
