'use strict';

var exec = require('child_process').exec;
var inquirer = require('../inquirerWrapper');
var os = require('os');
var path = require('path');

module.exports = function() {
    exec('hub', function(error, stdout, stderr) {
        var matches = [
            stderr.match(/hub: command not found/),
            stderr.match(/No such file/),
            stderr.match(/'hub' is not recognized/)
        ];

        if ((matches[0] && matches[0].length) ||
            (matches[1] && matches[1].length) ||
            (matches[2] && matches[2].length)) {

            var script = 'install-hub.sh';
            if (os.platform() === 'win32') {
                console.log(
                    'This install script is only supported on windows with ' +
                    'git bash.  If this fails please try again from git bash.');

                script = 'install-hub.win.sh';
            }
            var installScript = path.resolve(__dirname + '/../../' + script);
            console.log('Installing hub, this should take a couple minutes.');
            exec(installScript, function(err, sout, serr) {
                if (err) {console.log('err: ' + err);}
                if (serr) {console.log('err: ' + serr);}
                console.log(sout);
            });
        }
    });
};
