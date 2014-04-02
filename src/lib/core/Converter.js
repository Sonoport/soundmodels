/**
 * @class Converter
 * @description Helper class to loader multiple files etc.
 * @module Models
 * @extends BaseSound
 */
define( [],
    function () {
        "use strict";

        function Converter() {

        }

        Converter.prototype.semitonesToRatio = function ( semiTones ) {
            return Math.pow( 2.0, semiTones / 12.0 );
        };

        return Converter;

    } );
