/**
 * @module Effects
 */

"use strict";
var BaseEffect = require( '../core/BaseEffect' );
var SPAudioParam = require( '../core/SPAudioParam' );
var log = require( 'loglevel' );

/**
 *
 * An effect changes the amplitude or volume of the audio that this effect is connected to.
 * @class Distorter
 * @constructor
 * @param {AudioContext} [context] AudioContext to be used.
 * @extends BaseEffect
 */
function Distorter( context ) {
    if ( !( this instanceof Distorter ) ) {
        throw new TypeError( "Distorter constructor cannot be called as a function." );
    }
    // Call superclass constructor
    BaseEffect.call( this, context );
    this.maxSources = 0;
    this.minSources = 0;
    this.effectName = 'Distorter';

    var waveshaper_ = this.audioContext.createWaveShaper();
    this.inputNode = waveshaper_;
    this.outputNode = waveshaper_;

    /**
     * Fades or reduces the volume of the audio based on the value in percentage. 100% implies
     * no change in volume. 0% implies completely muted audio.
     *
     * @property volume
     * @type SPAudioParam
     * @default 100
     * @minvalue 0
     * @maxvalue 100
     */
    this.registerParameter( new SPAudioParam( this, 'volume', 0, 100, 100, waveshaper_.gain, faderGainMap, null ), false );

    /**
     * Fades or reduces the volume of the audio based on the value in decibles. 0 dB implies no
     * change in volume. -80 dB implies almost completely muted audio.
     *
     * @property volumeInDB
     * @type SPAudioParam
     * @default 0
     * @minvalue -80
     * @maxvalue 0
     */
    this.registerParameter( new SPAudioParam( this, 'volumeInDB', -80, 0, 0, waveshaper_.gain, faderGainMapDB, null ), false );

    this.isInitialized = true;
}

Distorter.prototype = Object.create( BaseEffect.prototype );

module.exports = Distorter;
