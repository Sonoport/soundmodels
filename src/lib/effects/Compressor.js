/**
 * @module Effects
 */

"use strict";
var BaseEffect = require( '../core/BaseEffect' );
var SPAudioParam = require( '../core/SPAudioParam' );

/**
 *
 * An effect changes the amplitude or volume of the audio that this effect is connected to.
 * @class Compressor
 * @constructor
 * @param {AudioContext} [context] AudioContext to be used.
 * @extends BaseEffect
 */
function Compressor( context ) {
    if ( !( this instanceof Compressor ) ) {
        throw new TypeError( "Compressor constructor cannot be called as a function." );
    }
    // Call superclass constructor
    BaseEffect.call( this, context );
    this.maxSources = 0;
    this.minSources = 0;
    this.effectName = 'Compressor';

    var compressor_ = this.audioContext.createDynamicsCompressor();
    this.inputNode = compressor_;
    this.outputNode = compressor_;

    /**
     * The amount of time (in seconds) to reduce the gain by 10dB.
     *
     * @property attack
     * @type SPAudioParam
     * @default 0.003
     * @minvalue 0
     * @maxvalue 1
     */
    this.registerParameter( new SPAudioParam( this, 'attack', 0, 1, 0.003, compressor_.attack ), false );

    /**
     * A decibel value representing the range above the threshold where the curve * smoothly transitions to the "ratio" portion.
     *
     * @property knee
     * @type SPAudioParam
     * @default 30
     * @minvalue 0
     * @maxvalue 40
     */
    this.registerParameter( new SPAudioParam( this, 'knee', 0, 40, 30, compressor_.knee ), false );

    /**
     * The amount of dB change in input for a 1 dB change in output.
     *
     * @property ratio
     * @type SPAudioParam
     * @default 12
     * @minvalue 1
     * @maxvalue 20
     */
    this.registerParameter( new SPAudioParam( this, 'ratio', 0, 20, 12, compressor_.ratio ), false );

    /**
     * The amount of time (in seconds) to increase the gain by 10dB.
     *
     * @property release
     * @type SPAudioParam
     * @default 0.250
     * @minvalue 0
     * @maxvalue 1
     */
    this.registerParameter( new SPAudioParam( this, 'release', 0, 1, 0.250, compressor_.release ), false );

    /**
     * The decibel value above which the compression will start taking effect.
     *
     * @property threshold
     * @type SPAudioParam
     * @default -24
     * @minvalue -100
     * @maxvalue 0
     */
    this.registerParameter( new SPAudioParam( this, 'threshold', -100, 0, -24, compressor_.threshold ), false );

    this.isInitialized = true;
}

Compressor.prototype = Object.create( BaseEffect.prototype );

module.exports = Compressor;
