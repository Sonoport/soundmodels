/**
 *
 *
 * @module Core
 *
 */
"use strict";

/*
 *  MonkeyPatch for AudioContext. Normalizes AudioContext across browsers and implementations.
 *
 * @class AudioContextMonkeyPatch
 */
function AudioContextMonkeyPatch() {

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
}

module.exports = AudioContextMonkeyPatch;
