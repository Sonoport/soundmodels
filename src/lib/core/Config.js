/**
 * @class Config
 * @description A structure for static configuration options.
 * @module Core
 */
define( [],
    function () {
        "use strict";

        function Config() {}

        Config.prototype.MAX_VOICES = 8;
        Config.prototype.NOMINAL_REFRESH_RATE = 60;

        return Config;
    } );
