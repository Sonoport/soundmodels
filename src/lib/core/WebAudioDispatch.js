/**
 * @module Core
 *
 * @class WebAudioDispatch
 * @static
 */
define( [],
    function () {
        "use strict";
        /**
         * Helper class to dispatch manual syncronized calls to for WebAudioAPI. This is to be used for API calls which can't don't take in a time argument and hence are inherently Syncronized.
         *
         *
         * @method WebAudioDispatch
         * @param {Function} Function to be called at a specific time in the future.
         * @param {Number} TimeStamp at which the above function is to be called.
         * @param {String} audioContext AudioContext to be used for timing.
         */

        function WebAudioDispatch( functionCall, time, audioContext ) {
            if ( !audioContext ) {
                //console.warn( "No AudioContext provided" );
                return;
            }
            var currentTime = audioContext.currentTime;
            // Dispatch anything that's scheduled for anything before current time, current time and the next 5 msecs
            if ( currentTime >= time || time - currentTime < 0.005 ) {
                //console.log( "Dispatching now" );
                functionCall();
            } else {
                //console.log( "Dispatching in ", ( time - currentTime ) * 1000 );
                window.setTimeout( function () {
                    //console.log( "Diff at dispatch ", ( time - audioContext.currentTime ) * 1000 );
                    functionCall();
                }, ( time - currentTime ) * 1000 );
            }
        }

        return WebAudioDispatch;
    }
);
