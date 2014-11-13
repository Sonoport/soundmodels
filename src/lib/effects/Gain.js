/**
 * @module Effects
 */
define( [ 'core/Config', 'core/BaseSound', 'core/SPAudioParam' ],
    function ( Config, BaseSound, SPAudioParam ) {
        "use strict";

        /**
         *
         * An effect changes the amplitude or volume of the audio that this effect is connected to.
         * @class Gain
         * @constructor
         * @extends BaseSound
         * @param {AudioContext} [context] AudioContext to be used.
         * @param {Array/String/AudioBuffer/File} [sources] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
         * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
         * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
         * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
         * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
         * @param {Function} [onTrackEnd] Callback when an individual track has finished playing.
         */
        function Gain( context ) {
            if ( !( this instanceof Gain ) ) {
                throw new TypeError( "Gain constructor cannot be called as a function." );
            }
            // Call superclass constructor
            BaseSound.call( this, context );
            this.maxSources = 0;
            this.minSources = 0;
            this.modelName = 'Gain';

            this.numberOfInputs = 1;
        }

        Gain.prototype = Object.create( BaseSound.prototype );

        return Gain;

    } );
