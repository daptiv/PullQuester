'use strict';

var fs = require('fs');

function upgrade_from_0_3_0_to_0_4_0() {
    fs.mkdirSync('.pullquester');
    fs.renameSync('pullrequest.json', '.pullquester/pullrequest.json');
    fs.renameSync('pullrequest.tmpl', '.pullquester/pullrequest.tmpl');
}

module.exports = function() {
    upgrade_from_0_3_0_to_0_4_0();
};