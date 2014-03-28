/**
 * @class Trigger
 * @description A sound model which triggers a specific sound file with multiple voices
 * @module Looper
 */
define( [ 'core/BaseSound', 'core/SoundQueue', 'core/SPAudioParam', 'core/MultiFileLoader', 'core/Converter' ],
    function ( BaseSound, SoundQueue, SPAudioParam, multiFileLoader, Converter ) {
        "use strict";

        function Trigger( sounds, onLoadCallback, context ) {
            if ( !( this instanceof Trigger ) ) {
                throw new TypeError( "Trigger constructor cannot be called as a function." );
            }

            // Call superclass constructor
            BaseSound.call( this, context );

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
                onLoadCallback();
            };

            function init() {
                soundQueue_ = new SoundQueue( context );
                multiFileLoader( sounds, context, onAllLoad );
            }

            // Public Properties
            this.pitchShift = SPAudioParam.createPsuedoParam( "pitchShift", -60.0, 0.0, 60.0, this.audioContext );

            this.pitchRand = SPAudioParam.createPsuedoParam( "pitchRand", 0.0, 0.0, 24.0, this.audioContext );

            this.eventRand = SPAudioParam.createPsuedoParam( "eventRand", true, false, false, this.audioContext );

            // Public Functions

            this.play = function () {

                if ( this.eventRand ) {
                    if ( sounds.length > 2 ) {
                        currentSourceID_ = ( currentSourceID_ + 1 + Math.floor( Math.random() * ( sounds.length - 1 ) ) ) % sounds.length;
                    } else {
                        currentSourceID_ = Math.floor( Math.random() * ( sounds.length - 1 ) );
                    }
                } else {
                    currentSourceID_ = ( currentSourceID_ + 1 ) % sounds.length;
                }

                var timeStamp = context.currentTime;
                var playSpeed = Converter.semitonesToRatio( this.pitchShift + Math.random() * this.pitchRand );

                soundQueue_.queueSetParameter( timeStamp, currentEventID_, "playSpeed", playSpeed );
                soundQueue_.queueSetSource( timeStamp, currentEventID_, sourceBuffers_[ currentSourceID_ ] );
                soundQueue_.queueStart( timeStamp, currentEventID_ );

                currentEventID_++;
            };

            init();

        }

        return Trigger;

    } );
