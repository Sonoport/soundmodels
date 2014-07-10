/**
 * @module Models
 */
define( [ 'core/Config', 'core/BaseSound', 'core/SoundQueue', 'core/SPAudioParam', 'core/MultiFileLoader', 'core/Converter', 'core/WebAudioDispatch' ],
    function ( Config, BaseSound, SoundQueue, SPAudioParam, multiFileLoader, Converter, webAudioDispatch ) {
        "use strict";

        /**
         * A model which extends the playing of a single source infinitely with windowed overlapping.
         *
         *
         * @class Extender
         * @constructor
         * @extends BaseSound
         * @param {String/AudioBuffer/File} source Single URL or AudioBuffer or File Object of the audio source.
         * @param {AudioContext} context AudioContext to be used.
         * @param {Function} [onLoadCallback] Callback when the source has finished loading.
         * @param {Function} [onProgressCallback] Callback when the audio file is being downloaded.
         */
        function Extender( source, context, onLoadCallback, onProgressCallback ) {
            if ( !( this instanceof Extender ) ) {
                throw new TypeError( "Extender constructor cannot be called as a function." );
            }

            // Call superclass constructor
            BaseSound.call( this, context );
            /*Support a single input only*/
            this.maxSources = 1;
            this.minSources = 1;
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

            // Constants
            var MAX_USE = 0.9;

            // Private Functions

            var createCallbackWith = function ( onLoadCallback ) {
                return function ( status, audioBufferArray ) {
                    sourceBuffer_ = audioBufferArray[ 0 ];
                    soundQueue_.connect( self.releaseGainNode );

                    if ( status ) {
                        self.isInitialized = true;
                    }
                    if ( typeof onLoadCallback === 'function' ) {
                        onLoadCallback( status );
                    }
                };
            };

            function init( source, onLoadCallback, onProgressCallback ) {
                multiFileLoader.call( self, source, self.audioContext, createCallbackWith( onLoadCallback ), onProgressCallback );
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

                    // Find a suitable start point as a offset taking into account the required amount of audio
                    var startOffset = Math.max( 0, audioDur - requiredDur ) * Math.random();

                    //console.log( "Start Point : " + startPoint + " playSpeed : " + playSpeed + " fadeDur : " + fadeDur + " audioDur : " + audioDur + " eventTime : " + eventTime + " eventLen : " + eventLen );

                    //  Stop/release the *previous* audio snippet
                    if ( lastEventID_ > 0 ) {
                        soundQueue_.queueRelease( eventTime, lastEventID_, releaseDur_ );
                    }
                    // Queue up an event to specify all the properties
                    soundQueue_.queueSetSource( eventTime, currentEventID_, sourceBuffer_ );
                    soundQueue_.queueSetParameter( eventTime, currentEventID_, "playSpeed", playSpeed );
                    //  Queue the start of the audio snippet
                    soundQueue_.queueStart( eventTime, currentEventID_, startOffset, fadeDur );

                    releaseDur_ = fadeDur;
                    lastEventTime_ = eventTime;
                    lastEventReleaseTime_ = eventTime + eventLen;
                    lastEventID_ = currentEventID_;
                    ++currentEventID_;
                }

                // Keep making callback request if source is still playing.
                if ( self.isPlaying ) {
                    window.requestAnimationFrame( extenderCallback );
                }
            }

            // Public Properties

            /**
             * Amount of pitch shift of the source in the each window (in semitones).
             *
             * @property pitchShift
             * @type SPAudioParam
             * @default 0.0
             * @minvalue -60.0
             * @maxvalue 60.0
             */
            this.pitchShift = SPAudioParam.createPsuedoParam( "pitchShift", -60.0, 60.0, 0, this.audioContext );

            /**
             * The length (in seconds) of each window used to overlap the source.
             *
             * @property eventPeriod
             * @type SPAudioParam
             * @default 2.0
             * @minvalue 0.1
             * @maxvalue 10.0
             */
            this.eventPeriod = SPAudioParam.createPsuedoParam( "eventPeriod", 0.1, 10.0, 2.0, this.audioContext );

            /**
             * Fraction of each window of the source that is overlapped with the succeding window of the source.
             *
             * @property crossFadeDuration
             * @type SPAudioParam
             * @default 0.5
             * @minvalue 0.1
             * @maxvalue 0.99
             */
            this.crossFadeDuration = SPAudioParam.createPsuedoParam( "crossFadeDuration", 0.1, 0.99, 0.5, this.audioContext );

            // Public Functions

            /**
             * Reinitializes a Extender and sets it's sources.
             *
             * @method setSources
             * @param {Array/AudioBuffer/String/File} source Single or Array of either URLs or AudioBuffers of source.
             * @param {Function} [onLoadCallback] Callback when all source have finished loading.
             * @param {Function} [onProgressCallback] Callback when the audio file is being downloaded.
             */
            this.setSources = function ( source, onLoadCallback, onProgressCallback ) {
                this.isInitialized = false;
                init( source, onLoadCallback, onProgressCallback );
            };

            /**
             * Starts playing the source
             *
             * @method stop
             * @param {Number} when The delay in seconds before playing the source
             * @param {Number} [offset] The starting position of the playhead
             * @param {Number} [duration] Duration of the portion (in seconds) to be played
             * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
             *
             */
            this.start = function ( when, offset, duration, attackDuration ) {
                if ( !this.isInitialized ) {
                    console.error( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
                    return;
                }
                BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
                webAudioDispatch( extenderCallback, when, this.audioContext );
            };

            /**
             * Plays the model immediately
             *
             * @method play
             *
             */
            this.play = function () {
                this.start( 0 );
            };

            /**
             * Pauses the model immediately
             *
             * @method pause
             *
             */
            this.pause = function () {
                BaseSound.prototype.pause.call( this );
                soundQueue_.pause();
            };

            /**
             * Stops playing the model.
             *
             * @method stop
             * @param {Number} [when] At what time (in seconds) the model be stopped
             *
             */
            this.stop = function ( when ) {
                BaseSound.prototype.stop.call( this, when );
                soundQueue_.stop( when );
            };

            soundQueue_ = new SoundQueue( this.audioContext );

            if ( source ) {
                init( source, onLoadCallback, onProgressCallback );
            }
        }

        Extender.prototype = Object.create( BaseSound.prototype );

        return Extender;

    } );
