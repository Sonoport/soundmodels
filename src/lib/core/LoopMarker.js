/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @class LoopMarker
 * @module FileReader
 * @description Detect loop markers.
 */
define( function () {

    "use strict";

    var PREPOSTFIX_LEN = 5000;
    var SPIKE_THRESH = 0.5;

    var MAX_MP3_SILENCE = 20000;
    var SILENCE_THRESH = 0.1;

    var aRightChannel_;
    var aLeftChannel_;
    var nLoopStart_ = 0;
    var nLoopEnd_ = 0;
    var nLoopLength_ = 0;

    /**
     * Determine if loop markers are in the file.
     * @private
     * @method bLoopMarkerFound
     * @param {AudioBuffer} buffer The buffer.
     * @returns {Boolean}
     */
    function bLoopMarkerFound_( buffer ) {

        var startSpikePos = -1;
        var endSpikePos = -1;

        nLoopEnd_ = buffer.length - 1;
        aRightChannel_ = new Float32Array( buffer.getChannelData( 0 ) );

        if ( buffer.numberOfChannels > 1 ) {

            aLeftChannel_ = new Float32Array( buffer.getChannelData( 1 ) );

        }

        // Find spike near start of file
        var pos = 0;

        while ( startSpikePos < 0 && pos < buffer.length && pos < MAX_MP3_SILENCE ) {

            if ( aRightChannel_[ pos ] > SPIKE_THRESH ) {

                if ( buffer.numberOfChannels > 1 ) {

                    if ( aLeftChannel_[ pos ] < -SPIKE_THRESH ) {

                        startSpikePos = pos;
                        break;

                    } else {

                        pos++;

                    }

                } else {

                    startSpikePos = pos;
                    break;

                }

            } else {

                pos++;

            }

        }

        // Find spike near end of file
        pos = buffer.length - 1;

        while ( endSpikePos < 0 && pos > 0 && buffer.length - pos < MAX_MP3_SILENCE ) {

            if ( aRightChannel_[ pos ] > SPIKE_THRESH ) {

                if ( buffer.numberOfChannels > 1 ) {

                    if ( aLeftChannel_[ pos ] < -SPIKE_THRESH ) {

                        endSpikePos = pos;
                        break;

                    } else {

                        pos--;

                    }

                } else {

                    endSpikePos = pos;
                    break;

                }

            } else {

                pos--;

            }

        }

        // If both spikes found
        if ( startSpikePos > 0 && endSpikePos > 0 && endSpikePos > startSpikePos ) {

            // Compute loop start and length
            nLoopStart_ = startSpikePos + PREPOSTFIX_LEN / 2;
            nLoopEnd_ = endSpikePos - PREPOSTFIX_LEN / 2;
            nLoopLength_ = nLoopEnd_ - nLoopStart_;

            return true;

        }

        // Spikes not found!
        nLoopStart_ = 0;
        nLoopLength_ = buffer.length;

        return false;

    }

    /**
     * Trims silence for markers undetected.
     * @private
     * @method trimSilence
     * @param {AudioBuffer} buffer The buffer to trim silence.
     */
    function trimSilence_( buffer ) {

        nLoopEnd_ = buffer.length - 1;

        // Determine if mono or stereo or more than 2 channels
        if ( buffer.numberOfChannels > 1 ) {

            while ( nLoopStart_ < MAX_MP3_SILENCE && nLoopStart_ < nLoopLength_ && Math.abs( aLeftChannel_[ nLoopStart_ ] ) < SILENCE_THRESH && Math.abs( aRightChannel_[ nLoopStart_ ] ) < SILENCE_THRESH ) {

                nLoopStart_++;

            }

            while ( buffer.length - nLoopEnd_ < MAX_MP3_SILENCE && nLoopEnd_ > 0 && Math.abs( aLeftChannel_[ nLoopEnd_ ] ) < SILENCE_THRESH && Math.abs( aRightChannel_[ nLoopEnd_ ] ) < SILENCE_THRESH ) {

                nLoopEnd_--;

            }

        } else {

            while ( nLoopStart_ < MAX_MP3_SILENCE && nLoopStart_ < nLoopLength_ && Math.abs( aRightChannel_[ nLoopStart_ ] ) < SILENCE_THRESH ) {

                nLoopStart_++;

            }

            while ( buffer.length - nLoopEnd_ < MAX_MP3_SILENCE && nLoopEnd_ > 0 && Math.abs( aRightChannel_[ nLoopEnd_ ] ) < SILENCE_THRESH ) {

                nLoopEnd_--;

            }

        }

        if ( nLoopEnd_ > nLoopStart_ ) {

            nLoopLength_ = nLoopEnd_ - nLoopStart_ + 1;

        } else {

            nLoopStart_ = 0;
            nLoopLength_ = buffer.length;

        }

    }

    /**
     * Detect loop markers in the audio file and create if there is none.
     * @method detectMarkers
     * @param {AudioBuffer} buffer
     * @returns {AudioBuffer} The AudioBuffer with the loop marks.
     */
    var detectMarkers = function ( buffer ) {

        if ( !bLoopMarkerFound_( buffer ) ) {

            console.log( "Loop markers not found" );
            trimSilence_( buffer );

        }

    };

    /**
     * Get the end marker.
     * @method getEndMarker
     * @returns {Number} The end marker position. Default value is 0;
     */
    var getEndMarker = function () {

        return nLoopEnd_;

    };

    /**
     * Get the start marker.
     * @method getStartMarker
     * @returns {Number} The start marker position. Default value is 0;
     */
    var getStartMarker = function () {

        return nLoopStart_;

    };

    /**
     * Get loop length based on the start and end markers.
     * @method getLoopLength
     * @returns {Number} The loop length. Default value is 0;
     */
    var getLoopLength = function () {

        return nLoopLength_;

    };

    // Exposed methods
    return {

        detectMarkers: detectMarkers,
        getStartMarker: getStartMarker,
        getEndMarker: getEndMarker,
        getLoopLength: getLoopLength

    };

} );
