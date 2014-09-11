'use strict';
var temp = require('temp');
var _ = require('lodash');
var fs = require('fs');
var templateLocation = process.cwd() + '/pullrequest.tmpl',
defaultTemplateLocation = __dirname + '/pullrequest.tmpl';

function createDefault (){
    var defaultTemplate = fs.readFileSync(defaultTemplateLocation);
    return fs.writeFileSync(templateLocation,defaultTemplate);
};

function destroy() {
    temp.cleanup();
}

function compile(templateData) {
    var compiledString = _.template(templateValue, templateData, {
        variable: 'config'
    });

    var file = temp.openSync();
    fs.writeSync(file.fd, compiledString);

    return file.path;
}



module.exports = {
    createDefault: createDefault,
    destroy: destroy

};
