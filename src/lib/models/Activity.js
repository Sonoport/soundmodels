/**
 * @module Models
 */
define( [ 'core/Config', 'core/BaseSound', 'models/Looper', 'core/SPAudioParam' ],
    function ( Config, BaseSound, Looper, SPAudioParam ) {
        "use strict";

        /**
         * A sound model which triggers a single or multiple sound files with multiple voices (polyphony).
         *
         *
         * @class Activity
         * @constructor
         * @extends BaseSound
         * @param {Array/String/AudioBuffer/File} sounds Single or Array of either URLs or AudioBuffers or File of sounds.
         * @param {Function} [onLoadCallback] Callback when all sounds have finished loading.
         * @param {Function} [onEndedCallback] Callback when the Activity has finished playing.
         * @param {AudioContext} context AudioContext to be used.
         */
        function Activity( sounds, onLoadCallback, onEndedCallback, context ) {
            if ( !( this instanceof Activity ) ) {
                throw new TypeError( "Activity constructor cannot be called as a function." );
            }

            // Call superclass constructor
            BaseSound.call( this, context );

            /*Support upto 8 seperate voices*/
            this.maxSources = Config.MAX_VOICES;
            this.numberOfInputs = 1;
            this.numberOfOutputs = 1;

            // Private vars
            var self = this;

            // Private Variables
            var internalLooper_;

            // Private Functions

            function init( sounds ) {
                internalLooper_ = new Looper( sounds, onLoadCallback, onEndedCallback, context );
                internalLooper_.playSpeed.value = 0;
            }

            // Public Properties

            /**
             * Pitch shift of the triggered voices in semitones.
             *
             * @property pitchShift
             * @type SPAudioParam
             * @default 0
             */
            this.action = SPAudioParam.createPsuedoParam( "pitchShift", -60.0, 60.0, 0, this.audioContext );

            /**
             * Maximum value for random pitch shift of the triggered voices in semitones.
             *
             * @property pitchRand
             * @type SPAudioParam
             * @default 0
             */
            this.sensitivity = SPAudioParam.createPsuedoParam( "pitchRand", 0.0, 24.0, 0, this.audioContext );

            /**
             * @property riseTime
             * @type SPAudioParam
             * @default 0.05
             */
            this.riseTime = SPAudioParam.createPsuedoParam( "riseTime", 0.05, 10.0, 1, this.audioContext );

            /**
             * @property decayTime
             * @type SPAudioParam
             * @default 0.05
             */
            this.decayTime = SPAudioParam.createPsuedoParam( "decayTime", 0.05, 10.0, 1, this.audioContext );

            /**
             * @property startPoint
             * @type SPAudioParam
             * @default 0
             */
            this.startPoint = new SPAudioParam( "startPoint", 0.0, 0.99, 0.00, null, null, startPointSetter_, this.audioContext );

            // Public Functions

            /**
             * Reinitializes a Activity and sets it's sources.
             *
             * @method setSources
             * @param {Array/AudioBuffer/String/File} sounds Single or Array of either URLs or AudioBuffers of sounds.
             * @param {Function} [onLoadCallback] Callback when all sounds have finished loading.
             */
            this.setSources = function ( sounds, onLoadCallback ) {
                internalLooper_.setSources( sounds, onLoadCallback );
            };

            /**
             * Enable playback.
             *
             * @method play
             * @param {Number} [when] At what time (in seconds) the sound be triggered
             *
             */
            this.play = function ( when ) {
                internalLooper_.play( when );
            };

            init( sounds );
        }

        Activity.prototype = Object.create( BaseSound.prototype );

        return Activity;

    } );
