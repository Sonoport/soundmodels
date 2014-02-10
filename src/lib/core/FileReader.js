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
    var _fBuffer;

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
     * Plays the file
     */
    var _playFile = function() {

        if (loadFile.isLoaded()) {

            _fBuffer = loadFile.getBuffer(0);

            //        var startTime = _context.currentTime;
            var source = _context.createBufferSource();
            //        // Connect graph
            //            console.log(_fBuffer);
            source.buffer = _fBuffer;
            //            source.loop = true;
            source.connect(_context.destination);
            source.start(0);
            //        // Start playback, but make sure we stay in bound of the buffer.
            //        source.start(0, 10 % _fBuffer.duration);

        }

    };

    _checkWebAudioAPISupport();

    // Exposed methods
    return {

        supportWebAudioAPI: _checkWebAudioAPISupport,
        open: _loadFile,
        play: _playFile

    };

});
