# Sonoport Javascript Sound Models

This project contains the HTML5/Javascript port of Sonoport's sound models.

## Project Structure

- build : for temporary build artifacts
- dist  : 'compiled' libraries for distribution and external documentation
- docs  : related internal documentation
- src   : source code
	- lib    : main javascript library code
		- core 	: core/shared sound functionality
		- models 	: individual sound models
	- tools  : code/tools surrounding the library
- test 	: player, and other tests


## Build Process

### Development builds
``` grunt dev-build```

A concatenated file per model is placed in the build directory.

``` grunt test```

Generates a dev-build and serves the test file in the test/models directory.

```grunt make-doc```

Internal documentation is compiled and placed in the docs directory.


### Release builds

```grunt release```

Generates, with time stamps release libraries and external documentation in the dist directory.

### Player build for models testing
1. Install dependencies used by the Player

``` bower install```
2. Copy dependencies into the jsmplayer folder
``` grunt bowercopy```

3. Run player with localhost
``` grunt player-js ```

### Player design debugging
Player's css stylesheet is using Sass to compile into a single style.css file. If there is a need to edit the css stylesheet, please install [Sass](http://www.sass-lang.com), [Compass](http://compass-style.org/), [Susy](http://susy.oddbird.net/) and [Breakpoint](http://breakpoint-sass.com/).

These libraries require Ruby and they would be install as a gem. 

To install:
``` gem install sass --pre```
``` gem install compass --pre```
``` gem install susy --pre```
``` gem install breakpoint```

Then run this command to compile the css and localhost
``` grunt player-build ```

## Wiki


## Testing

Manual testing can be done using the `test` development build.

## Packaging

Release builds can be used for packaging.
