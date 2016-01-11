/**
 * @module Core
 *
 */
'use strict';
require( '../core/AudioContextMonkeyPatch' )();
var log = require( 'loglevel' );
/*
 *  Check for erroreous samplerate in iOS and re-creates a brand new AudioContext.
 *
 * @class SafeAudioContext
 */
function SafeAudioContext() {

    var desiredSampleRate = typeof desiredSampleRate === 'number' ? desiredSampleRate : 44100;
    log.debug( 'desiredSampleRate', desiredSampleRate );
    var context = new AudioContext();
    var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
    // In iOS devices sampleRate can sometimes report 48000
    if ( iOS && context.sampleRate !== desiredSampleRate ) {
        log.debug( 'bad sample rate', context.sampleRate );
        context.close(); // close the old one
        context = new AudioContext(); // Make a new one
    }

    return context;
}

module.exports = SafeAudioContext;
