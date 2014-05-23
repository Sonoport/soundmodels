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
         * @param {String/AudioBuffer/File} sound Single URL or AudioBuffer or File of sound.
         * @param {AudioContext} context AudioContext to be used.
         * @param {Function} [onLoadCallback] Callback when the sound has finished loading.
         * @param {Function} [onProgressCallback] Callback when the audio file is being downloaded.
         */
        function Extender( sound, context, onLoadCallback, onProgressCallback ) {
            if ( !( this instanceof Extender ) ) {
                throw new TypeError( "Extender constructor cannot be called as a function." );
            }

            // Call superclass constructor
            BaseSound.call( this, context );

            /*Support a single input only*/
            this.maxSources = 1;
            this.numberOfInputs = 1;
            this.numberOfOutputs = 1;
            this.modelName = "Extender";

            // Private Variables
            var self = this;
            var sourceBuffer_;
            var soundQueue_;

            var lastEventID_ = 0;
            var currentEventID_ = 1;

            var lastEventTime_ = 0;
            var lastEventReleaseTime_ = 0;
            var releaseDur_ = 0;

            var onAllLoadCallback = onLoadCallback;

            // Constants
            var MAX_USE = 0.9;

            // Private Functions

            var onAllLoad = function ( status, audioBufferArray ) {
                sourceBuffer_ = audioBufferArray[ 0 ];
                soundQueue_.connect( self.releaseGainNode );

                self.isInitialized = true;
                if ( typeof onAllLoadCallback === 'function' ) {
                    onAllLoadCallback( status );
                }
            };

            function init( sound ) {
                var parameterType = Object.prototype.toString.call( sound );
                if ( parameterType === '[object Array]' && sound.length > 1 ) {
                    throw {
                        name: "Incorrect Parameter type Exception",
                        message: "Extender only accepts a single sound as argument",
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                }
                multiFileLoader.call( self, sound, self.audioContext, onAllLoad, onProgressCallback );
            }

            function extenderCallback() {
                var currentTime = self.audioContext.currentTime;
                var endTime = currentTime + 1 / Config.NOMINAL_REFRESH_RATE;
                var eventLen = self.eventPeriod.value;

                while ( lastEventReleaseTime_ < endTime || lastEventTime_ + eventLen < endTime ) {
                    // This sligthly fiddly expression allows us to generate the next event earlier than the originally
                    // scheduled release time of the previous event, but not later. This is crucial, as we never want
                    // the event to run beyond the end of the available audio.
                    var eventTime = Math.max( currentTime, Math.min( lastEventReleaseTime_, lastEventTime_ + eventLen ) );

                    // Specify the playback speed (which depends on the pitch shift)
                    var playSpeed = Converter.semitonesToRatio( self.pitchShift.value );

                    // If the event length plus crossface exceeds the available audio duration
                    // (taking pitch shift into account), scale both so we don't exceed the
                    // available audio.
                    // Never use more than this fraction of the audio for a single event

                    var xFadeFrac = self.crossFadeDuration.value;
                    var audioDur = sourceBuffer_.duration;
                    var fadeDur = eventLen * xFadeFrac;
                    var requiredDur = playSpeed * ( eventLen + fadeDur );

                    if ( requiredDur > MAX_USE * audioDur ) {
                        var scale = MAX_USE * audioDur / requiredDur;
                        eventLen *= scale;
                        fadeDur *= scale;
                    }
                    requiredDur = playSpeed * ( eventLen + fadeDur );

                    // Find a suitable start point as a fraction of the total length in the audio,
                    // taking into account the required amount of audio
                    var startPoint = Math.max( 0, 1 - requiredDur / audioDur ) * Math.random();

                    //console.log( "Start Point : " + startPoint + " playSpeed : " + playSpeed + " fadeDur : " + fadeDur + " audioDur : " + audioDur + " eventTime : " + eventTime + " eventLen : " + eventLen );

                    //  Stop/release the *previous* audio snippet
                    if ( lastEventID_ > 0 ) {
                        soundQueue_.queueRelease( eventTime, lastEventID_, releaseDur_ );
                    }
                    // Queue up an event to specify all the properties
                    soundQueue_.queueSetSource( eventTime, currentEventID_, sourceBuffer_ );
                    soundQueue_.queueSetParameter( eventTime, currentEventID_, "playSpeed", playSpeed );
                    soundQueue_.queueSetParameter( eventTime, currentEventID_, "startPoint", startPoint );
                    //  Queue the start of the audio snippet
                    soundQueue_.queueStart( eventTime, currentEventID_, fadeDur );

                    releaseDur_ = fadeDur;
                    lastEventTime_ = eventTime;
                    lastEventReleaseTime_ = eventTime + eventLen;
                    lastEventID_ = currentEventID_;
                    ++currentEventID_;
                }

                // Keep making callback request if sound is still playing.
                if ( self.isPlaying ) {
                    window.requestAnimationFrame( extenderCallback );
                }
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
             * @param {Array/AudioBuffer/String/File} sound Single or Array of either URLs or AudioBuffers of sound.
             * @param {Function} [onLoadCallback] Callback when all sound have finished loading.
             */
            this.setSources = function ( sound, onLoadCallback ) {
                this.isInitialized = false;
                onAllLoadCallback = onLoadCallback;
                init( sound );
            };

            /**
             * Starts playing the sound.
             *
             * @method play
             * @param {Number} [when] At what time (in seconds) the sound be triggered
             *
             */
            this.play = function ( when ) {
                BaseSound.prototype.start.call( this, 0 );
                extenderCallback();
            };

            soundQueue_ = new SoundQueue( this.context );

            if ( sound )
                init( sound );
        }

        Extender.prototype = Object.create( BaseSound.prototype );

        return Extender;

    } );
