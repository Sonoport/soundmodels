/**
 * @module Models
 */
define( [ 'core/Config', 'core/BaseSound', 'core/SPAudioParam', 'core/MultiFileLoader' ],
    function ( Config, BaseSound, SPAudioParam, multiFileLoader ) {
        "use strict";
        /**
         *
         * A sound model which loads a sound file and allows it to be looped continuously at variable speed.
         * @class Scrubber
         * @constructor
         * @extends BaseSound
         * @param {Array/String/AudioBuffer/File} sounds Single or Array of either URLs or AudioBuffers or File of sounds.
         * @param {AudioContext} context AudioContext to be used.
         * @param {Function} [onLoadCallback] Callback when all sounds have finished loading.
         */
        function Scrubber( sound, context, onLoadCallback ) {
            if ( !( this instanceof Scrubber ) ) {
                throw new TypeError( "Scrubber constructor cannot be called as a function." );
            }
            // Call superclass constructor
            BaseSound.call( this, context );

            this.maxSources = 1;
            this.numberOfInputs = 1;
            this.numberOfOutputs = 1;

            // Private Variables
            var self = this;

            var sourceBuffer_;
            var scriptNode_;

            var onAllLoad = function ( status, audioBufferArray ) {
                sourceBuffer_ = audioBufferArray;
                scriptNode_ = self.audioContext.createScriptProcessor(0, 0, audioBufferArray.numberOfChannels);
                scriptNode_.onaudioprocess = scriptNodeCallback;
                scriptNode_.connect( self.releaseGainNode );

                this.isInitialized = true;
                if ( typeof onLoadCallback === 'function' ) {
                    onLoadCallback( status );
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
                multiFileLoader.call( self, sound, context, onAllLoad );
            }

            function scriptNodeCallback(processingEvent){
                if (!self.isPlaying) {return;}

                console.log(processingEvent.outputBuffer);

            }

            // Public Parameters

            /**
             * Position of the audio to be played.
             *
             * @property playPosition
             * @type SPAudioParam
             * @default 0
             */
            this.playPosition = SPAudioParam.createPsuedoParam( "playPosition", 0, 1.0, 0, this.audioContext );

            /**
             * Sets if the audio should fade out when playPosition has not changed for a while.
             *
             * @property noMotionFade
             * @type SPAudioParam
             * @default false
             */
            this.noMotionFade = SPAudioParam.createPsuedoParam( "noMotionFade", true, false, true, this.audioContext );

            /**
             * Sets if moving playPosition to backwards should make any sound.
             *
             * @property muteOnReverse
             * @type SPAudioParam
             * @default false
             */
            this.muteOnReverse = SPAudioParam.createPsuedoParam( "muteOnReverse", true, false, true, this.audioContext );


            init(sound);

        }

        Scrubber.prototype = Object.create( BaseSound.prototype );

        return Scrubber;
    } );
