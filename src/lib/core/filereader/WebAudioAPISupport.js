/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @class WebAudioAPISupport
 * @description Check if browser supports the Web Audio API.
 * @module FileReader
 * @return {Boolean} True if Web Audio API is supported; False if Web Audio API is not supported
 */
define(function() {

    "use strict";

    /**
     * Determine if Web Audio API is supported.
     * @method isSupported
     * @return {Boolean} True if supported. False if not supported.
     */
    var isSupported = function() {

        if (window.AudioContext || window.webkitAudioContext) {

            return true;

        }

        return false;

    };

    // Exposed methods
    return {

        isSupported: isSupported

    };

});
