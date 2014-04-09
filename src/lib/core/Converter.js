/**
 * @module Core
 */
define( [],
    function () {
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
         * @param {Number} Value in semitones to be converted to ratio.
         *
         */
        Converter.semitonesToRatio = function ( semiTones ) {
            return Math.pow( 2.0, semiTones / 12.0 );
        };

        return Converter;

    } );
