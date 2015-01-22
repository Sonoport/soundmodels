# Sonoport Sound Models
=====

[Web Audio](http://webaudio.github.io/web-audio-api/) based Sound Models for creating dynamic interactive sounds.

Latest Version : v2.0.0 (30/12/2014)

## Sound Models

Sound Models currently available:

### Texture Based Models

Texture based models use some kind of audio source (mp3, wav audio files).

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


## Usage

The models use [RequireJS](http://requirejs.org/) for async depdencency management.

1. To use the Sound Models, you need to have RequireJS loaded, which can be done from a CDN with this script tag

	`<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js"></script>`

- Also include the actual model file which you would like to use (for eg. `Trigger.js`).

	`<script type="text/javascript" src="js/Trigger.js"></script>`

- You can then use the loaded Sound Model using RequireJS. (For now you have to use `models/Looper` or `models/Trigger` as the names of the requirements)

	```
require(["models/Looper"], function (Looper) {
	var loop = new Looper("loop.wav",function(){
		console.log("Loaded!");
		loop.play();
    });
   	console.log("Loading Audio File...");
});
	```

- Detailed information about rest of the API can be found in the [API docs for individual Sound Models](http://cdn.rawgit.com/Sonoport/js-sound-models/master/dist/release/docs/classes/Scrubber.html).


## Build Process

The build process uses [gulpjs](https://github.com/gulpjs/gulp/)

- ``` gulp devbuild```

	A concatenated file per model is placed in the `build` directory.

- ``` gulp test```

	Generates a `devbuild` and serves the test files in the `test/models `directory.

- ```gulp makedoc```

	API documentation is compiled and placed in the build/docs directory.

## Release

The built Sound Models for the latest release are avaliable in the [dist/release/models](https://github.com/Sonoport/js-sound-models/tree/master/dist/release/models) directory.

Each Sound Model is packaged into a seperate Javascript file (with all it's depencies bundled along). The individual files can be downloaded and added to your project, or could be linked straight from github (using the raw github URL) for testing. Refer to section on [Usage](#Usage) for instructions on using the Models.

Here are the URLs for the currently supported Models.


| Model         | URL           |
| ------------- |:-------------:|
| Looper        |[ https://github.com/Sonoport/js-sound-models/blob/master/dist/release/models/Looper.js](https://github.com/Sonoport/js-sound-models/blob/master/dist/release/models/Looper.js) |
| Trigger       | [https://github.com/Sonoport/js-sound-models/blob/master/dist/release/models/Trigger.js](https://github.com/Sonoport/js-sound-models/blob/master/dist/release/models/Trigger.js) |
| MultiTrigger  | [https://github.com/Sonoport/js-sound-models/blob/master/dist/release/models/MultiTrigger.js](https://github.com/Sonoport/js-sound-models/blob/master/dist/release/models/MultiTrigger.js) |
| Scrubber      | [https://github.com/Sonoport/js-sound-models/blob/master/dist/release/models/Scrubber.js](https://github.com/Sonoport/js-sound-models/blob/master/dist/release/models/Scrubber.js) |
| Activity      | [https://github.com/Sonoport/js-sound-models/blob/master/dist/release/models/Activity.js](https://github.com/Sonoport/js-sound-models/blob/master/dist/release/models/Activity.js) |
| Extender      | [https://github.com/Sonoport/js-sound-models/blob/master/dist/release/models/Extender.js](https://github.com/Sonoport/js-sound-models/blob/master/dist/release/models/Extender.js) |


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

Please [raise issues](./issues) if you find any bugs or want to request for new features for the Sound Models.

## License

Sonoport Sound Models are licensed under the Apache License, Version 2.0. See the LICENSE file for more info.



