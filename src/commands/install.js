'use strict';

var exec =  require('child_process').exec;
var inquirer = require('../inquirerWrapper');
var os = require('os');

module.exports = function() {
    exec('hub', function(error, stdout, stderr) {
        var matches = [
			stderr.match(/hub: command not found/),
			stderr.match(/hub: No such file/),
			stderr.match(/'hub' is not recognized/)
		];

        if ((matches[0] && matches[0].length) ||
			(matches[1] && matches[1].length) ||
			(matches[2] && matches[2].length)) {

            if (os.platform() === 'win32') {
                console.log(
                    'This install script is only supported on windows with ' +
                    'git bash.  If this fails please try again from git bash.');

                exec(__dirname + '/../../install-hub.win.sh', function() { });
            } else {
                exec(__dirname + '/../../install-hub.sh', function() { });
            }
        }
    });
};
