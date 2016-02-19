/*soundmodels - v2.6.3 - Fri Feb 19 2016 15:30:29 GMT+0800 (SGT) */
'use strict';

module.exports = {
    models: {
        Looper: require( './models/Looper.js' ),
        Activity: require( './models/Activity.js' ),
        Trigger: require( './models/Trigger.js' ),
        MultiTrigger: require( './models/MultiTrigger.js' ),
        Extender: require( './models/Extender.js' ),
        Scrubber: require( './models/Scrubber.js' )
    },
    core: {
        SPAudioBuffer: require( './core/SPAudioBuffer.js' )
    },
    effects: {
        Compressor: require( './effects/Compressor.js' ),
        Distorter: require( './effects/Distorter.js' ),
        Fader: require( './effects/Fader.js' ),
        Filter: require( './effects/Filter.js' ),
        Panner: require( './effects/Panner.js' ),
    }
};

// Aliases.
module.exports.model = module.exports.models;
module.exports.effect = module.exports.effects;
