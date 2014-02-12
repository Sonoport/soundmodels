/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @name core.filereader.LoopMarker
 * @description Detect loop markers
 */
define(function() {

    "use strict";

    var PREPOSTFIX_LEN = 5000;
    var SPIKE_THRESH = 0.5;

    var MAX_MP3_SILENCE = 20000;
    var SILENCE_THRESH = 0.1;

    var _aRightChannel;
    var _aLeftChannel;
    var _nLoopStart;
    var _nLoopEnd;
    var _nLoopLength;

    /**
     * Determine if loop markers are in the file
     * @param {AudioBuffer} The buffer
     * @returns {Boolean}
     */
    var _bLoopMarkerFound = function(buffer) {

        var startSpikePos = -1;
        var endSpikePos = -1;

        _nLoopEnd = buffer.length - 1;
        _aRightChannel = new Float32Array(buffer.getChannelData(0));

        if (buffer.numberOfChannels > 1) {

            _aLeftChannel = new Float32Array(buffer.getChannelData(1));

        }

        // Find spike near start of file
        var pos = 0;

        while (startSpikePos < 0 && pos < buffer.length && pos < MAX_MP3_SILENCE) {

            if (_aRightChannel[pos] > SPIKE_THRESH) {

                if (buffer.numberOfChannels > 1) {

                    if (_aLeftChannel[pos] < -SPIKE_THRESH) {

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

        while (endSpikePos < 0 && pos > 0 && buffer.length - pos < MAX_MP3_SILENCE) {

            if (_aRightChannel[pos] > SPIKE_THRESH) {

                if (buffer.numberOfChannels > 1) {

                    if (_aLeftChannel[pos] < -SPIKE_THRESH) {

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
        if (startSpikePos > 0 && endSpikePos > 0 && endSpikePos > startSpikePos) {

            // Compute loop start and length
            _nLoopStart = startSpikePos + PREPOSTFIX_LEN / 2;
            _nLoopEnd = endSpikePos - PREPOSTFIX_LEN / 2;
            _nLoopLength = _nLoopEnd - _nLoopStart;

            return true;

        }

        // Spikes not found!
        _nLoopStart = 0;
        _nLoopLength = buffer.length;

        return false;

    };

    /**
     * Detect loop markers in the audio file and create if there is none
     * @param {AudioBuffer} buffer
     * @returns {AudioBuffer} The AudioBuffer with the loop marks
     */
    var _detectLoopMarkers = function(buffer) {

        if (!_bLoopMarkerFound(buffer)) {

            console.log("Loop markers not found");
            _trimSilence(buffer);

        }

    };

    /**
     * Get the end marker
     * @returns {Number} The end marker position
     */
    var _getEndMarker = function() {

        return _nLoopEnd;

    };

    /**
     * Get the start marker
     * @returns {Number} The start marker position
     */
    var _getStartMarker = function() {

        return _nLoopStart;

    };

    /**
     * Get loop length
     * @returns {Number} The loop length
     */
    var _getLoopLength = function() {

        return _nLoopLength;

    };

    /**
     * Trims silence for markers undetected
     * @param {AudioBuffer} buffer The buffer to trim silence
     */
    var _trimSilence = function(buffer) {

        _nLoopEnd = buffer.length - 1;

        // Determine if mono or stereo or more than 2 channels
        if (buffer.numberOfChannels > 1) {

            while (_nLoopStart < MAX_MP3_SILENCE && _nLoopStart < _nLoopLength && Math.abs(_aLeftChannel[_nLoopStart]) < SILENCE_THRESH && Math.abs(_aRightChannel[_nLoopStart]) < SILENCE_THRESH) {

                _nLoopStart++;

            }

            while (buffer.length - _nLoopEnd < MAX_MP3_SILENCE && _nLoopEnd > 0 && Math.abs(_aLeftChannel[_nLoopEnd]) < SILENCE_THRESH && Math.abs(_aRightChannel[_nLoopEnd]) < SILENCE_THRESH) {

                _nLoopEnd--;

            }

        } else {

            while (_nLoopStart < MAX_MP3_SILENCE && _nLoopStart < _nLoopLength && Math.abs(_aRightChannel[_nLoopStart]) < SILENCE_THRESH) {

                _nLoopStart++;

            }

            while (buffer.length - _nLoopEnd < MAX_MP3_SILENCE && _nLoopEnd > 0 && Math.abs(_aRightChannel[_nLoopEnd]) < SILENCE_THRESH) {

                _nLoopEnd--;

            }

        }

        if (_nLoopEnd > _nLoopStart) {

            _nLoopLength = _nLoopEnd - _nLoopStart + 1;

        } else {

            _nLoopStart = 0;
            _nLoopLength = buffer.length;

        }

    };

    // Exposed methods
    return {

        detect: _detectLoopMarkers,
        startMarker: _getStartMarker,
        endMarker: _getEndMarker,
        loopLength: _getLoopLength

    };

});
