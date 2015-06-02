/**
 * @module Core
 *
 * @class WebAudioDispatch
 * @static
 */
"use strict";
var log = require( 'loglevel' );

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
        log.error( "No AudioContext provided" );
        return;
    }
    var currentTime = audioContext.currentTime;
    // Dispatch anything that's scheduled for anything before current time, current time and the next 5 msecs
    if ( currentTime >= time || time - currentTime < 0.005 ) {
        log.debug( "Dispatching now" );
        functionCall();
        return null;
    } else {
        log.debug( "Dispatching in", ( time - currentTime ) * 1000, 'ms' );
        return window.setTimeout( function () {
            log.debug( "Diff at dispatch", ( time - audioContext.currentTime ) * 1000, 'ms' );
            functionCall();
        }, ( time - currentTime ) * 1000 );
    }
}

module.exports = WebAudioDispatch;
