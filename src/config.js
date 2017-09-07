'use strict';

const fs = require('fs'),
    path = require('path'),
    configLocation = process.cwd() + '/.pullquester' + '/pullrequest.json';


function Configuration(location) {
    location = path.resolve(process.cwd(), '.pullquester', location);

    this.get = function() {
        try {
            return require(location);
        } catch (error) {
            return;
        }
    };

    this.set = function(config) {
        try {
            config = Object.assign({}, config, {revision: 2});
            return fs.writeFileSync(location,  JSON.stringify(config, null, 4));
        } catch (error) {
            return;
        }
    };
}

Configuration.default = (function() {
    return new Configuration(configLocation);
})();

Configuration.createPathFromId = function(id) {
    return 'pullrequest.' + id + '.json';
};

module.exports = Configuration;
