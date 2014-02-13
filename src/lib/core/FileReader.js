/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @class FileReader
 * @description Read contents of file.
 * @module FileReader
 * @requires Class APISupport
 */
define(['src/lib/core/filereader/WebAudioAPISupport', 'src/lib/core/filereader/LoadFile'], function(webAudioAPISupport, loadFile) {

    "use strict";

    var context_;

    /**
     * Get the AudioContext buffer.
     * @method getBuffer
     * @returns {AudioBuffer} The new AudioBuffer that was marked then trimmed.
     */
    var getBuffer = function() {

        return loadFile.getBuffer();

    };

    /**
     * Get the original buffer.
     * @method getBufferRaw
     * @returns {AudioBuffer} The original AudioBuffer.
     */
    var getBufferRaw = function() {

        return loadFile.getBufferRaw();

    };

    /**
     * Get the AudioContext instance.
     * @method getContext
     * @return {AudioContext} The Audio context instance.
     */
    var getContext = function() {

        return context_;

    };

    /**
     * Determine if file is loaded.
     * @method isLoaded
     * @return {Boolean} True if file is loaded. False if file is not loaded.
     */
    var isLoaded = function() {

        return loadFile.isLoaded();

    };

    /**
     * Load a file from URI.
     * @method open
     * @param {String} link The link of the file to load.
     */
    var open = function(sLink) {

        if (webAudioAPISupport.isSupported()) {

            if (typeof context_ === "undefined") {

                console.log("No AudioContext instance found. Creating a new AudioContext.");
                context_ = new AudioContext();

            }

            loadFile.load(sLink, context_);

        } else {

            console.log("Web Audio API is not supported. Failed to open file.");

        }

    };

    /**
     * Set the AudioContext to use.
     * @method setContext
     * @param {AudioContext} context The Audio context instance to use.
     */
    var setContext = function(context) {

        context_ = context;

    };

    // Exposed methods
    return {

        open: open,
        isLoaded: isLoaded,
        getBuffer: getBuffer,
        getBufferRaw: getBufferRaw,
        getContext: getContext,
        setContext: setContext

    };

});
