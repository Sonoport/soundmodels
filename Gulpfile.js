"use strict";

var pkg = require('./package.json');

var gulp = require('gulp');
var yuidoc = require("gulp-yuidoc");
var prettify = require('gulp-jsbeautifier');
var jshint = require('gulp-jshint');
var gulpFilter = require('gulp-filter');

//var debug = require('gulp-debug');

var through = require('through2');

// var banner= '/*<%= pkg.name %> - v<%= pkg.version %> - ' +
// '<%= grunt.template.today("yyyy-mm-dd") %> */ \n' +
// 'console.log("   ____                           __ \\n" + "  / _____  ___ ___  ___ ___  ____/ /_\\n" + " _\\\\ \\\\/ _ \\\\/ _ / _ \\\\/ _ / _ \\\\/ __/ __/\\n" + "/___/\\\\___/_//_\\\\___/ .__\\\\___/_/  \\\\__/ \\n" + "                 /_/                 \\n" + "Hello Developer!\\n" + "Thanks for using Sonoport Dynamic Sound Library v<%= pkg.version %>.");\n';

var paths = {
    files: {
        jsSrc: 'src/**/**/*.js',
        playerSrc: 'src/jsmplayer/js/**.js',
        vendor: 'src/jsmplayer/vendor/*.js',
        libSrc: 'src/lib/**/*.js',
        modelSrc: 'src/lib/models/*.js',
        allTestSrc: 'test/**/*.js',
        unitTestCases: 'test/unit/cases/**/**/.js'
    },
    dirs: {
        build: 'build',
        dist: 'dist',
        release: 'dist/release',
        src: 'src',
        player: 'src/jsmplayer',
        lib: 'src/lib',
        core: 'src/lib/core',
        models: 'src/lib/models',
        temp: 'src/lib/temp',
        docs: 'docs/yuidocs',
        themedir: 'docs/yuitheme',
        unittest: 'test/unit',
        integration: 'test/integration/',
        manualtest: 'test/manual'
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

    gulp.src(paths.files.libSrc)
    .pipe(yuidoc.parser(yuiParserOpts))
    .pipe(yuidoc.generator(generatorOpt))
    .pipe(gulp.dest(paths.dirs.docs));
});

var removeYUIDocFiles =  through.obj(function(file, enc, callback) {
    if (file.isBuffer()) {
        var data = JSON.parse(file.contents.toString('utf-8'));
        data.files = [];
        file.contents = new Buffer(JSON.stringify(data), 'utf-8');
    }
    this.push(file);
    return callback();
});


gulp.task('publishdocs', function() {
    var generatorOpt = {
        themedir: paths.dirs.themedir,
        linkNatives: "true",
        nocode: "true"
    };

    gulp.src(paths.files.modelSrc)
    .pipe(yuidoc.parser(yuiParserOpts))
    .pipe(removeYUIDocFiles)
    .pipe(yuidoc.generator(generatorOpt))
    .pipe(gulp.dest(paths.dirs.release + "/docs"));
});

gulp.task('jshint', function(){
    var hintFiler = gulpFilter(['**', '!**/AudioContextMonkeyPatch.js', '!**/vendor/*.js']);

    gulp.src([paths.files.jsSrc, 'package.json', 'Gulpfile.js'])
    .pipe(hintFiler)
    //.pipe(debug())
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jsbeautify', ['jshint'], function(){
    gulp.src(paths.files.libSrc)
    .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
    .pipe(gulp.dest(paths.dirs.lib));
});

gulp.task('devbuild', ['jshint', 'jsbeautify'], function() {
    var rjsOptions = {
        optimize: "none",
        baseUrl: paths.dirs.lib,
        out: paths.dirs.build,
        modules: [ {
            name: 'models/Looper'
        }, {
            name: 'models/Extender'
        }, {
            name: 'models/Scrubber'
        }, {
            name: 'models/Trigger'
        }, {
            name: 'models/MultiTrigger'
        }, {
            name: 'models/Activity'
        }, ],
    };

});



// Runnable Tasks
// gulp.task( 'dev-build', [ 'jsbeautifier', 'jshint', 'requirejs:debug' ] );
// gulp.task( 'make-doc', [ 'jsbeautifier', 'jshint', 'yuidoc:dev' ] );

// gulp.task( 'release', [ 'jshint', 'requirejs:release', 'copy:temp', 'yuidoc:release', 'clean:temp', 'copy:dist', 'usebanner' ] );

// // Player css related, probably not necessary to run this unless there is a change in design.
// gulp.task( 'player-build', [ 'compass', 'jsbeautifier', 'jshint', 'connect:player', 'watch:player' ] );



// // Testing
// // Manual Testing
// gulp.task( 'test', [ 'dev-build', 'connect:test', 'concurrent:watchTests' ] );

// // Jasmine Unit Tests
// gulp.task( 'unittest', [ 'dev-build', 'connect:unittest', 'concurrent:watchTests' ] );

// // Run Player
// gulp.task( 'player', [ 'dev-build', 'connect:player', 'concurrent:watchPlayer' ] );

// // Jasmine Integration Tests
// gulp.task( 'integration', [ 'dev-build', 'connect:integration', 'concurrent:watchTests' ] );
