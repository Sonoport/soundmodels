/**
 * @module Effects
 */
define( [ 'core/Config', 'core/BaseEffect', 'core/SPAudioParam', 'core/Converter' ],
    function ( Config, BaseEffect, SPAudioParam, Converter ) {
        "use strict";

        /**
         *
         * An effect changes the amplitude or volume of the audio that this effect is connected to.
         * @class Fader
         * @constructor
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

            this.numberOfInputs = 1;

            var faderGain_ = this.audioContext.createGain();
            this.inputNode = faderGain_;
            this.outputNode = faderGain_;

            function faderGainMap( volume ) {
                // console.log( "Setting volume to ", volume / 100.0 );
                return volume / 100.0;
            }

            function faderGainMapDB( volumeInDB ) {
                // console.log( "Setting volume (DB) to ", Converter.dBFStoRatio( volumeInDB ) );
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
            this.registerParameter( new SPAudioParam( this, 'volume', 0, 100, 100, faderGain_.gain, faderGainMap, null ), true );

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
            this.registerParameter( new SPAudioParam( this, 'volumeInDB', -80, 0, 0, faderGain_.gain, faderGainMapDB, null ), true );
        }

        Fader.prototype = Object.create( BaseEffect.prototype );

        return Fader;

    } );
