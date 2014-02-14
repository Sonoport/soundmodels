/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @class LoadFile
 * @description Load file from a URL.
 * @module FileReader
 * @param {String} sLink The URL
 * @return {ArrayBuffer} An ArrayBuffer.
 */
define(['src/lib/core/filereader/LoopMarker'], function(loopMarker) {

    "use strict";

    var buffer_;
    var bSoundLoaded_ = false;
    var context_;
    var sLink_;

    /**
     * Check if a value is an integer.
     * @private
     * @param {Object} value
     * @returns {Boolean} Result of test.
     */
    function isInt_(value) {

        var er = /^[0-9]+$/;

        if (er.test(value)) {

            return true;

        }

        return false;

    }

    /**
     * Get a buffer based on the start and end markers.
     * @private
     * @method sliceBuffer
     * @param {Number} nStart The start of the buffer to load.
     * @param {Number} nEnd The end of the buffer to load.
     * @returns {AudioBuffer} The trimmed buffer.
     */
    function sliceBuffer_(nStart, nEnd) {

        var aChannels = [];
        var nChannels = buffer_.numberOfChannels;
        var nLength = buffer_.length;
        var newBuffer;

        // Set nEnd if it is missing
        if (typeof nEnd === "undefined") {

            nEnd = buffer_.length;

        }

        // Verify parameters
        if (!isInt_(nStart)) {

            console.log("getBuffer Start parameter is not an integer");
            return;

        } else if (!isInt_(nEnd)) {

            console.log("getBuffer End parameter is not an integer");
            return;

        }

        // Check if nStart is smaller than nEnd
        if (nStart > nEnd) {

            console.log("getBuffer Start parameter should be bigger than End parameter");
            return;

        }

        // Check if nStart is beyong buffer size
        if (nStart > buffer_.length) {

            console.log("getBuffer Start parameter should be withing buffer length");
            return;

        }

        // Check if nEnd is larger that the buffer size and adjust accordingly
        if (nEnd > buffer_.length) {

            nEnd = -1;

        }

        // Start trimming
        for (var i = 0; i < nChannels; i++) {

            var aData = new Float32Array(buffer_.getChannelData(i));
            aChannels[i] = aData.subarray(nStart, nEnd);

        }

        if (aChannels.length > 0) {

            nLength = aChannels[0].length;

        }

        // Create the new buffer
        newBuffer = context_.createBuffer(buffer_.numberOfChannels, nLength, buffer_.sampleRate);

        for (var j = 0; j < nChannels; j++) {

            newBuffer.getChannelData(j).set(aChannels[j]);

        }

        return newBuffer;

    }

    /**
     * Get the current buffer.
     * @method getBuffer
     * @param {Number} start The start index
     * @param {Number} end the end index
     * @returns {AudioBuffer} The AudioBuffer that was marked then trimmed if it is not a wav file.
     */
    var getBuffer = function(nStart, nEnd) {

        var aEr = /[^.]+$/.exec(sLink_);

        // Do trimming if it is not a wave file
        if (aEr[0] !== "wav") {

            // Detect loop markers
            loopMarker.detectMarkers(buffer_);

            if (nEnd + loopMarker.getStartMarker() > loopMarker.getEndMarker()) {

                nEnd = loopMarker.getEndMarker();

            }

            return sliceBuffer_(nStart + loopMarker.getStartMarker(), nEnd + loopMarker.getStartMarker());

        }

        return sliceBuffer_(nStart, nEnd);

    };

    /**
     * Get the original buffer.
     * @method getRawBuffer
     * @returns {AudioBuffer} The original AudioBuffer.
     */
    var getRawBuffer = function() {

        return buffer_;

    };

    /**
     * Check if sound is already loaded.
     * @method isLoaded
     * @returns {Boolean} True if file is loaded. Flase if file is not yeat loaded.
     */
    var isLoaded = function() {

        return bSoundLoaded_;

    };

    /**
     * Load a file based on the URI.
     * @method load
     * @param {String} link The link of the file to load.
     * @param {AudioContext} context The Audio context.
     * @param {Function} callback The function to call when file loads.
     */
    var load = function(sLink, context, fCallback) {

        var request = new XMLHttpRequest();

        bSoundLoaded_ = false;
        context_ = context;
        sLink_ = sLink.toLocaleLowerCase();

        request.open('GET', sLink, true);
        request.responseType = 'arraybuffer';

        // Handler for onLoad
        request.onload = function() {

            context.decodeAudioData(request.response, function(buffer) {

                console.log("File successfully loaded");

                bSoundLoaded_ = true;
                buffer_ = buffer;
                fCallback.success();

            }, onError);

        };

        // Handler for onError
        var onError = function() {

            console.log("Error loading URL");

        };

        request.send();

    };

    // Exposed methods
    return {

        isLoaded: isLoaded,
        load: load,
        getBuffer: getBuffer,
        getRawBuffer: getRawBuffer

    };

});
