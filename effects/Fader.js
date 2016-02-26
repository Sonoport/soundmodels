/**
 * @module Effects
 */

"use strict";
var BaseEffect = require( '../core/BaseEffect' );
var SPAudioParam = require( '../core/SPAudioParam' );
var Converter = require( '../core/Converter' );
var log = require( 'loglevel' );

/**
 *
 * An effect changes the amplitude or volume of the audio that this effect is connected to.
 * @class Fader
 * @constructor
 * @param {AudioContext} [context] AudioContext to be used.
 * @extends BaseEffect
 */
function Fader( context ) {
    if ( !( this instanceof Fader ) ) {
        throw new TypeError( "Fader constructor cannot be called as a function." );
    }
    // Call superclass constructor
    BaseEffect.call( this, context );
    this.maxSources = 0;
    this.minSources = 0;
    this.effectName = 'Fader';

    var faderGain_ = this.audioContext.createGain();
    this.inputNode = faderGain_;
    this.outputNode = faderGain_;

    function faderGainMap( volume ) {
        log.debug( "Setting volume to ", volume / 100.0 );
        return volume / 100.0;
    }

    function faderGainMapDB( volumeInDB ) {
        log.debug( "Setting volume (DB) to ", Converter.dBFStoRatio( volumeInDB ) );
        return Converter.dBFStoRatio( volumeInDB );
    }

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
    this.registerParameter( new SPAudioParam( this, 'volume', 0, 100, 100, faderGain_.gain, faderGainMap, null ), false );

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
    this.registerParameter( new SPAudioParam( this, 'volumeInDB', -80, 0, 0, faderGain_.gain, faderGainMapDB, null ), false );

    this.isInitialized = true;
}

Fader.prototype = Object.create( BaseEffect.prototype );

module.exports = Fader;
