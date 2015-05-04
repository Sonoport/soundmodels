module.exports = {
    models: {
        Looper: require( './models/Looper.js' ),
        Activity: require( './models/Looper.js' ),
        Trigger: require( './models/Looper.js' ),
        MultiTrigger: require( './models/Looper.js' ),
        Extender: require( './models/Looper.js' ),
        Scrubber: require( './models/Looper.js' )
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
