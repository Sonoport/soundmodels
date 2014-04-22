/**
 * A structure for static configuration options.
 *
 * @module Core
 * @class Config
 */
define( [],
    function () {
        "use strict";

        function Config() {}

        /**
         * Maximum number of voices supported
         *
         * @final
         * @static
         * @property MAX_VOICES
         * @default 8
         *
         */
        Config.MAX_VOICES = 8;

        /**
         * Default nominal refresh rate (Hz) for SoundQueue.
         *
         * @final
         * @static
         * @property NOMINAL_REFRESH_RATE
         * @default 60
         *
         */
        Config.NOMINAL_REFRESH_RATE = 60;

        return Config;
    } );
