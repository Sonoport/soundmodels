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
        AudioContextMonkeyPatch: require( './core/AudioContextMonkeyPatch.js' ),
        BaseEffect: require( './core/BaseEffect.js' ),
        BaseSound: require( './core/BaseSound.js' ),
        Config: require( './core/Config.js' ),
        Converter: require( './core/Converter.js' ),
        DetectLoopMarker: require( './core/DetectLoopMarkers.js' ),
        Envelope: require( '/core/Envelope.js' ),
        FileLoader: require( './core/FileLoader.js' ),
        MultiFileLoader: require( './core/MultiFileLoader.js' ),
        SafeAudioContext: require( './core/SafeAudioContext.js' ),
        SoundQueue: require( './core/SoundQueue.js' ),
        SPAudioBuffer: require( './core/SPAudioBuffer.js' ),
        SPAudioBufferSourceNode: require( './core/SPAudioBufferSourceNode.js' ),
        SPAudioParam: require( './core/SPAudioParam.js' ),
        SPPlaybackRateParam: require( './core/SPPlaybackRateParam.js' ),
        WebAudioDispatch: require( './core/WebAudioDispatch.js' )
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
