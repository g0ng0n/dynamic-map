/**
 * Created by g0ng0n on 8/21/2016.
 */
module.exports = function(grunt) {

    grunt.initConfig({
        // See: http://www.jshint.com/docs/
        jshint: {
            all: {
                src: 'js/app.js',
                options: {
                    bitwise: true,
                    camelcase: true,
                    curly: true,
                    eqeqeq: true,
                    forin: true,
                    immed: true,
                    indent: 4,
                    latedef: true,
                    newcap: true,
                    noarg: true,
                    noempty: true,
                    nonew: true,
                    quotmark: 'single',
                    regexp: true,
                    undef: false,
                    unused: true,
                    trailing: true,
                    maxlen: 120,
                    reporterOutput: ""
                }
            }
        },
        jsdoc : {
            dist : {
                src: ['js/*.js', 'js/app.js'],
                options: {
                    destination: 'doc'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.registerTask('default', ['jshint','jsdoc']);

};
