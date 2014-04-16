# Developer Guide

A developer guide to Sonoport JavaScript Sound Models


## Introduction
The Sonoport JavaScript Sound Models allow developer to leverage the new WebAudioAPI to create interactive experiences with dynamic sound in the browser. This plugin free technology is purely based on JavaScript, and only requires a browser which has WebAudio API enabled. Chrome, Firefox, Safari and Opera have the API currently enabled.

## Release 0.3.0
The current beta release is 0.3.0. It currently only contains two basic models, `Trigger` and `Looper`. 

All current models require some sort of source material, _mp3_ or _wav_ audio files, which can be used by the models as source.

Purely algorithmic models and more Sound Models will be a part of a later release.

## Installation
There is no installation step for the Sonoport JavaScript Sound Models. 

To use the Sonoport JavaScript Sound Models, you need the following things.

1. Individual JavaScript file for the Model you plan to use.
2. Audio file in _wav_ or _mp3_ format as source material.
3. A [browser which supports the W3C WebAudioAPI](http://caniuse.com/#feat=audio-api). _(Chrome was extensively used in testing this release, hence it is highly recommended as a browser of choice.)_


## Usage
The Models are JavaScript libraries and use the [requirejs](http://requirejs.org/) style of AMD. Following steps will let you use the  Sonoport JavaScript Sound Models in your code.

- Ensure the requirejs is loaded in your context. This can be done using a script tag in the HTML file.

`<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js"></script>`
 
- Ensure that the Sonoport JavaScript Sound Models JavaScript file (Trigger.js or Looper.js) is also loaded into your context. You might have to ensure that it is loaded AFTER requirejs.

`<script type="text/javascript" src="js/Looper.js"></script>`

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

- The Sonoport JavaScript Sound Models emulate the [WebAudioAPI AudioNode](http://webaudio.github.io/web-audio-api/#idl-def-AudioNode). Many methods and parameters APIs exposed by the Sound Models are similar to the WebAudioAPI AudioNodes and [AudioParams](http://webaudio.github.io/web-audio-api/#the-audioparam-interface);

- Once the audio files are loaded, each Sound Model exposes an array of Parameter which can be tweaked in real time, as well as actions which can be performed on the Sound Mode.

```
require(["models/Looper"], function (Looper) {
    var loop = new Looper("https://dl.dropboxusercontent.com/u/77191118/loop.wav",function(){
        console.log("Loaded!");
        loop.play();
        window.setTimeout(function(){
           console.log("Pausing!");
           loop.pause();
        }, 1000);
        window.setTimeout(function(){
           console.log("Playing Again!");
           loop.play();
        }, 3000);
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
    var loop = new Looper("https://dl.dropboxusercontent.com/u/77191118/loop.wav",function(){
        console.log("Play Faster");
        loop.playSpeed.value = 2;
        loop.play();
        window.setTimeout(function(){
           console.log("Play Slower!");
           loop.playSpeed.value = 0.5;
        }, 3000);
    });
});
```

- Here are the Parameters currently exposed by Trigger and Looper. More information is also avilable in the API Documentation

###Looper

```
playSpeed  - Speed of playback. Affects both speed and pitch. 
riseTime   - Rise time to attain speed - RT60.
decayTime  - Decay time to attain speed - RT60.
startPoint - Percentage of the source to start looping from.
```

###Trigger

```
pitchShift   - Pitch shift in semitones.  
pitchRand    - Maximum value for random pitch shift in semitones.
eventRand    - Randomness in order of source triggering in case of multiple sources.
```


## Advanced

Since Sonoport JavaScript Sound Models are based on the WebAudioAPI, they internally use the WebAudio `AudioContext` to synchronize with time. The `AudioContext` exposes a running clock through its property `currentTime`. This clock can be used to schedule actions and parameter changes at an exact time instance in the future.

All the actions and some of the parameters exposed by the Sonoport JavaScript Sound Models support scheduling. The actions (`play`, `pause`, `start`, `stop`, `release`), accept an argument which is the time in the domain of the AudioContext currentTime. This is the exact time at which the action will be executed.

Similary, the Parameters of each Sound Model also expose the Parameter Automation API as defined by the WebAudioAPI. This API allows parameters to be changed automatically syncronously with the AudioContext clock. This functionality on Sonoport JavaScript Sound Models is experimental and may break.

To allow synchronization between various Sound Models, each Sound Model accepts an `AudioContext` object in its constructor. This was multiple Sound Models can share the same AudioContext and hence be scheduled synchronously. 

## Examples

### Basic Slider + Button

Attached is an example of hooking up a Slider and a Button to the Looper Sound Model.

[example.html](example.html)

## Resources
- [WebAudioAPI Specs](http://webaudio.github.io/web-audio-api/)
- [WebAudioAPI Intro](http://www.html5rocks.com/en/tutorials/webaudio/intro/)
- [WebAudio Book](http://chimera.labs.oreilly.com/books/1234000001552)