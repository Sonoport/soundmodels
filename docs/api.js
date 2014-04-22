YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "AudioContextMonkeyPatch",
        "BaseSound",
        "Config",
        "Converter",
        "DetectLoopMarkers",
        "Envelope",
        "FileLoader",
        "Looper",
        "MuliFileLoader",
        "SPAudioBufferSourceNode",
        "SPAudioParam",
        "SPEvent",
        "SPPlaybackRateParam",
        "SoundQueue",
        "Trigger"
    ],
    "modules": [
        "Core",
        "Models"
    ],
    "allModules": [
        {
            "displayName": "Core",
            "name": "Core",
            "description": "MonkeyPatch for AudioContext. Normalizes AudioContext across browsers and implementations."
        },
        {
            "displayName": "Models",
            "name": "Models"
        }
    ]
} };
});