# Developer Guide

A developer guide to Sonoport JavaScript Sound Models


## Introduction
The Sonoport JavaScript Sound Models allow developer to leverage the new WebAudio API to create interactive experiences with dynamic sound in the browser. This plugin-free technology is purely based on JavaScript, and only requires a browser which has WebAudio API enabled. Chrome, Firefox, Safari and Opera have the API currently enabled.

## Release 2.5.9
The current release is 2.5.10. It currently contains six sound models, `Looper`, `Trigger`,  `MultiTrigger`, `Extender`, `Activity` and `Scrubber`, and five effects, `Fader`, `Compressor`, `Filter`, `Panner`, `Distorter`.

All current models require some sort of source material, _mp3_ or _wav_ audio files, which can be used by the models as source.

## Installation
There is no installation step for the Sonoport JavaScript Sound Models.

To use the Sonoport JavaScript Sound Models, you need the following things.

1. Individual JavaScript file for the Model you plan to use.
2. Audio file in _wav_ or _mp3_ format as source material.
3. A [browser which supports the W3C Web Audio API](http://caniuse.com/#feat=audio-api). _(Chrome was extensively used in testing this release, hence it is highly recommended as a browser of choice.)_


## Usage
The Models are JavaScript libraries and use the [requirejs](http://requirejs.org/) style of AMD. Following steps will let you use the  Sonoport JavaScript Sound Models in your code.

- Ensure the requirejs is loaded in your context. This can be done using a script tag in the HTML file.

`<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js"></script>`

- Ensure that the Sonoport JavaScript Sound Models JavaScript file (for eg. `Trigger.js`) is also loaded into your context. You might have to ensure that it is loaded AFTER requirejs.

`<script type="text/javascript" src="js/Trigger.js"></script>`

- You can then use the loaded Sound Model using _requirejs_. (For now you have to use `models/Looper` or `models/Trigger` as the names of the requirements)

```
require(["models/Looper"], function (Looper) {
    var loop = new Looper("https://dl.dropboxusercontent.com/u/77191118/loop.wav",function(){
        console.log("Loaded!");
        loop.play();
    });
    console.log("Loading Audio File...");
});
```

- The Sound Models are initialized using the constructor, and accept a single URL or an array of URLs as the first argument, and a async callback as the second argument triggered when the audio files are loaded. Detailed information about the API can be found in the API docs

- The Sonoport JavaScript Sound Models emulate the [Web Audio API AudioNode](http://webaudio.github.io/web-audio-api/#idl-def-AudioNode). Many methods and parameters APIs exposed by the Sound Models are similar to the WebAudio API AudioNodes and [AudioParams](http://webaudio.github.io/web-audio-api/#the-audioparam-interface);

- Once the audio files are loaded, each Sound Model exposes an array of Parameter which can be tweaked in real time, as well as actions which can be performed on the Sound Mode.

```
require(["models/Looper"], function (Looper) {
    // Create a new Looper
    var loop = new Looper(null,"https://dl.dropboxusercontent.com/u/77191118/loop.wav",null,function(){
        console.log("Loaded!");
        loop.play();

        // Pause the Looper after 1 second
        window.setTimeout(function(){
           console.log("Pausing!");
           loop.pause();
        }, 1000);

        // Restart the Looper after 3 seconds
        window.setTimeout(function(){
           console.log("Playing Again!");
           loop.play();
        }, 3000);

        // Stop the Looper after 5 seconds
        window.setTimeout(function(){
           console.log("Stopping!");
           loop.stop();
       }, 5000);
    });
});
```

- Each Sound Model exposes a set of Parameters. These can be changed while the sound is being played, using `value` property of the Parameter.

```
require(["models/Looper"], function (Looper) {
    var loop = new Looper(null ,"https://dl.dropboxusercontent.com/u/77191118/loop.wav",null,function(){
        console.log("Play Faster");
        loop.playSpeed.value = 2;
        loop.play();
        // Reduce the speed after 3 seconds
        window.setTimeout(function(){
           console.log("Play Slower!");
           loop.playSpeed.value = 0.5;
        }, 3000);
    });
});
```

## Models and Parameters

The following page has a list of Models and Parameters. It contains,

- a list of all supported Sound Models
- a description of each Model
- a list of all Parameters supported by each of the Sound Models
- the minimum, maximum and default values each of the Parameter.

[Models and Parameters](modelsjs.html)

For more complete description, please take a look at the API Documentation.

## Advanced

Since Sonoport JavaScript Sound Models are based on the WebAudio API, they internally use the WebAudio `AudioContext` to synchronize with time. The `AudioContext` exposes a running clock through its property `currentTime`. This clock can be used to schedule actions and parameter changes at an exact time instance in the future.

All the actions and some of the parameters exposed by the Sonoport JavaScript Sound Models support scheduling. The actions (`play`, `pause`, `start`, `stop`, `release`), accept an argument which is the time in the domain of the AudioContext currentTime. This is the exact time at which the action will be executed.

Similary, the Parameters of each Sound Model also expose the Parameter Automation API as defined by the WebAudio API. This API allows parameters to be changed automatically syncronously with the AudioContext clock. This functionality on Sonoport JavaScript Sound Models is experimental and may break.

To allow synchronization between various Sound Models, each Sound Model accepts an `AudioContext` object in its constructor. This was multiple Sound Models can share the same AudioContext and hence be scheduled synchronously.

### Gain and Pan

The WebAudio API has builtin support for Gain Node which affect the volume of the audio, and Panner Node which affects the left/right panning of the audio. The Sonoport Sound Models are made to work with these and other WebAudio native nodes. To connect the a Sound Model with a native Node, the standard Web Audio`connect`/`disconnect` methods are avilable on Sound Models.

__The only thing to note here is to remember to `disconnect` before connecting to an external Node.__

Here is an example of how a Gain Node can be added to the Looper Sound Model

```
require(["models/Looper"], function (Looper) {
    var gain;
    var loop = new Looper(null,"https://dl.dropboxusercontent.com/u/77191118/loop.wav",null,function(){

        // Create a Gain Node
        gain = loop.audioContext.createGain();

        // Disconnect from the output
        loop.disconnect();

        // Connect to gain
        loop.connect(gain);

        // Connect gain to output
        gain.connect(loop.audioContext.destination);

        // Set the value of  0-1;
        gain.gain.value = 0.5;

        loop.play();
    });
});

```

## Examples

### Basic Slider + Button

Attached is an example of hooking up a Slider and a Button to the Looper Sound Model.

[example.html](example.html)

## Resources
- [WebAudio API Specs](http://webaudio.github.io/web-audio-api/)
- [WebAudio API Intro](http://www.html5rocks.com/en/tutorials/webaudio/intro/)
- [WebAudio Book](http://chimera.labs.oreilly.com/books/1234000001552)
