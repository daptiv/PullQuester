'use strict';

const fs = require('fs');
const Config = require('../config');
const github = require('../githubWrapper');

function upgrade_from_0_3_0_to_0_4_0() {
    if (fs.existsSync('./.pullquester/')) {
        return;
    }

    console.log('applying update from v0.3.0 to v0.4.0');

    fs.mkdirSync('.pullquester');
    fs.renameSync('pullrequest.json', '.pullquester/pullrequest.json');
    fs.renameSync('pullrequest.tmpl', '.pullquester/pullrequest.tmpl');
}

function upgrade_from_0_7_0_to_0_8_0() {
    var config = JSON.parse(fs.readFileSync('.pullquester/pullrequest.json'));
    if (config.revision && config.revision >= 2) {
        return;
    }

    console.log('applying update from v0.7.0 to v0.8.0');
    config.revision = 2;
    fs.writeFileSync('./.pullquester/pullrequest.json', JSON.stringify(config, null, 4));
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

function upgrade_from_1_2_1_to_1_3_0(id) {
    const config = id
        ? new Config(Config.createPathFromId(id))
        : Config.default;

    const configValue = config.get();
    if (configValue.revision && configValue.revision >= 3) {
        return;
    }

    console.log('applying update from v1.2.1 to v1.3.0');

    return github.getRepoInfo()
        .then(repoInfo => {
            configValue.defaultBaseBranch = repoInfo.defaultBranch;
            configValue.revision = 3;
            config.set(configValue);
        });
}

module.exports = function (id) {
    console.log('applying updates...');
    upgrade_from_0_3_0_to_0_4_0();
    upgrade_from_0_7_0_to_0_8_0();
    return upgrade_from_1_2_1_to_1_3_0(id)
        .then(() => {
            console.log('finished!');
        });
};
