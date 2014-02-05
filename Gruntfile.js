module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // This line makes your node configurations available for use
    pkg: grunt.file.readJSON('package.json'),
    // JS Beautifier - automatic code cleanup.
    jsbeautifier: {
      files: ["src/lib/**/*.js"],
    },
    // JSHint
    jshint: {
      all: ['Gruntfile.js', 'src/lib/**/*.js']
    },
    // Watcher for serving
    watch: {
      scripts: {
        //files: ['<%= dirs.src %>/*.js','app.js'],
        //tasks: ['jshint','uglify','browserify'],
        options: {
          spawn: false
        }
      }
    },
    // HTTP server for testing
    connect: {
      test1: {
        options: {
          port: 8080,
          base: 'test/'
        }
      },
      test2: {
        options: {
          port: 8080,
          base: 'test/'
        }
      }
    }
  });


  // Load Plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-jsbeautifier');

  grunt.registerTask('default', ['jsbeautifier','jshint']);
  grunt.registerTask('serve', ['jsbeautifier','jshint', 'connect', 'watch' ]);


};
