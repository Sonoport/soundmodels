/**
 * @module Models
 */
 define( [ 'core/Config', 'core/BaseSound', 'core/SPAudioParam', 'models/Trigger', 'core/Converter' ],
    function ( Config, BaseSound, SPAudioParam, Trigger, Converter ) {
        "use strict";

        /**
         * A sound model which triggers a single or multiple sound files with multiple voices (polyphony)
         * repeatedly.
         *
         *
         * @class MultiTrigger
         * @constructor
         * @extends BaseSound
         * @param {Array/String/AudioBuffer/File} sounds Single or Array of either URLs or AudioBuffers or File of sounds.
         * @param {Function} [onLoadCallback] Callback when all sounds have finished loading.
         * @param {AudioContext} context AudioContext to be used.
         */
         function MultiTrigger( sounds, onLoadCallback, context ) {
            if ( !( this instanceof Trigger ) ) {
                throw new TypeError( "MultiTrigger constructor cannot be called as a function." );
            }

            var trigger;
            var lastEventTime = 0;

            function init() {

                trigger = new Trigger( sounds, onAllLoad, null, context );

            }

            function onAllLoad() {
            }

            function multiTiggerCallback() {

                var currentTime = context.currentTime;
                var endTime = cTime + 1 / Config.NOMINAL_REFRESH_RATE;

                while (lastEventTime + timeToNextEvent < endTime){
                    var eventTime = Math.max(currentTime, lastEventTime + timeToNextEvent);
                    trigger.play(eventTime);
                    lastEventTime = eventTime;
                }

                // Keep making callback request if sound is still playing.
                if ( this.isPlaying  ) {
                    window.requestAnimationFrame( multiTiggerCallback );
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
             this.pitchRand = SPAudioParam.createPsuedoParam( "pitchRand", 0.0, 24.0, 0, this.audioContext );

            /**
             * Enable randomness in the order of sources which are triggered.
             *
             * @property eventRand
             * @type SPAudioParam
             * @default false
             */
             this.eventRand = SPAudioParam.createPsuedoParam( "eventRand", true, false, false, this.audioContext );

            /**
             * Trigger rate for playing the source in Hz.
             *
             * @property eventRate
             * @type SPAudioParam
             * @default false
             */
             this.eventRate = SPAudioParam.createPsuedoParam( "eventRand", 0, 60.0, 1.0, this.audioContext );

            /**
             * Maximum deviance from the regular trigger interval for a random jitter factor in percentage.
             *
             * @property eventJitter
             * @type SPAudioParam
             * @default false
             */
             this.eventJitter = SPAudioParam.createPsuedoParam( "eventRand", 0, 0.99, 1, this.audioContext );

            // Public Functions

            /**
             * Start repeated triggering.
             *
             * @method play
             * @param {Number} [when] At what time (in seconds) the sound be triggered
             *
             */
             this.play = function ( when ) {
                BaseSound.prototype.start.call( this, 0 );
                multiTiggerCallback();
            }

            /**
             * Stop repeated triggering.
             *
             * @method play
             * @param {Number} [when] At what time (in seconds) the sound be triggered
             *
             */
             this.pause = function ( when ) {

             }

             init();
         }

         Trigger.prototype = Object.create( BaseSound.prototype );

         return Trigger;

     } );
