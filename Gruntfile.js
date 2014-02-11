module.exports = function(grunt) {
    "use strict";
    // Project configuration.
    grunt.initConfig({
        // This line makes your node configurations available for use
        pkg: grunt.file.readJSON('package.json'),

        // Define files and locations
        files:{
            jsSrc: 'src/lib/**/*.js'
        },
        dirs: {
            src : 'src',
            docs: 'docs',
            build: 'build',
            core: 'src/lib/core',
            models: 'src/lib/models'
        },
        // JS Beautifier - automatic code cleanup.
        jsbeautifier: {
            files: ['<%= files.jsSrc %>'],
        },
        // JSHint
        jshint: {
            all: ['Gruntfile.js', '<%= files.jsSrc %>']
        },
        concat: {
            options: {
                separator: ';',
            },
            dev : {
                src: ['<%= files.jsSrc %>'],
                dest: '<%= dirs.build %>/splib.js'
            },
        },
        // Watcher for updating
        watch: {
            scripts: {
                files: ['<%= files.jsSrc %>'],
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
            test: {
                options: {
                    port: 8080,
                    base: ['<%= dirs.build %>','test/testaudioparam']
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
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.registerTask('dev-build', ['jsbeautifier','jshint','concat']);
    grunt.registerTask('make-doc', ['jsbeautifier','jshint', 'yuidoc']);
    grunt.registerTask('test', ['jsbeautifier','jshint', 'concat', 'connect:test', 'watch']);
};
