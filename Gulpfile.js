"use strict";

var pkg = require('./package.json');

var del = require('del');
var glob = require("glob");
var merge = require('merge-stream');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var requireUncached = require('require-uncached');

var gulp = require('gulp');
var gutil = require('gulp-util');
var bump = require("gulp-bump");
var yuidoc = require("gulp-yuidoc");
var prettify = require('gulp-jsbeautifier');
var jshint = require('gulp-jshint');
var ignore = require('gulp-ignore');
var header = require('gulp-header');
var compass = require('gulp-compass');
var webserver = require('gulp-webserver');
var cached = require('gulp-cached');


//var debug = require('gulp-debug');
// var using = require('gulp-using');

var banner= '/*<%= pkg.name %> - v<%= pkg.version %> - ' +
'<%= new Date() %> */ \n' +
'console.log("   ____                           __ \\n" + "  / _____  ___ ___  ___ ___  ____/ /_\\n" + " _\\\\ \\\\/ _ \\\\/ _ / _ \\\\/ _ / _ \\\\/ __/ __/\\n" + "/___/\\\\___/_//_\\\\___/ .__\\\\___/_/  \\\\__/ \\n" + "                 /_/                 \\n" + "Hello Developer!\\n" + "Thanks for using Sonoport Dynamic Sound Library v<%= pkg.version %>.");\n';

var paths = {
    files: {
        jsSrc: 'src/**/**/*.js',
        playerCSS: 'src/jsmplayer/**/**.css',
        vendorSrc: 'src/jsmplayer/vendor/*.js',
        libSrc: 'src/lib/**/*.js',
        modelsSrc: 'src/lib/models/*.js',
        effectsSrc: 'src/lib/effects/*.js',
        coreSrc: 'src/lib/core/*.js',
        allTestSrc: 'test/**/*.js',
        unitTestCases: 'test/unit/cases/**/**/.js',
        builtSrc : 'build/**/*.js',
        publishableSrc : ['src/lib/models/*.js', 'src/lib/effects/*.js', 'src/lib/core/SPAudioParam.js','src/lib/core/BaseSound.js', 'src/lib/core/BaseEffect.js', 'src/lib/core/SPAudioBuffer.js']
    },
    dirs: {
        build: 'build/',
        dist: 'dist/',
        release: 'dist/release/',
        src: 'src/',
        player: 'src/jsmplayer/',
        lib: 'src/lib/',
        core: 'src/lib/core/',
        models: 'src/lib/models/',
        docs: 'docs/yuidocs/',
        themedir: 'docs/yuitheme/',
        test : 'test/',
        unittest: 'test/unit/',
        integration: 'test/integration/',
        manualtest: 'test/manual/'
    },
};

/*
**** Documentation ****
*/

var yuiParserOpts = {
    project: {
        "name": pkg.name,
        "description": pkg.description,
        "version": pkg.version,
        "url": pkg.homepage,
        "logo": 'http://sonoport.com/img/Logo.png',
    },
};

gulp.task('makedoc', function() {
    var generatorOpt = {
        themedir: paths.dirs.themedir,
        linkNatives: "true"
    };

    return gulp.src(paths.files.libSrc)
    .pipe(yuidoc.parser(yuiParserOpts))
    .pipe(yuidoc.generator(generatorOpt))
    .pipe(gulp.dest(paths.dirs.docs));
});


gulp.task('publishdocs', function() {
    var generatorOpt = {
        themedir: paths.dirs.themedir,
        linkNatives: "true",
        nocode: "true"
    };

    var ignoreFiles = ignore.exclude('**/files/**');

    return gulp.src(paths.files.publishableSrc)
    .pipe(yuidoc.parser(yuiParserOpts))
    .pipe(yuidoc.generator(generatorOpt))
    .pipe(ignoreFiles)
    .pipe(gulp.dest(paths.dirs.release + "docs/"));
});

/*
**** Hinting and Code Style
*/

gulp.task('jshint:src', function(){
    var ignoreVendor = ignore.exclude(['**/jsmplayer/vendor/*.js']);
    var ignoreMonkeyPatch = ignore.exclude(['**/AudioContextMonkeyPatch.js']);

    return gulp.src([paths.files.jsSrc, 'package.json', 'Gulpfile.js'])
    .pipe(ignoreVendor)
    .pipe(ignoreMonkeyPatch)
    .pipe(cached('jshint:src'))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jsbeautify:src', ['jshint:src'], function(){
    return gulp.src(paths.files.libSrc)
    .pipe(cached('beautify:src'))
    .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
    .pipe(gulp.dest(paths.dirs.lib));
});

/*
**** Builds ****
*/

gulp.task('build',['devbuild']);

// Returns an array of Gulp Streams
function createBundlerStreams(globPattern, destDir, transforms){
    var moduleStripRegex = /.*\//;
    var extStripRegex = /\.js/;
    return glob.sync(globPattern).map(function (thisFile){
        gutil.log("Bundling ", thisFile);
        var fileName = thisFile.replace(moduleStripRegex,'');
        var bundleName = fileName.replace(extStripRegex,'');
        var bundler = browserify({
            entries: ["./" + thisFile],
            standalone: bundleName,
            paths : [paths.dirs.lib],
        });
        if (transforms){
            bundler.transform({
              global: true
          }, transforms);
        }
        return bundler
        .bundle()
        .pipe(source(fileName))
        .pipe(gulp.dest(destDir));
    });
}

gulp.task('devbuild',['jsbeautify:src'], function(){

    del([paths.dirs.build], function () {
        console.log('Cleaning old built assets.');
    });

    var modelStreams = createBundlerStreams(paths.files.modelsSrc, 'build/models/');
    var effectsStreams = createBundlerStreams(paths.files.effectsSrc, 'build/effects/');
    var coreStream = createBundlerStreams(paths.files.coreSrc, 'build/core/');

    var combinedStreams = modelStreams.concat(effectsStreams).concat(coreStream);

    return merge.apply(this,combinedStreams);
});

gulp.task('releasebuild',['jsbeautify:src'], function(){

    del([paths.dirs.build], function () {
        console.log('Cleaning old built assets.');
    });

    var modelStreams = createBundlerStreams(paths.files.modelsSrc, 'build/models/', 'uglifyify');
    var effectsStreams = createBundlerStreams(paths.files.effectsSrc, 'build/effects/', 'uglifyify');
    var coreStream = createBundlerStreams('src/lib/core/SPAudioBuffer.js', 'build/core/', 'uglifyify');

    var combinedStreams = modelStreams.concat(effectsStreams).concat(coreStream);

    return merge.apply(this,combinedStreams);
});

gulp.task('watch:lib', function(){
    gulp.watch(paths.files.libSrc, ['devbuild']);
});

/*
**** Version Bumping ****
*/

gulp.task('bump:major', function(){
  return gulp.src('./package.json')
  .pipe(bump({type: 'major'}))
  .pipe(gulp.dest('./'));
    var effectStream = gulp.src(paths.dirs.build + 'effects/*.js')
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest(paths.dirs.release + 'effects/'));

    return merge(modelStream, effectStream);
});

gulp.task('bump:minor', function(){
  return gulp.src('./package.json')
  .pipe(bump({type: 'minor'}))
  .pipe(gulp.dest('./'));
});

gulp.task('bump:patch', function(){
  return gulp.src('./package.json')
  .pipe(bump({type: 'patch'}))
  .pipe(gulp.dest('./'));

    var effectStream = gulp.src(paths.dirs.build + 'effects/*.js')
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest(paths.dirs.release + 'effects/'));

    return merge(modelStream, effectStream);
});

/*
**** Release ****
*/

gulp.task('release', ['releasebuild', 'publishdocs'], function(){
    pkg = requireUncached('./package.json');
    gutil.log("Creating the ", pkg.version, " release.");

    return gulp.src(paths.files.builtSrc)
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest(paths.dirs.release ));
});

gulp.task('release:testbuild', ['bump:pre', 'releasebuild', 'publishdocs'], function(){
    pkg = requireUncached('./package.json');
    gutil.log("Creating the ", pkg.version, " test release.");

    return gulp.src(paths.files.builtSrc)
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest(paths.dirs.release));
});

gulp.task('bump:pre', function(){
  return gulp.src('./package.json')
  .pipe(bump({type: 'prerelease'}))
  .pipe(gulp.dest('./'));
});

/*
**** Player ****
*/

gulp.task('player:compass', function (){
    return gulp.src(paths.dirs.player + "sass/*.scss")
    .pipe(compass({
        css: paths.dirs.player+'css/',
        sass: paths.dirs.player+'sass/',
        require: ['susy', 'breakpoint']
    }));
});

gulp.task('playerbuild', ['player:compass', 'devbuild']);

gulp.task('player', ['player:compass', 'devbuild', 'watch:player'], function(){
    return gulp.src([paths.dirs.player, paths.dirs.build])
    .pipe(webserver({
        port: 8080,
        open: true,
        host : "localhost"
    }));
});

gulp.task('watch:player', ['watch:lib'], function(){
    gulp.watch(paths.files.playerCSS, ['player:compass']);
});



/*
**** Testing ****
*/


gulp.task('jsbeautify:test', function(){
    return gulp.src([paths.files.allTestSrc, '!test/unit/vendor/**'])
    .pipe(cached('beautify:test'))
    .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
    .pipe(gulp.dest(paths.dirs.test));
});

gulp.task('watch:test', ['watch:lib'], function(){
    gulp.watch(paths.files.allTestSrc, ['jsbeautify:test']);
});

gulp.task('test', ['devbuild'], function(){
    return gulp.src([paths.dirs.manualtest, paths.dirs.build])
    .pipe(webserver({
        port: 8080,
        open: true,
        host : "localhost"
    }));
});

gulp.task('unittest', ['devbuild', 'watch:test'], function(){
    return gulp.src([paths.dirs.unittest, paths.dirs.build])
    .pipe(webserver({
        port: 8081,
        open: true,
        host : "localhost"
    }));
});

gulp.task('integration', ['devbuild', 'watch:test'], function(){
    return gulp.src([paths.dirs.integration, paths.dirs.build])
    .pipe(webserver({
        port: 8082,
         open: true,
        host : "localhost"
    }));

});



/*

gulp build
gulp player
gulp test
gulp unittest


gulp bump:major
gulp bump:minor
gulp bump:patch
gulp bump:pre
gulp release

*/
