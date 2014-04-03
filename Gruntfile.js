module.exports = function ( grunt ) {
    "use strict";
    // Project configuration.
    grunt.initConfig( {
        // This line makes your node configurations available for use
        pkg: grunt.file.readJSON( 'package.json' ),
        // Define a banner
        banner: '/*<%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %> */ \n' +
            'console.log("   ____                           __ \\n" + "  / _____  ___ ___  ___ ___  ____/ /_\\n" + " _\\\\ \\\\/ _ \\\\/ _ / _ \\\\/ _ / _ \\\\/ __/ __/\\n" + "/___/\\\\___/_//_\\\\___/ .__\\\\___/_/  \\\\__/ \\n" + "                 /_/                 \\n" + "Hello Developer!\\n" + "Thanks for using Sonoport Dynamic Sound Library.");\n',
        // Define files and locations
        files: {
            jsSrc: 'src/lib/**/*.js',
            testSrc: 'test/**/*.js',
            playerSrc: 'jsmplayer/js/player.js'
        },
        dirs: {
            src: 'src',
            docs: 'docs',
            build: 'build',
            dist: 'dist',
            release: 'dist/release',
            core: 'src/lib/core',
            models: 'src/lib/models',
            temp: 'src/lib/temp',
            player: 'jsmplayer'
        },
        // JS Beautifier - automatic code cleanup.
        jsbeautifier: {
            files: [ 'package.json', 'Gruntfile.js', '<%= files.jsSrc %>', '<%= files.playerSrc %>' ],
            options: {
                config: ".jsbeautifyrc"
            }
        },
        // JSHint
        jshint: {
            all: [ 'package.json', 'Gruntfile.js', '<%= files.jsSrc %>', '<%= files.playerSrc %>' ]
        },
        requirejs: {
            compile: {
                options: {
                    optimize: "uglify2",
                    baseUrl: "src/lib/",
                    dir: "<%= dirs.build %>",
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
                        name: 'models/Action'
                    }, ],
                    uglify2: {
                        compress: {
                            sequences: true,
                            properties: true, // optimize property access: a["foo"] → a.foo
                            dead_code: true, // discard unreachable code
                            drop_debugger: true, // discard “debugger” statements
                            unsafe: false, // some unsafe optimizations (see below)
                            conditionals: true, // optimize if-s and conditional expressions
                            comparisons: true, // optimize comparisons
                            evaluate: true, // evaluate constant expressions
                            booleans: true, // optimize boolean expressions
                            loops: true, // optimize loops
                            unused: true, // drop unused variables/functions
                            hoist_funs: true, // hoist function declarations
                            hoist_vars: false, // hoist variable declarations
                            if_return: true, // optimize if-s followed by return/continue
                            join_vars: true, // join var declarations
                            cascade: true, // try to cascade `right` into `left` in sequences
                            side_effects: true, // drop side-effect-free statements
                            warnings: true, // warn about potentially dangerous optimizations/code
                            global_defs: {} // global definitions
                        },
                        mangle: {
                            toplevel: true
                        }
                    }
                }
            }
        },
        // Watcher for updating
        watch: {
            scripts: {
                files: [ '<%= files.jsSrc %>', '<%= files.testSrc %>', 'Gruntfile.js', ],
                tasks: [ 'dev-build' ],
                options: {
                    spawn: false
                }
            },
            docs: {
                files: [ '<%= files.jsSrc %>', '<%= files.testSrc %>', 'Gruntfile.js', ],
                tasks: [ 'make-doc' ],
                options: {
                    spawn: false
                }
            },
            // Mainly for watching changes in the html and css files
            playerui: {
                files: [ '<%= dirs.player %>/**/*.scss' ],
                tasks: [ 'compass:devdist' ]
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: [ '<%= dirs.player %>/**/*' ] 
            }
        },
            // YUI Documentation
                yuidoc: {
                    dev: {
                        name: '<%= pkg.name %>',
                        description: '<%= pkg.description %>',
                        version: '<%= pkg.version %>',
                        url: '<%= pkg.homepage %>',
                        options: {
                            paths: '<%= dirs.src %>',
                            outdir: '<%= dirs.docs %>',
                            linkNatives: "true"
                        }
                    },
                    release: {
                        name: '<%= pkg.description %>',
                        description: '<%= pkg.description %>',
                        version: '<%= pkg.version %>',
                        url: '<%= pkg.homepage %>',
                        logo: 'http://sonoport.com/img/Logo.png',
                        options: {
                            // SPAudioParam.js, BaseSound.js, Envelope.js
                            paths: [ '<%= dirs.models %>', 'src/lib/temp' ],
                            outdir: '<%= dirs.release %>/docs',
                            linkNatives: "true",
                            nocode: "true"

                        }
                    }
                },
                copy: {
                    dist: {
                        files: [ {
                            expand: true,
                            src: [ '<%= dirs.build %>/models/*.js' ],
                            dest: '<%= dirs.release %>/lib',
                            filter: 'isFile',
                            flatten: true
                        }, ]
                    },
                    temp: {
                        files: [ {
                            expand: true,
                            src: [ '<%= dirs.core %>/{SPAudioParam,BaseSound,Envelope}.js' ],
                            dest: '<%= dirs.temp %>',
                            filter: 'isFile',
                            flatten: true
                        }, ]
                    }
                },
                clean: {
                    temp: [ '<%= dirs.temp %>' ],
                },
                usebanner: {
                    main: {
                        options: {
                            position: 'top',
                            banner: '<%= banner %>',
                            linebreak: true
                        },
                        files: {
                            src: [ '<%= dirs.release %>/lib/*.js' ]
                        }
                    }
                },
        // Player related 
        // To run this will require Sass (3.3.4), Compass (1.0.0-alpha), breakpoint (2.4.2) and Susy (2.1.1) pre-installed.
        // compile sass files to css using Compass: http://compass-style.org/
        // Also depends on Susy http://susy.oddbird.net/ to generate css for grids
        compass: {
            devdist: {
                options: {
                    sassDir: '<%= dirs.player %>/sass',
                    cssDir: '<%= dirs.player %>/css',
                    require: [ 'susy', 'breakpoint' ],
                }
            }
        },
        // HTTP server for testing
        connect: {
            build: {
                options: {
                    port: 8000,
                    base: [ '<%= dirs.build %>', 'test/models' ],
                    open: true
                }
            },
            release: {
                options: {
                    port: 8000,
                    base: [ '<%= dirs.release %>/lib', 'test/models' ],
                    open: true
                    }
            }, 
            player: {
                options: {
                    port: 8080,
                    base: [ '<%= dirs.build %>', '<%= dirs.player %>' ],
                    livereload: true
                }
            }
        },
        bowercopy: {
            options: {
                srcPrefix: 'bower_components'
            },
            scripts: {
                options: {
                    destPrefix: '<%= dirs.player %>/js/vendor',
                },
                files: {
                    'jquery.js': 'jquery/dist/jquery.js',
                    'jquery-ui.min.js': 'jquery-ui/ui/minified/jquery-ui.min.js'
                }
            }
        }
    } );
    // Load Plugins
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-connect' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );
    grunt.loadNpmTasks( 'grunt-contrib-yuidoc' );
    grunt.loadNpmTasks( 'grunt-contrib-requirejs' );
    grunt.loadNpmTasks( 'grunt-contrib-clean' );
    grunt.loadNpmTasks( 'grunt-jsbeautifier' );
    grunt.loadNpmTasks( 'grunt-banner' );

    // Player related
    grunt.loadNpmTasks( 'grunt-contrib-compass' );
    grunt.loadNpmTasks( 'grunt-bowercopy' );

    // Player css related, probably not necessary to run this unless there is a change in design
    grunt.registerTask( 'player-build', [ 'compass', 'jsbeautifier', 'jshint', 'connect:player', 'watch' ] );

    grunt.registerTask( 'dev-build', [ 'jsbeautifier', 'jshint', 'requirejs' ] );
    grunt.registerTask( 'make-doc', [ 'jsbeautifier', 'jshint', 'yuidoc:dev' ] );

    grunt.registerTask( 'release', [ 'jshint', 'requirejs', 'copy:temp', 'yuidoc:release', 'clean:temp', 'copy:dist', 'usebanner' ] );

    grunt.registerTask( 'test', [ 'dev-build', 'connect:build', 'watch' ] );
    grunt.registerTask( 'test-release', [ 'release', 'connect:release', 'watch' ] );
};
