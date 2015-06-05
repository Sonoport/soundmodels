/*soundmodels - v2.5.6 - Fri Jun 05 2015 10:47:20 GMT+0800 (SGT) */
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
    effect: {
        Compressor: require( './effects/Compressor.js' ),
        Distorter: require( './effects/Distorter.js' ),
        Fader: require( './effects/Fader.js' ),
        Filter: require( './effects/Filter.js' ),
        Panner: require( './effects/Panner.js' ),
    }
};
