# Sonoport Sound Models
=====

[Web Audio](http://webaudio.github.io/web-audio-api/) based Sound Models for creating dynamic interactive sounds.

Latest Version : v2.4.1 (19/03/2015)

## Sound Models

Sound Models are parameterized algorithms which generate dynamic sounds in real time.

Sound Models currently available:

### Texture Based Models

Texture based models use some kind of audio source (mp3, wav audio files). The support for the various types of audio files is based on the browser being used. `wav` and `mp3` are the most widely supported file formats. Here is [a good guide](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats#Browser_compatibility) for knowing which codecs are supported by which browser.

[DecodeThis](http://chinpen.net/decodethis/) is a good tool to check if a file of specific codec, bitrate, sample rate is support by a specific browser.

##### Looper
Loops the audio source continuously. Also supports looping of multiple source synchronously.

##### Trigger
Triggers a single playback of the audio source. Supports multiple voices and multiple simulteanous playbacks.

##### MultiTrgger
Triggers a repeated playback of the audio source.

##### Activity
Change the playback speed on an audio source based on the rate of change of a parameter.

##### Scrubber
Allows for 'scrubbing' of the audio source by changing which part of the audio source is being played.

##### Extender
Extends an audio source inifinitely without making it feel repeated.

### Algorithmic Models

Coming soon...

## Effects

Effects are connected to the output of these Sound Models to change some audio qualities of the Sound. Effects, just like Sound Models, also expose Parameters which can be used to control the effects in real time.

Effects currently available:

#### Fader

A simple Fader effect which allows the change of the volume (loudness) of the incoming audio.

#### Panner

A simple stereo Panner effect which allows moving of the perceived source of the audio towards the left or right side of the listener.

#### Filter

A simple low-order filters that can be used as a building blocks of basic tone controls (bass, mid, treble), graphic equalizers, and more advanced filters.

#### Compressor

Dynamics compression lowers the volume of the loudest parts of the signal and raises the volume of the softest parts. It can be used for produce, a louder, richer, and fuller sound.

## Usage

The sound models are avilable in two types of packages, [CommonJS](wiki.commonjs.org) and [AMD](http://requirejs.org/docs/whyamd.html). The sound models are packed as [UMD modules](https://github.com/umdjs/umd) and hence usable directly as global variable as well.

### CommonJS (browserify)

1. The sound models are available in an npm module which you can install using

	`npm install --save-dev soundmodels`

2. The individual models can then be included in your code using nodejs style `require` statements.

	```js
	var Trigger = require('soundmodels/models/Trigger');

	var trigger = new Trigger('loop.wav');
	trigger.play();
	```

3. The individual models are available using the `require('soundmodels/model/<model name>)` scheme, while the sound effects are available using the `require('soundmodels/effects/<effect name>)`. This helps to minimize the amount of code bundled.

4. The CommonJS based dependencies can then be bundled using something like [browserify](http://browserify.org/)

	`browserify index.js > bundle.js`

### AMD (requirejs)

The are available using [RequireJS](http://requirejs.org/) for async depdencency management.

1. To use the Sound Models, you need to have RequireJS loaded, which can be done from a CDN with this script tag

	`<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js"></script>`

2. Also include the actual model file which you would like to use (for eg. `Trigger.js`).

	`<script type="text/javascript" src="js/Trigger.js"></script>`

3. You can then use the loaded Sound Model using RequireJS. (For now you have to use `models/Looper` or `models/Trigger` as the names of the requirements)

	```js
	require(["models/Looper"], function (Looper) {
		var loop = new Looper("loop.wav",function(){
			console.log("Loaded!");
			loop.play();
	    });
	   	console.log("Loading Audio File...");
	});
	```

4. Detailed information about rest of the API can be found in the [API docs for individual Sound Models](http://cdn.rawgit.com/Sonoport/soundmodels/master/dist/docs/classes/Scrubber.html).


## Build Process

The build process uses [gulpjs](https://github.com/gulpjs/gulp/)

- ``` gulp build```

	A concatenated file per model is placed in the `build` directory.

- ``` gulp test```

	Generates a `build` and serves the test files in the `test/manual `directory.

- ``` gulp unittest```

	Generates a `build` and serves the unittest files in the `test/unittest `directory.

- ```gulp makedoc```

	API documentation is compiled and placed in the build/docs directory.

## Release

The built Sound Models for the latest release are avaliable in the [dist/models](https://github.com/Sonoport/soundmodels/tree/master/dist/models) directory. Otherwise they can be installed using [npm](https://www.npmjs.org/package/soundmodels) or [bower](http://bower.io/search/?q=soundmodels).

Each Sound Model is packaged into a seperate [UMD](https://github.com/umdjs/umd) bundled JavaScript file (with all it's depencies bundled along). The individual files can be downloaded and added to your project, or could be linked straight from github (using the raw github URL) for testing. Refer to section on [Usage](#Usage) for instructions on using the Models.

Here are the URLs for the currently supported Models.


| Model         | URL           |
| ------------- |:-------------:|
| Looper        |[ https://github.com/Sonoport/soundmodels/blob/master/dist/models/Looper.js](https://github.com/Sonoport/soundmodels/blob/master/dist/models/Looper.js) |
| Trigger       | [https://github.com/Sonoport/soundmodels/blob/master/dist/models/Trigger.js](https://github.com/Sonoport/soundmodels/blob/master/dist/models/Trigger.js) |
| MultiTrigger  | [https://github.com/Sonoport/soundmodels/blob/master/dist/models/MultiTrigger.js](https://github.com/Sonoport/soundmodels/blob/master/dist/models/MultiTrigger.js) |
| Scrubber      | [https://github.com/Sonoport/soundmodels/blob/master/dist/models/Scrubber.js](https://github.com/Sonoport/soundmodels/blob/master/dist/models/Scrubber.js) |
| Activity      | [https://github.com/Sonoport/soundmodels/blob/master/dist/models/Activity.js](https://github.com/Sonoport/soundmodels/blob/master/dist/models/Activity.js) |
| Extender      | [https://github.com/Sonoport/soundmodels/blob/master/dist/models/Extender.js](https://github.com/Sonoport/soundmodels/blob/master/dist/models/Extender.js) |


## Testing

Two types of tests are current supported

##### Manual testing.

Manual simple loads and runs some basic parameter changes on Sound Models. This can be used for basic sanity checking of Sound Models.

Manual testing can be launched using the command `gulp test`.

##### Unit testing.

A [jasmine](jasmine.github.io) based unit test suite helps test the basic usecase of the core Sound Model library as well as the individual Sound Models.

The unit test can be launched using `gulp unittest`

##### JSM Player

JSM Player is a tool for testing the interaction and effects of the various parameters.

## JSM Player

JSM Player is a browser based UI for testing Sound Models.

### Source

The source for the JSM Player is in `src/jsmplayer` directory.

### Build

The JSM Player can be launched using the command `gulp player`

## Project Structure

- build : for temporary build artifacts
- dist/release  : 'compiled' artefacts for distribution
	- dev : developer guide and cheat sheet
	- docs : compiled docs for distribution
	- models : compiled Sound Models for distribution
- docs  : documentation source
- src   : source code
	- lib    : main javascript library code
		- core 	: core/shared sound functionality
		- models 	: individual sound models
	- jsmplayer  : jsm player
- test 	: source for tests
	- manual : source for manual tests
	- unit : source for unit tests


## Bugs and Contact

Please [raise issues](https://github.com/Sonoport/soundmodels/issues) if you find any bugs or want to request for new features for the Sound Models.

## License

Sonoport Sound Models are licensed under the Apache License, Version 2.0. See the LICENSE file for more info.



