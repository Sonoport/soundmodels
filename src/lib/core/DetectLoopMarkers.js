/**
 * @class DetectLoopMarkers
 * @module FileReader
 * @description Detect loop markers.
 */
define( function () {
    "use strict";

    /**
     * DetectLoopMarkers
     * @method DetectLoopMarkers
     * @param AudioBuffer buffer A buffer within which Loop Markers need to be detected.
     */
    function DetectLoopMarkers( buffer ) {

        self = this;

        var nLoopStart_ = 0;
        var nLoopEnd_ = 0;

        this.PREPOSTFIX_LEN = 5000;
        this.SPIKE_THRESH = 0.5;
        this.MAX_MP3_SILENCE = 20000;
        this.SILENCE_THRESH = 0.1;

        /**
         * A helper method to help find the markers in an AudioBuffer.
         * @method findSilence_
         * @param AudioBuffer buffer A buffer within which markers needs to be detected.
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
                pos < self.MAX_MP3_SILENCE ) {

                if ( aRightChannel_[ pos ] > self.SPIKE_THRESH &&
                    ( buffer.numberOfChannels === 1 ||
                        aLeftChannel_[ pos ] < -self.SPIKE_THRESH ) ) {
                    startSpikePos = pos;
                    break;
                } else {
                    pos++;
                }
            }

            // Find marker near end of file
            pos = buffer.length - 1;

            while ( endSpikePos < 0 && pos > 0 &&
                buffer.length - pos < self.MAX_MP3_SILENCE ) {
                if ( aRightChannel_[ pos ] > self.SPIKE_THRESH &&
                    ( buffer.numberOfChannels === 1 ||
                        aLeftChannel_[ pos ] < -self.SPIKE_THRESH ) ) {
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
                nLoopStart_ = startSpikePos + self.PREPOSTFIX_LEN / 2;
                nLoopEnd_ = endSpikePos - self.PREPOSTFIX_LEN / 2;

                return true;
            }

            // Spikes not found!
            nLoopStart_ = 0;
            nLoopEnd_ = buffer.length;

            return false;
        };

        /**
         * A helper method to help find the silence in findSilence_
         * @method checkSilenceThreshold_
         * @param Boolean prev The value from the previous call.
         * @param Float32Array thisChannel Values from a specific channel of the AudioBuffer.
         */
        var checkSilenceThreshold_ = function ( prev, thisChannel ) {
            return prev && thisChannel[ nLoopStart_ ] < self.SILENCE_THRESH;
        };

        /**
         * A helper method to help find the silence in an AudioBuffer. Used of Loop Markers are not
         * found in the AudioBuffer.
         * @method findSilence_
         * @param AudioBuffer buffer A buffer within which silence needs to be detected.
         * @returns Object A object with start and end properties indicating the index at which
         * the loop should start and end.
         */
        var findSilence_ = function ( buffer ) {

            var channels = [];
            var allChannelsSilent = true;

            for ( var index = 0; index < buffer.numberOfChannels; index++ ) {
                channels.push( new Float32Array( buffer.getChannelData( index ) ) );
            }

            nLoopStart_ = 0;
            while ( nLoopStart_ < self.MAX_MP3_SILENCE &&
                nLoopStart_ < buffer.length ) {

                allChannelsSilent = channels.reduce( checkSilenceThreshold_, true );

                if ( allChannelsSilent ) {
                    nLoopStart_++;
                } else {
                    break;
                }
            }

            nLoopEnd_ = buffer.length - 1;
            while ( buffer.length - nLoopEnd_ < self.MAX_MP3_SILENCE &&
                nLoopEnd_ > 0 ) {

                allChannelsSilent = channels.reduce( checkSilenceThreshold_, true );

                if ( allChannelsSilent ) {
                    nLoopEnd_++;
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
