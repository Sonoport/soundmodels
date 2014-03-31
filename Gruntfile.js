module.exports = function ( grunt ) {
    "use strict";
    // Project configuration.
    grunt.initConfig( {
        // This line makes your node configurations available for use
        pkg: grunt.file.readJSON( 'package.json' ),
        // Define files and locations
        files: {
            jsSrc: 'src/lib/**/*.js'
        },
        dirs: {
            src: 'src',
            docs: 'docs',
            build: 'build',
            core: 'src/lib/core',
            models: 'src/lib/models'
        },
        // JS Beautifier - automatic code cleanup.
        jsbeautifier: {
            files: [ 'package.json', 'Gruntfile.js', '<%= files.jsSrc %>' ],
            options: {
                config: ".jsbeautifyrc"
            }
        },
        // JSHint
        jshint: {
            all: [ 'package.json', 'Gruntfile.js', '<%= files.jsSrc %>' ]
        },
        requirejs: {
            compile: {
                options: {
                    optimize: "none",
                    appDir: "src/lib/",
                    dir: "<%= dirs.build %>",
                }
            }
        },
        // Watcher for updating
        watch: {
            scripts: {
                files: [ '<%= files.jsSrc %>' ],
                tasks: [ 'dev-build' ],
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
                    base: [ '<%= dirs.build %>', 'test/testaudioparam' ]
                }
            },
            testhk: {
                options: {
                    port: 8000,
                    base: [ '<%= dirs.build %>', 'test/' ]
                }
            },
            testlooper: {
                options: {
                    port: 8000,
                    base: [ '<%= dirs.build %>', 'test/test-looper' ]
                }
            }
        }
    } );
    // Load Plugins
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-connect' );
    grunt.loadNpmTasks( 'grunt-contrib-yuidoc' );
    grunt.loadNpmTasks( 'grunt-contrib-concat' );
    grunt.loadNpmTasks( 'grunt-contrib-requirejs' );
    grunt.loadNpmTasks( 'grunt-jsbeautifier' );
    grunt.registerTask( 'dev-build', [ 'jsbeautifier', 'jshint', 'requirejs' ] );
    grunt.registerTask( 'make-doc', [ 'jsbeautifier', 'jshint', 'yuidoc' ] );
    grunt.registerTask( 'test', [ 'jsbeautifier', 'jshint', 'requirejs', 'connect:test', 'watch' ] );
    grunt.registerTask( 'testhk', [ 'jsbeautifier', 'jshint', 'connect:testhk', 'watch' ] );
    grunt.registerTask( 'testlooper', [ 'jsbeautifier', 'jshint', 'requirejs', 'connect:testlooper', 'watch' ] );
};
