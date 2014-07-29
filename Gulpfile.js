"use strict";

var gulp = require('gulp');
var yuidoc = require("yuidoc");


var banner= '/*<%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %> */ \n' +
            'console.log("   ____                           __ \\n" + "  / _____  ___ ___  ___ ___  ____/ /_\\n" + " _\\\\ \\\\/ _ \\\\/ _ / _ \\\\/ _ / _ \\\\/ __/ __/\\n" + "/___/\\\\___/_//_\\\\___/ .__\\\\___/_/  \\\\__/ \\n" + "                 /_/                 \\n" + "Hello Developer!\\n" + "Thanks for using Sonoport Dynamic Sound Library v<%= pkg.version %>.");\n';

var paths = {

}


gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('makeDoc', function() {
    gulp.src("./src/*.js")
    .pipe(yuidoc())
    .pipe(gulp.dest('./documentation-output'));
});


jsbeautifier,jshint,requirejs,copy,yuidoc,clean,copy,usebanner,compass,webserver,

// Runnable Tasks
gulp.task( 'dev-build', [ 'jsbeautifier', 'jshint', 'requirejs:debug' ] );
gulp.task( 'make-doc', [ 'jsbeautifier', 'jshint', 'yuidoc:dev' ] );

gulp.task( 'release', [ 'jshint', 'requirejs:release', 'copy:temp', 'yuidoc:release', 'clean:temp', 'copy:dist', 'usebanner' ] );

// Player css related, probably not necessary to run this unless there is a change in design.
gulp.task( 'player-build', [ 'compass', 'jsbeautifier', 'jshint', 'connect:player', 'watch:player' ] );



// Testing
// Manual Testing
gulp.task( 'test', [ 'dev-build', 'connect:test', 'concurrent:watchTests' ] );

// Jasmine Unit Tests
gulp.task( 'unittest', [ 'dev-build', 'connect:unittest', 'concurrent:watchTests' ] );

// Run Player
gulp.task( 'player', [ 'dev-build', 'connect:player', 'concurrent:watchPlayer' ] );

// Jasmine Integration Tests
gulp.task( 'integration', [ 'dev-build', 'connect:integration', 'concurrent:watchTests' ] );
