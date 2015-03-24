/**
 * @module Effects
 */

"use strict";
var BaseEffect = require( '../core/BaseEffect' );
var SPAudioParam = require( '../core/SPAudioParam' );

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
    var filter_ = this.audioContext.createBiquadFilter();
    this.inputNode = filter_;
    this.outputNode = waveshaper_;

    filter_.type = 'bandpass';
    filter_.connect( waveshaper_ );

    var curveLength_ = 22050;
    var curve_ = new Float32Array( curveLength_ );
    var deg_ = Math.PI / 180;

    function driveSetter_( param, value ) {
        var k = value * 100;

        for ( var i = 0; i < curveLength_; i++ ) {
            var x = i * 2 / curveLength_ - 1;
            curve_[ i ] = ( 3 + k ) * x * 20 * deg_ / ( Math.PI + k * Math.abs( x ) );
        }
        waveshaper_.curve = curve_;
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
    this.registerParameter( new SPAudioParam( this, 'drive', 0, 1.0, 0.5, null, null, driveSetter_ ), false );

    /**
     *
     *
     * @property volume
     * @type SPAudioParam
     * @default 100
     * @minvalue 0
     * @maxvalue 100
     */
    this.registerParameter( new SPAudioParam( this, 'color', 0, 22050, 800, filter_.frequency ), false );

    this.isInitialized = true;
}

Distorter.prototype = Object.create( BaseEffect.prototype );

module.exports = Distorter;
