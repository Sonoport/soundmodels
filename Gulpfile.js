"use strict";

var pkg = require('./package.json');
var gulp = require('gulp');
var yuidoc = require("gulp-yuidoc");
var prettify = require('gulp-jsbeautifier');

var through = require('through2');

var banner= '/*<%= pkg.name %> - v<%= pkg.version %> - ' +
'<%= grunt.template.today("yyyy-mm-dd") %> */ \n' +
'console.log("   ____                           __ \\n" + "  / _____  ___ ___  ___ ___  ____/ /_\\n" + " _\\\\ \\\\/ _ \\\\/ _ / _ \\\\/ _ / _ \\\\/ __/ __/\\n" + "/___/\\\\___/_//_\\\\___/ .__\\\\___/_/  \\\\__/ \\n" + "                 /_/                 \\n" + "Hello Developer!\\n" + "Thanks for using Sonoport Dynamic Sound Library v<%= pkg.version %>.");\n';

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
        src: 'src',
        docs: 'docs/yuidocs',
        build: 'build',
        dist: 'dist',
        release: 'dist/release',
        core: 'src/lib/core',
        models: 'src/lib/models',
        themedir: 'docs/yuitheme',
        temp: 'src/lib/temp',
        player: 'src/jsmplayer',
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

gulp.task('devbuild', function() {

    gulp.src(paths.files.libSrc)
    .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
    .pipe(gulp.dest("./test/"));
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
