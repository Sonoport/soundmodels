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

<<<<<<< HEAD
A concatenated file per model is placed in the build directory.

``` grunt test```

Generates a dev-build and serves the test file in the test/models directory.

```grunt make-doc```

Internal documentation is compiled and placed in the docs directory.


### Release builds

```grunt release```

Generates, with time stamps release libraries and external documentation in the dist directory.

=======
### Player build
Install dependencies used by the Player

``` bower install```
>>>>>>> Update base Player template. #HT-34

## Wiki


## Testing

Manual testing can be done using the `test` development build.

## Packaging

Release builds can be used for packaging.
