'use strict';
var fs = require('fs');
var path = require('path');
var configLocation = process.cwd() + '/.pullquester' + '/pullrequest.json';


function Configuration(location) {
    var location = path.resolve(process.cwd(), '.pullquester', location);
    console.log('config: ' + location);

    this.get = function() {
        try {
            return require(location);
        } catch (error) {
            return;
        }
    };

    this.set = function(config) {
        try {
            return fs.writeFileSync(location,  JSON.stringify(config, null, 4));
        } catch (error) {
            console.log(error);
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
