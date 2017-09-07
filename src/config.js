'use strict';

const fs = require('fs'),
    path = require('path'),
    configLocation = path.resolve(process.cwd(), '.pullquester', 'pullrequest.json');

class Configuration {
    constructor(location) {
        this.location = path.resolve(process.cwd(), '.pullquester', location);
    }

    get() {
        try {
            return require(this.location);
        } catch (error) {
            return;
        }
    }

    set(config) {
        try {
            config = Object.assign({}, config, {revision: 2});
            return fs.writeFileSync(this.location,  JSON.stringify(config, null, 4));
        } catch (error) {
            return;
        }
    }

    static get default() {
        return new Configuration(configLocation);
    }

    static createPathFromId(id) {
        return 'pullrequest.' + id + '.json';
    }
}

module.exports = Configuration;
