/**
 * @class Trigger
 * @description A sound model which triggers a specific sound file with multiple voices
 * @module Looper
 */
define( [ 'core/Config', 'core/BaseSound', 'core/SoundQueue', 'core/SPAudioParam', 'core/MultiFileLoader', 'core/Converter' ],
    function ( Config, BaseSound, SoundQueue, SPAudioParam, multiFileLoader, Converter ) {
        "use strict";

        function Trigger( sounds, onLoadCallback, context ) {
            if ( !( this instanceof Trigger ) ) {
                throw new TypeError( "Trigger constructor cannot be called as a function." );
            }

            // Call superclass constructor
            BaseSound.call( this, context );

            /*Support upto 8 seperate voices*/
            this.maxSources = Config.MAX_VOICES;

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
                onLoadCallback();
            };

            function init() {
                soundQueue_ = new SoundQueue( context );
                multiFileLoader.call( self, sounds, context, onAllLoad );
            }

            // Public Properties
            this.pitchShift = SPAudioParam.createPsuedoParam( "pitchShift", -60.0, 60.0, 0, this.audioContext );

            this.pitchRand = SPAudioParam.createPsuedoParam( "pitchRand", 0.0, 24.0, 0, this.audioContext );

            this.eventRand = SPAudioParam.createPsuedoParam( "eventRand", true, false, false, this.audioContext );

            // Public Functions

            this.play = function () {

                var length = 1;
                if ( Object.prototype.toString.call( sounds ) === '[object Array]' ) {
                    length = sounds.length;
                }

                if ( this.eventRand ) {
                    if ( length > 2 ) {
                        currentSourceID_ = ( currentSourceID_ + 1 + Math.floor( Math.random() * ( length - 1 ) ) ) % length;
                    } else {
                        currentSourceID_ = Math.floor( Math.random() * ( length - 1 ) );
                    }
                } else {
                    currentSourceID_ = ( currentSourceID_ + 1 ) % length;
                }

                console.log( "Using source # " + currentSourceID_ );

                var timeStamp = context.currentTime;
                var playSpeed = Converter.semitonesToRatio( this.pitchShift.value + Math.random() * this.pitchRand.value );

                soundQueue_.queueSetParameter( timeStamp, currentEventID_, "playSpeed", playSpeed );
                soundQueue_.queueSetSource( timeStamp, currentEventID_, sourceBuffers_[ currentSourceID_ ] );
                soundQueue_.queueStart( timeStamp, currentEventID_ );

                currentEventID_++;
            };

            init();

        }

        Trigger.prototype = Object.create( BaseSound.prototype );

        return Trigger;

    } );
