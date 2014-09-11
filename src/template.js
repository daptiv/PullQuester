'use strict';
var temp = require('temp');
var _ = require('lodash');
var fs = require('fs');

function create(templateFile) {
    var templateValue = templateFile.get();

    return {
        compile: function(templateData) {
            var compiledString = _.template(templateValue, templateData, {
                variable: 'config'
            });

            var file = temp.openSync();
            fs.writeSync(file.fd, compiledString);

            return file.path;
        }
    }
}

function destroy() {
    temp.cleanup();
}

module.exports = {
    create: create,
    destroy: destroy
};
