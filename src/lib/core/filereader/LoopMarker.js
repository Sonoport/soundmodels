/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @name core.filereader.LoopMarker
 * @description Detect loop markers
 */
define(function() {

    "use strict";

    var MAX_MP3_SILENCE = 20000;
    var PREPOSTFIX_LEN = 5000;
    var SPIKE_THRESH = 0.5;

    var _nLoopStart;
    var _nLoopLength;

    /**
     * Determine if loop markers are in the file
     * @param {type} buffer
     * @returns {Boolean}
     */
    var _bLoopMarkerFound = function(buffer) {

        var aRightChannel = new Float32Array(buffer.getChannelData(0));
        var aLeftChannel = new Float32Array(buffer.getChannelData(1));
        var startSpikePos = -1;
        var endSpikePos = -1;
        var loopEnd = buffer.length - 1;

        // Find spike near start of file
        var pos = 0;

        while (startSpikePos < 0 && pos < buffer.length && pos < MAX_MP3_SILENCE) {

            if (aRightChannel[pos] > SPIKE_THRESH && aLeftChannel[pos] < -SPIKE_THRESH) {

                startSpikePos = pos;
                break;

            } else {

                pos++;

            }

        }

        // Find spike near end of file
        pos = buffer.length - 1;

        while (endSpikePos < 0 && pos > 0 && buffer.length - pos < MAX_MP3_SILENCE) {

            if (aRightChannel[pos] > SPIKE_THRESH && aLeftChannel[pos] < -SPIKE_THRESH) {

                endSpikePos = pos;
                break;

            } else {

                pos--;

            }

        }

        // If both spikes found
        if (startSpikePos > 0 && endSpikePos > 0 && endSpikePos > startSpikePos) {

            // Compute loop start and length
            _nLoopStart = startSpikePos + PREPOSTFIX_LEN / 2;
            loopEnd = endSpikePos - PREPOSTFIX_LEN / 2;
            _nLoopLength = loopEnd - _nLoopStart;

            return true;

        }

        // Spikes not found!
        _nLoopStart = 0;
        _nLoopLength = buffer.length;

        return false;

    };

    var _createLoopMarkers = function() {



    }

    /**
     * Detect loop markers in the audio file and create if there is none
     * @param {AudioBuffer} buffer
     * @returns {AudioBuffer} The AuudioBuffer with the loop marks
     */
    var _detectLoopMarkers = function(buffer) {

        if (!_bLoopMarkerFound(buffer)) {

            console.log("Loop markers not found");

        }

    };

    // Exposed methods
    return {

        detect: _detectLoopMarkers

    };

});
