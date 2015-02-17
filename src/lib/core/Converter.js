/**
 * @module Core
 */
"use strict";

/**
 * Helper class to convert between various ratios and musical values.
 *
 * @class Converter
 * @static
 */
function Converter() {}

/**
 * Helper method to convert a value in semitones to a value in ratio.
 *
 *
 * @method semitonesToRatio
 * @static
 * @param {Number} semiTones Value in semitones to be converted to ratio.
 *
 */
Converter.semitonesToRatio = function ( semiTones ) {
    return Math.pow( 2.0, semiTones / 12.0 );
};

/**
 * Helper method to convert a value in ratio to a value in decibel full scale dBFS.
 *
 *
 * @method ratioToDBFS
 * @static
 * @param {Number} value in ratio to be converted to dBFS.
 *
 */
Converter.ratioToDBFS = function ( ratio ) {
    return 20 * Math.log10( ratio );
};

/**
 * Helper method to convert a value in decibel full scale dBFS to a value in ratio.
 *
 *
 * @method dBFStoRatio
 * @static
 * @param {Number} value in dBFS to be converted a ratio.
 *
 */
Converter.dBFStoRatio = function ( dBFS ) {
    return Math.pow( 10.0, dBFS / 20 );
};

module.exports = Converter;
