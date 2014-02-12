/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @description Read contents of file
 * @requires Class APISupport
 */
define(['src/lib/core/filereader/WebAudioAPISupport', 'src/lib/core/filereader/LoadFile'], function(bWebAudioAPISupport, loadFile) {

    "use strict";

    var _bAPISupported = false;
    var _context;

    /**
     * check for Web API support
     */
    var _checkWebAudioAPISupport = function() {

        _bAPISupported = bWebAudioAPISupport();
        _context = new AudioContext();

        console.log("Web Audio API supported: " + _bAPISupported);

    };

    /**
     * Load a file from URI
     * @param {String} sLink The link of the file to load
     */
    var _loadFile = function(sLink) {

        if (_bAPISupported) {

            loadFile.load(sLink, _context);

        }

    };

    /**
     * Get the AudioContext instance
     * @return {AudioContext} The Audio context instance
     */
    var _getContext = function() {

        return _context;

    };

    /**
     * Get the loadFile class
     * @return {Class} The loadFile class
     */
    var _getLoadFileClass = function() {

        return loadFile;

    };

    _checkWebAudioAPISupport();

    // Exposed methods
    return {

        supportWebAudioAPI: _checkWebAudioAPISupport,
        open: _loadFile,
        loadFile: _getLoadFileClass,
        context: _getContext

    };

});
