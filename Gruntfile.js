module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        simplemocha: {
            options: {
                timeout: 3000,
                ignoreLeaks: false,
                reporter: 'spec'
            },

            all: { src: ['test/**/*.js'] }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-simple-mocha');

    // Default task(s).
    grunt.registerTask('default', ['simplemocha']);

};