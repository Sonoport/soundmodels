/**
 * @module Effects
 */

"use strict";
var BaseEffect = require( '../core/BaseEffect' );
var SPAudioParam = require( '../core/SPAudioParam' );
var reverbGen = require( 'reverbGen' );
// var numChannels_ = require( 'loglevel' );

/**
 *
 * An effect changes the amplitude or volume of the audio that this effect is connected to.
 * @class Reverb
 * @constructor
 * @param {AudioContext} [context] AudioContext to be used.
 * @extends BaseEffect
 */
function Reverb( context ) {
    if ( !( this instanceof Reverb ) ) {
        throw new TypeError( "Reverb constructor cannot be called as a function." );
    }
    // Call superclass constructor
    BaseEffect.call( this, context );
    this.maxSources = 0;
    this.minSources = 0;
    this.effectName = 'Reverb';

    var reverbConvolver_ = this.audioContext.createConvolver();
    this.inputNode = reverbConvolver_;
    this.outputNode = reverbConvolver_;

    var fadeInTime_ = 0.1;
    var decayTime_ = 1.5;
    var sampleRate_ = context.sampleRate;
    var lpFreqStart_ = 15000;
    var lpFreqEnd_ = 1000;

    var self = this;

    function regenIR() {
        var params = {
            audioContext: self.audioContext,
            fadeInTime: fadeInTime_,
            decayTime: decayTime_,
            sampleRate: sampleRate_,
            lpFreqStart: lpFreqStart_,
            lpFreqEnd: lpFreqEnd_,
            numChannels: 2
        };

        reverbGen.generateReverb( params, function ( buffer ) {
            reverbConvolver_.buffer = buffer;
        } );
    }

    function fadeInTimeSetter( param, value ) {
        fadeInTime_ = value;
        regenIR();
    }

    function decayTimeSetter( param, value ) {
        decayTime_ = value;
        regenIR();
    }

    function lowPassStartFreqSetter( param, value ) {
        lpFreqStart_ = value;
        regenIR();
    }

    function lowPassEndFreqSetter( param, value ) {
        lpFreqEnd_ = value;
        regenIR();
    }

    /**
     * Fade-in Time.
     *
     * @property fadeInTime
     * @type SPAudioParam
     * @default 0.1
     * @minvalue 0.01
     * @maxvalue 1
     */
    this.registerParameter( new SPAudioParam( this, 'fadeInTime', 0.01, 1, 0.1, null, null, fadeInTimeSetter ), false );

    /**
     *
     *
     * @property decayTime
     * @type SPAudioParam
     * @default 1.5
     * @minvalue 0.1
     * @maxvalue 10
     */
    this.registerParameter( new SPAudioParam( this, 'decayTime', 0.1, 10, 1.5, null, null, decayTimeSetter ), false );

    /**
     *
     *
     * @property decayTime
     * @type SPAudioParam
     * @default 15000
     * @minvalue 0
     * @maxvalue 20000
     */
    this.registerParameter( new SPAudioParam( this, 'lowPassStartFreq', 0, 20000, 15000, null, null, lowPassStartFreqSetter ), false );

    /**
     *
     * @property decayTime
     * @type SPAudioParam
     * @default 1000
     * @minvalue 0
     * @maxvalue 20000
     */
    this.registerParameter( new SPAudioParam( this, 'lowPassEndFreq', 0, 20000, 1000, null, null, lowPassEndFreqSetter ), false );

    this.isInitialized = true;
}

Reverb.prototype = Object.create( BaseEffect.prototype );

module.exports = Reverb;
