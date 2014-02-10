/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @name core.filereader.WebAudioAPISupport
 * @description Check if browser supports the Web Audio API
 * @return {Boolean} True if Web Audio API is supported; False if Web Audio API is not supported
 */
define(function() {

    "use strict";

    return function() {

        if (window.AudioContext || window.webkitAudioContext) {

            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            return true;

        }

        return false;

    };

});
