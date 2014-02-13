module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // This line makes your node configurations available for use
    pkg: grunt.file.readJSON('package.json'),

    // Define files and locations
    files:{
      js_src: 'src/lib/**/*.js'
    },
    dirs: {
      src : 'src',
      docs: 'docs',
      doc_theme : 'docs/theme'
    },
    // JS Beautifier - automatic code cleanup.
    jsbeautifier: {
      files: ['<%= files.js_src %>'],
    },
    // JSHint
    jshint: {
      all: ['Gruntfile.js', '<%= files.js_src %>']
    },
    // Watcher for updating
    watch: {
      scripts: {
        files: ['<%= files.js_src %>'],
        tasks: ['default'],
        options: {
          spawn: false
        }
      }
    },
    // YUI Documentation
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: '<%= dirs.src %>',
          outdir: '<%= dirs.docs %>',
          linkNatives: "true"
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
      testhk: {
        options: {
          port: 8000,
          base: 'test/'
        }
      }
    },
    // For copying files from src/ folder to test folder 
    copy: {
      main: {
        files: [{
          cwd: 'src/lib/core/',
          src: 'BaseSound.js',
          dest: 'test/test-BaseSound/',
          expand: true
        },
        {
          cwd: 'src/utils/',
          src: 'AudioContextMonkeyPatch.js',
          dest: 'test/test-BaseSound/utils',
          expand: true
        }
        ]
      }
    }
  });


  // Load Plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['jsbeautifier','jshint']);
  grunt.registerTask('serve', ['jsbeautifier','jshint', 'connect', 'watch' ]);
  grunt.registerTask('doc', ['jsbeautifier','jshint', 'connect', 'watch' ]);
  grunt.registerTask('testhk', ['jsbeautifier','jshint','connect:testhk', 'watch']);

};
