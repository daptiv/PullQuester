'use strict';

var exec =  require('child_process').exec;
var inquirer = require('../inquirerWrapper');
var os = require('os');

module.exports = function() {
    exec('hub', function(error, stdout, stderr) {
        var matches = stderr.match(/hub: command not found/);
        if (matches && matches.length) {
            if (os.platform() === 'win32') {
                console.log(
                    'This install script is only supported on windows with ' +
                    'git bash.  If this fails please try again from git bash.');

                exec('./install-hub.win.sh', function() { });
            } else {
                exec('./install-hub.sh', function() { });
            }
        }
    });
};
