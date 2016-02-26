/**
 * @module Effects
 */
"use strict";
var BaseEffect = require( '../core/BaseEffect' );
var SPAudioParam = require( '../core/SPAudioParam' );

/**
 *
 * A simple stereo fader which moves the stereophonic image of the source left or right.
 * @class Filter
 * @constructor
 * @extends BaseEffect
 */
function Filter( context ) {
    if ( !( this instanceof Filter ) ) {
        throw new TypeError( "Filter constructor cannot be called as a function." );
    }
    // Call superclass constructor
    BaseEffect.call( this, context );
    this.maxSources = 0;
    this.minSources = 0;
    this.effectName = 'Filter';

    var filter_ = this.audioContext.createBiquadFilter();

    this.inputNode = filter_;
    this.outputNode = filter_;

    function typeSetter( aParams, value ) {
        if ( typeof value === 'string' ) {
            filter_.type = value;
        } else {
            console.warn( "Unknown filter type", value );
        }
    }

    /**
     *The frequency at which the BiquadFilterNode will operate, in Hz. Its nominal range is from 10Hz to half the Nyquist frequency.
     *
     * @property frequency
     * @type SPAudioParam
     * @default 350
     * @minvalue 10
     * @maxvalue (AudioContext.sampleRate)/2
     */
    this.registerParameter( new SPAudioParam( this, 'frequency', 10, this.audioContext.sampleRate / 2, 350, filter_.frequency ), false );

    /**
     *A detune value, in cents, for the frequency. Its default value is 0.
     *
     * @property detune
     * @type SPAudioParam
     * @default 0
     * @minvalue -1200
     * @maxvalue 1200
     */
    this.registerParameter( new SPAudioParam( this, 'detune', -1200, 1200, 0, filter_.detune ), false );

    /**
     *The Q factor has a default value of 1, with a nominal range of 0.0001 to 1000.
     *
     * @property Q
     * @type SPAudioParam
     * @default 1
     * @minvalue 0.0001
     * @maxvalue 1000
     */
    this.registerParameter( new SPAudioParam( this, 'Q', 0.0001, 1000, 1, filter_.Q ), false );

    /**
     *The type of this BiquadFilterNode, lowpass, highpass, etc. The exact meaning of the other parameters depend on the value of the type attribute. Possible values for this type are :
     * "lowpass"
     * "highpass"
     * "bandpass"
     * "lowshelf"
     * "highshelf"
     * "peaking"
     * "notch"
     * "allpass"
     *
     * @property type
     * @type SPAudioParam
     * @default "lowpass"
     * @minvalue "lowpass"
     * @maxvalue "allpass"
     */
    this.registerParameter( new SPAudioParam( this, 'type', 'lowpass', 'allpass', 'lowpass', null, null, typeSetter ), false );

    this.isInitialized = true;

}

Filter.prototype = Object.create( BaseEffect.prototype );

module.exports = Filter;
