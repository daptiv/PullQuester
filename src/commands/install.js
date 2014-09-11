'use strict';

var exec =  require('child_process').exec;
var inquirer = require('../inquirerWrapper');

module.exports = function() {
    exec('hub', function(error, stdout, stderr) {
        var matches = stderr.match(/hub: command not found/);
        if (matches && matches.length) {
            exec('./install-hub.sh', function() { });
        }
    });
};
