/**
 * @module Models
 */
define( [ 'core/Config', 'core/BaseSound', 'core/SoundQueue', 'core/SPAudioParam', 'core/MultiFileLoader', 'core/Converter' ],
    function ( Config, BaseSound, SoundQueue, SPAudioParam, multiFileLoader, Converter ) {
        "use strict";

        /**
         * A sound model which extends the playing of a single sound infinitely with windowed overlapping.
         *
         *
         * @class Extender
         * @constructor
         * @extends BaseSound
         * @param {String/AudioBuffer/File} sounds Single URL or AudioBuffer or File of sounds.
         * @param {Function} [onLoadCallback] Callback when the sound has finished loading.
         * @param {AudioContext} context AudioContext to be used.
         */
        function Extender( sound, onLoadCallback, context ) {
            if ( !( this instanceof Extender ) ) {
                throw new TypeError( "Extender constructor cannot be called as a function." );
            }

            // Call superclass constructor
            BaseSound.call( this, context );

            /*Support a single input only*/
            this.maxSources = 1;

            this.numberOfInputs = 1;
            this.numberOfOutputs = 1;

            // Private vars
            var self = this;

            // Private Variables
            var sourceBuffer_ = [];
            var soundQueue_;
            var currentEventID_ = 0;
            var currentSourceID_ = 0;

            // Private Functions

            var onAllLoad = function ( status, audioBufferArray ) {
                sourceBuffer_ = audioBufferArray[ 0 ];
                soundQueue_.connect( self.releaseGainNode );
                onLoadCallback();
            };

            function init( sounds ) {
                soundQueue_ = new SoundQueue( context );
                var parameterType = Object.prototype.toString.call( sounds );
                if ( parameterType === '[object Array]' && sounds.length > 1 ) {
                    throw {
                        name: "Incorrect Parameter type Exception",
                        message: "Extender only accepts a single sound as argument",
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                }
                multiFileLoader.call( self, sounds, context, onAllLoad );
            }

            // Public Properties

            /**
             * Pitch shift of the triggered voices in semitones.
             *
             * @property pitchShift
             * @type SPAudioParam
             * @default 0
             */
            this.pitchShift = SPAudioParam.createPsuedoParam( "pitchShift", -60.0, 60.0, 0, this.audioContext );

            /**
             * Maximum value for random pitch shift of the triggered voices in semitones.
             *
             * @property pitchRand
             * @type SPAudioParam
             * @default 0
             */
            this.eventPeriod = SPAudioParam.createPsuedoParam( "eventPeriod", 0.1, 10.0, 2.0, this.audioContext );

            /**
             * Enable randomness in the order of sources which are triggered.
             *
             * @property eventRand
             * @type SPAudioParam
             * @default false
             */
            this.crossFadeDuration = SPAudioParam.createPsuedoParam( "crossFadeDuration", 0.1, 0.99, 0.5, this.audioContext );

            // Public Functions

            /**
             * Reinitializes a Extender and sets it's sources.
             *
             * @method setSources
             * @param {Array/AudioBuffer/String/File} sounds Single or Array of either URLs or AudioBuffers of sounds.
             * @param {Function} [onLoadCallback] Callback when all sounds have finished loading.
             */
            this.setSources = function ( sounds, onLoadCallback ) {
                init( sounds );
            };

            /**
             * Starts playing the sound.
             *
             * @method play
             * @param {Number} [when] At what time (in seconds) the sound be triggered
             *
             */
            this.play = function ( when ) {

            };

            init( sounds );
        }

        Extender.prototype = Object.create( BaseSound.prototype );

        return Extender;

    } );
