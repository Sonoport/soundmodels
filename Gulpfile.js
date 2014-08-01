"use strict";

var pkg = require('./package.json');
var rjsconfig = require('./rjsconfig.js');

var gulp = require('gulp');
var yuidoc = require("gulp-yuidoc");
var prettify = require('gulp-jsbeautifier');
var jshint = require('gulp-jshint');
var header = require('gulp-header');
var gulpFilter = require('gulp-filter');
var compass = require('gulp-compass');
var webserver = require('gulp-webserver');
var cached = require('gulp-cached');

//var debug = require('gulp-debug');

var requirejs = require('requirejs');

var banner= '/*<%= pkg.name %> - v<%= pkg.version %> - ' +
'<%= new Date() %> */ \n' +
'console.log("   ____                           __ \\n" + "  / _____  ___ ___  ___ ___  ____/ /_\\n" + " _\\\\ \\\\/ _ \\\\/ _ / _ \\\\/ _ / _ \\\\/ __/ __/\\n" + "/___/\\\\___/_//_\\\\___/ .__\\\\___/_/  \\\\__/ \\n" + "                 /_/                 \\n" + "Hello Developer!\\n" + "Thanks for using Sonoport Dynamic Sound Library v<%= pkg.version %>.");\n';

var paths = {
    files: {
        jsSrc: 'src/**/**/*.js',
        playerCSS: 'src/jsmplayer/**/**.css',
        vendor: 'src/jsmplayer/vendor/*.js',
        libSrc: 'src/lib/**/*.js',
        modelSrc: 'src/lib/models/*.js',
        allTestSrc: 'test/**/*.js',
        unitTestCases: 'test/unit/cases/**/**/.js',
        publishableSrc : ['src/lib/models/*.js', 'src/lib/core/SPAudioParam.js','src/lib/core/BaseSound.js','src/lib/core/Envelope.js']
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


gulp.task('default', function() {
  // place code for your default task here
});

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

    var fileFilter = gulpFilter(['**', '!**/files/**']);

    return gulp.src(paths.files.publishableSrc)
    .pipe(yuidoc.parser(yuiParserOpts))
    .pipe(yuidoc.generator(generatorOpt))
    .pipe(fileFilter)
    .pipe(gulp.dest(paths.dirs.release + "docs/"));
});

gulp.task('jshint:src', function(){
    var hintFiler = gulpFilter(['**', '!**/AudioContextMonkeyPatch.js', '!**/vendor/*.js']);

    return gulp.src([paths.files.jsSrc, 'package.json', 'Gulpfile.js'])
    .pipe(hintFiler)
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


gulp.task('devbuild', ['jsbeautify:src'], function(cb) {

    var config  = JSON.parse(JSON.stringify(rjsconfig.main));
    config.optimize = "none";

    requirejs.optimize(config, null, function(err) {
        throw err;
    });
    return cb();
});


gulp.task('releasebuild', ['jsbeautify:src'], function(cb) {

    var config  = JSON.parse(JSON.stringify(rjsconfig.main));
    config.optimize = "uglify2";
    config.uglify2 = rjsconfig.uglify;

    requirejs.optimize(config, null, function(err) {
        throw err;
    });
    cb();
});

gulp.task('release', ['releasebuild', 'publishdocs'], function(){
    return gulp.src(paths.dirs.build + 'models/*.js')
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest(paths.dirs.release + 'models/'));
});

gulp.task('player:compass', function (){
    return gulp.src(paths.dirs.player + "sass/*.scss")
    .pipe(compass({
        css: paths.dirs.player+'css/',
        sass: paths.dirs.player+'sass/',
        require: ['susy', 'breakpoint']
    }));
});

gulp.task('watch:lib', function(){
    gulp.watch(paths.files.libSrc, ['devbuild']);
});

gulp.task('watch:player', ['watch:lib'], function(){
    gulp.watch(paths.files.playerCSS, ['player:compass']);
});

gulp.task('playerbuild', ['player:compass', 'devbuild']);

gulp.task('player', ['player:compass', 'devbuild', 'watch:player'], function(){
    return gulp.src([paths.dirs.player, paths.dirs.build])
    .pipe(webserver({
        port: 8000
    }));
});

gulp.task('jsbeautify:test', function(){
    return gulp.src(paths.files.allTestSrc)
    .pipe(cached('beautify:test'))
    .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
    .pipe(gulp.dest(paths.dirs.test));
});

gulp.task('watch:test', ['watch:lib'], function(){
    gulp.watch(paths.files.allTestSrc, ['jsbeautify:test']);
});

gulp.task('test', ['devbuild', 'watch:test'], function(){
    return gulp.src([paths.dirs.manualtest, paths.dirs.build])
    .pipe(webserver({
        port: 8080
    }));
});

gulp.task('unittest', ['devbuild', 'watch:test'], function(){
    return gulp.src([paths.dirs.unittest, paths.dirs.build])
    .pipe(webserver({
        port: 8081
    }));
});

gulp.task('integration', ['devbuild', 'watch:test'], function(){
    return gulp.src([paths.dirs.integration, paths.dirs.build])
    .pipe(webserver({
        port: 8082
    }));
});
