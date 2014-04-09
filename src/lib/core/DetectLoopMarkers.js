/**
 * @module Core
 *
 * @class DetectLoopMarkers
 * @static
 */
define( function () {
    "use strict";

    /**
     *Detector for Loop Marker or Silence. This method helps to detect and trim given AudioBuffer based on Sonoport Loop Markers or based on silence detection.
     *
     *
     * @method DetectLoopMarkers
     * @param {AudioBuffer} buffer A buffer to be trimmed to Loop Markers or Silence.
     * @return {Object} An object with `start` and `end` properties containing the index of the detected start and end points.
     */
    function DetectLoopMarkers( buffer ) {

        var nLoopStart_ = 0;
        var nLoopEnd_ = 0;

        /**
         * Length of PRE and POSTFIX Silence used in Loop Marking
         */
        var PREPOSTFIX_LEN = 5000;

        /**
         * Threshold for Spike Detection in Loop Marking
         */
        var SPIKE_THRESH = 0.5;

        /**
         * Index bounds for searching for Loop Markers and Silence.
         */
        var MAX_MP3_SILENCE = 20000;

        /**
         * Threshold for Silence Detection
         */
        var SILENCE_THRESH = 0.01;

        /**
         * A helper method to help find the markers in an AudioBuffer.
         *
         * @private
         * @method findSilence_
         * @param {AudioBuffer} buffer A buffer within which markers needs to be detected.
         * @return {Boolean} If Loop Markers were found.
         */
        var findMarkers_ = function ( buffer ) {
            var startSpikePos = -1;
            var endSpikePos = -1;

            var aLeftChannel_;
            var aRightChannel_;

            nLoopEnd_ = buffer.length - 1;
            aRightChannel_ = new Float32Array( buffer.getChannelData( 0 ) );
            if ( buffer.numberOfChannels === 2 ) {
                aLeftChannel_ = new Float32Array( buffer.getChannelData( 1 ) );
            }
            // Find marker near start of file
            var pos = 0;

            while ( startSpikePos < 0 && pos < buffer.length &&
                pos < MAX_MP3_SILENCE ) {

                if ( aRightChannel_[ pos ] > SPIKE_THRESH &&
                    ( buffer.numberOfChannels === 1 ||
                        aLeftChannel_[ pos ] < -SPIKE_THRESH ) ) {
                    startSpikePos = pos;
                    break;
                } else {
                    pos++;
                }
            }

            // Find marker near end of file
            pos = buffer.length - 1;

            while ( endSpikePos < 0 && pos > 0 &&
                buffer.length - pos < MAX_MP3_SILENCE ) {
                if ( aRightChannel_[ pos ] > SPIKE_THRESH &&
                    ( buffer.numberOfChannels === 1 ||
                        aLeftChannel_[ pos ] < -SPIKE_THRESH ) ) {
                    endSpikePos = pos;
                    break;
                } else {
                    pos--;
                }
            }
            // If both markers found
            if ( startSpikePos > 0 && endSpikePos > 0 &&
                endSpikePos > startSpikePos ) {
                // Compute loop start and length
                nLoopStart_ = startSpikePos + PREPOSTFIX_LEN / 2;
                nLoopEnd_ = endSpikePos - PREPOSTFIX_LEN / 2;

                return true;
            }

            // Spikes not found!
            nLoopStart_ = 0;
            nLoopEnd_ = buffer.length;

            return false;
        };

        /**
         * A helper method to help find the silence in across multiple channels
         *
         * @private
         * @method silenceCheckGenerator_
         * @param {Number} testIndex The index of the sample which is being checked.
         * @return {Function} A function which can check if the specific sample is beyond the silence threshold
         */
        var silenceCheckGenerator_ = function ( testIndex ) {
            return function ( prev, thisChannel ) {
                return prev && ( Math.abs( thisChannel[ testIndex ] ) < SILENCE_THRESH );
            };
        };

        /**
         * A helper method to help find the silence in an AudioBuffer. Used of Loop Markers are not
         * found in the AudioBuffer. Updates nLoopStart_ and nLoopEnd_ directly.
         *
         * @private
         * @method findSilence_
         * @param {AudioBuffer} buffer A buffer within which silence needs to be detected.
         */
        var findSilence_ = function ( buffer ) {

            var channels = [];
            var allChannelsSilent = true;

            for ( var index = 0; index < buffer.numberOfChannels; index++ ) {
                channels.push( new Float32Array( buffer.getChannelData( index ) ) );
            }

            nLoopStart_ = 0;
            while ( nLoopStart_ < MAX_MP3_SILENCE &&
                nLoopStart_ < buffer.length ) {

                allChannelsSilent = channels.reduce( silenceCheckGenerator_( nLoopStart_ ), true );

                if ( allChannelsSilent ) {
                    nLoopStart_++;
                } else {
                    break;
                }
            }

            nLoopEnd_ = buffer.length - 1;
            while ( buffer.length - nLoopEnd_ < MAX_MP3_SILENCE &&
                nLoopEnd_ > 0 ) {

                allChannelsSilent = channels.reduce( silenceCheckGenerator_( nLoopEnd_ ), true );

                if ( allChannelsSilent ) {
                    nLoopEnd_--;
                } else {
                    break;
                }
            }

            if ( nLoopEnd_ < nLoopStart_ ) {
                nLoopStart_ = 0;
                nLoopLength_ = buffer.length;
            }
        };

        // Only try to find markers if mono or stereo
        if ( ( buffer.numberOfChannels !== 2 || !findMarkers_( buffer ) ) ) {
            findSilence_( buffer );
        }

        // return the markers which were found
        return {
            start: nLoopStart_,
            end: nLoopEnd_
        };
    }

    return DetectLoopMarkers;
} );
