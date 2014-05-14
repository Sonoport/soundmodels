/**
 * @module Models
 */
define( [ 'core/Config', 'core/BaseSound', 'core/SoundQueue', 'core/SPAudioParam', 'core/MultiFileLoader', 'core/Converter' ],
    function ( Config, BaseSound, SoundQueue, SPAudioParam, multiFileLoader, Converter ) {
        "use strict";

        /**
         * A sound model which triggers a single or multiple sound files with multiple voices (polyphony).
         *
         *
         * @class Trigger
         * @constructor
         * @extends BaseSound
         * @param {Array/String/AudioBuffer/File} sounds Single or Array of either URLs or AudioBuffers or File of sounds.
         * @param {AudioContext} context AudioContext to be used.
         * @param {Function} [onLoadCallback] Callback when all sounds have finished loading.
         * @param {Function} [onProgressCallback] Callback when the audio file is being downloaded.
         * @param {Function} [onEndedCallback] Callback when the Trigger has finished playing.
         */
        function Trigger( sounds, context, onLoadCallback, onProgressCallback, onEndedCallback ) {
            if ( !( this instanceof Trigger ) ) {
                throw new TypeError( "Trigger constructor cannot be called as a function." );
            }

            // Call superclass constructor
            BaseSound.call( this, context );

            /*Support upto 8 seperate voices*/
            this.maxSources = Config.MAX_VOICES;
            this.numberOfInputs = 1;
            this.numberOfOutputs = 1;
            this.modelName = "Trigger";

            // Private vars
            var self = this;

            // Private Variables
            var sourceBuffers_ = [];
            var soundQueue_;
            var currentEventID_ = 0;
            var currentSourceID_ = 0;

            // Private Functions

            var onAllLoad = function ( status, audioBufferArray ) {
                sourceBuffers_ = audioBufferArray;
                soundQueue_.connect( self.releaseGainNode );
                this.isInitialized = true;
                if ( typeof onLoadCallback === 'function' ) {
                    onLoadCallback( status );
                }
            };

            function init( sounds ) {
                soundQueue_ = new SoundQueue( self.audioContext );
                multiFileLoader.call( self, sounds, self.audioContext, onAllLoad, onProgressCallback );
            }

            // Public Properties

            /**
             * Pitch shift of the triggered voices in semitones.
             *
             * @property pitchShift
             * @type SPAudioParam
             * @default 0
             * @minvalue -60
             * @maxvalue 60
             */
            this.pitchShift = SPAudioParam.createPsuedoParam( "pitchShift", -60.0, 60.0, 0, this.audioContext );

            /**
             * Maximum value for random pitch shift of the triggered voices in semitones.
             *
             * @property pitchRand
             * @type SPAudioParam
             * @default 0
             * @minvalue 0
             * @maxvalue 24
             */
            this.pitchRand = SPAudioParam.createPsuedoParam( "pitchRand", 0.0, 24.0, 0, this.audioContext );

            /**
             * Enable randomness in the order of sources which are triggered.
             *
             * @property eventRand
             * @type SPAudioParam
             * @default false
             * @minvalue true
             * @maxvalue false
             */
            this.eventRand = SPAudioParam.createPsuedoParam( "eventRand", true, false, false, this.audioContext );

            // Public Functions

            /**
             * Reinitializes a Trigger and sets it's sources.
             *
             * @method setSources
             * @param {Array/AudioBuffer/String/File} sounds Single or Array of either URLs or AudioBuffers of sounds.
             * @param {Function} [onLoadCallback] Callback when all sounds have finished loading.
             */
            this.setSources = function ( sounds, onLoadCallback ) {
                this.isInitialized = false;
                init( sounds );
            };

            /**
             * Triggers a single voice.
             *
             * @method play
             * @param {Number} [when] At what time (in seconds) the sound be triggered
             *
             */
            this.play = function ( when ) {

                if ( typeof when === "undefined" || when < this.audioContext.currentTime ) {
                    when = this.audioContext.currentTime;
                }

                var length = 1;
                if ( Object.prototype.toString.call( sounds ) === '[object Array]' ) {
                    length = sounds.length;
                }

                if ( this.eventRand.value ) {
                    if ( length > 2 ) {
                        currentSourceID_ = ( currentSourceID_ + 1 + Math.floor( Math.random() * ( length - 1 ) ) ) % length;
                    } else {
                        currentSourceID_ = Math.floor( Math.random() * ( length - 1 ) );
                    }
                } else {
                    currentSourceID_ = ( currentSourceID_ + 1 ) % length;
                }

                var timeStamp = when;
                var playSpeed = Converter.semitonesToRatio( this.pitchShift.value + Math.random() * this.pitchRand.value );

                soundQueue_.queueSetSource( timeStamp, currentEventID_, sourceBuffers_[ currentSourceID_ ] );
                soundQueue_.queueSetParameter( timeStamp, currentEventID_, "playSpeed", playSpeed );
                soundQueue_.queueStart( timeStamp, currentEventID_ );
                currentEventID_++;

                BaseSound.prototype.start.call( this, 0 );
            };

            init( sounds );
        }

        Trigger.prototype = Object.create( BaseSound.prototype );

        return Trigger;

    } );
