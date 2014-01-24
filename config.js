'use strict';
var fs = require('fs');
var configLocation = process.cwd() + '/pullrequest.json';

module.exports = {
    get: function () {
        try {
            return require(configLocation);
        } catch (error) {
            return;
        }
    },
    set: function (config) {
        try {
            return fs.writeFileSync(configLocation,  JSON.stringify(config, null, 4));
        } catch (error) {
            return;
        }
    }
};
