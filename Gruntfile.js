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
        concat: {
            options: {
                separator: ';',
            },
            dev: {
                src: [ '<%= files.jsSrc %>' ],
                dest: '<%= dirs.build %>/splib.js'
            },
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
                    base: 'test/'
                }
            }
        },
        // For copying files from src/ folder to test folder
        copy: {
            main: {
                files: [ {
                    cwd: 'src/lib/core/',
                    src: 'BaseSound.js',
                    dest: 'test/test-BaseSound/',
                    expand: true
                }, {
                    cwd: 'src/utils/',
                    src: 'AudioContextMonkeyPatch.js',
                    dest: 'test/test-BaseSound/utils',
                    expand: true
                } ]
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
    grunt.loadNpmTasks( 'grunt-contrib-copy' );

    grunt.registerTask( 'dev-build', [ 'jsbeautifier', 'jshint', 'requirejs' ] );
    grunt.registerTask( 'make-doc', [ 'jsbeautifier', 'jshint', 'yuidoc' ] );
    grunt.registerTask( 'test', [ 'jsbeautifier', 'jshint', 'concat', 'connect:test', 'watch' ] );
    grunt.registerTask( 'testhk', [ 'jsbeautifier', 'jshint', 'connect:testhk', 'watch' ] );
};
