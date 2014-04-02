/**
 * @class Config
 * @description A structure for static configuration options.
 * @module Core
 */
define( [],
    function () {
        "use strict";

        function Config() {}

        Config.MAX_VOICES = 8;
        Config.NOMINAL_REFRESH_RATE = 60;

        return Config;
    } );
