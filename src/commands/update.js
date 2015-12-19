'use strict';

var fs = require('fs');

function upgrade_from_0_3_0_to_0_4_0() {
    console.log('upgrading! 3>4');
    if (! fs.existsSync('./.pullquester/')) {
        fs.mkdirSync('.pullquester');
        fs.renameSync('pullrequest.json', '.pullquester/pullrequest.json');
        fs.renameSync('pullrequest.tmpl', '.pullquester/pullrequest.tmpl');
    }
}

function upgrade_from_0_7_0_to_0_8_0() {
    console.log('upgrading! 7>8');
    var config = JSON.parse(fs.readFileSync('.pullquester/pullrequest.json'));
    if (config.revision && config.revision >= 2) {
        return;
    }
    config.revision = 2;
    fs.writeFileSync('./.pullquester/pullrequest.json', JSON.stringify(config, null, 4))
    var template = fs.readFileSync('./.pullquester/pullrequest.tmpl');
    template += '\n';
    template += '<% if (config.issues && config.issues.length > 0) { %>\n';
    template += 'Related issues:\n';
    template += '---------------\n';
    template += '<% } %>\n';
    template += '<% _.forEach(config.issues, function(issueNumber) { %> - [ ] #<%- issueNumber %>\n';
    template += '<% }); %>\n';
    fs.writeFileSync('./.pullquester/pullrequest.tmpl', template);
}

module.exports = function() {
    console.log('upgrading?');
    upgrade_from_0_3_0_to_0_4_0();
    upgrade_from_0_7_0_to_0_8_0();
};
