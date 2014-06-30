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
            this.modelName = "Trigger";

            // Private vars
            var self = this;

            // Private Variables
            var sourceBuffers_ = [];
            var soundQueue_;
            var currentEventID_ = 0;
            var currentSourceID_ = 0;
            var allSounds;

            // Private Functions

            var createCallbackWith = function ( onLoadCallback ) {
                return function ( status, audioBufferArray ) {
                    sourceBuffers_ = audioBufferArray;
                    soundQueue_.connect( self.releaseGainNode );
                    self.isInitialized = true;
                    if ( typeof onLoadCallback === 'function' ) {
                        onLoadCallback( status );
                    }
                };
            };

            function init( sounds, onLoadCallback, onProgressCallback ) {
                multiFileLoader.call( self, sounds, self.audioContext, createCallbackWith( onLoadCallback ), onProgressCallback );
                allSounds = sounds;
            }

            // Public Properties

            /**
             * Pitch shift of the triggered voices in semitones.
             *
             * @property pitchShift
             * @type SPAudioParam
             * @default 0.0
             * @minvalue -60
             * @maxvalue 60
             */
            this.pitchShift = SPAudioParam.createPsuedoParam( "pitchShift", -60.0, 60.0, 0, this.audioContext );

            /**
             * Maximum value for random pitch shift of the triggered voices in semitones.
             *
             * @property pitchRand
             * @type SPAudioParam
             * @default 0.0
             * @minvalue 0.0
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
             * @param {Function} [onProgressCallback] Callback when the audio file is being downloaded.
             */
            this.setSources = function ( sounds, onLoadCallback, onProgressCallback ) {
                this.isInitialized = false;
                init( sounds, onLoadCallback, onProgressCallback );
            };

            /**
             * Stops playing all voices.
             *
             * @method stop
             *
             */
            this.stop = function ( when ) {
                soundQueue_.stop( when );
                BaseSound.prototype.stop.call( this, when );
            };

            /**
             * Pauses playing all voices.
             *
             * @method pause
             *
             */
            this.pause = function () {
                soundQueue_.pause();
            };

            /**
             * Triggers a single voice immediately.
             *
             * @method play
             *
             */
            this.play = function () {
                this.start( 0 );
            };

            /**
             * Triggers a single voice at the given time
             *
             * @method start
             * @param {Number} when The delay in seconds before playing the sound
             * @param {Number} [offset] The starting position of the playhead
             * @param {Number} [duration] Duration of the portion (in seconds) to be played
             * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
             *
             */
            this.start = function ( when, offset, duration, attackDuration ) {
                if ( !this.isInitialized ) {
                    throw new Error( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
                }

                if ( typeof when === "undefined" || when < this.audioContext.currentTime ) {
                    when = this.audioContext.currentTime;
                }

                var length = 1;
                if ( Object.prototype.toString.call( allSounds ) === '[object Array]' ) {
                    length = allSounds.length;
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
                console.log( playSpeed, currentSourceID_ );
                soundQueue_.queueStart( timeStamp, currentEventID_ );
                currentEventID_++;

                BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
            };

            // SoundQueue Based Model.
            soundQueue_ = new SoundQueue( this.audioContext );

            if ( sounds ) {
                init( sounds, onLoadCallback, onProgressCallback );
            }
        }

        Trigger.prototype = Object.create( BaseSound.prototype );

        return Trigger;

    } );
