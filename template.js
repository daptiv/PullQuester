'use strict';
var fs = require('fs'),
    templateLocation = process.cwd() + '/pullrequest.tmpl',
    defaultTemplateLocation = __dirname + '/pullrequest.tmpl';

module.exports = {
    get: function () {
        try {
            return fs.readFileSync(templateLocation);
        } catch (error) {
            return;
        }
    },
    createDefaultIfNotExists: function () {
        try {
            var template = this.get();
            if (!template) {
                template = fs.readFileSync(defaultTemplateLocation);
                this.set(template);
            }
            return template;
        } catch (error) {
            return;
        }
    },
    set: function (template) {
        try {
            return fs.writeFileSync(templateLocation,  template);
        } catch (error) {
            return;
        }
    }
};
