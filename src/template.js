'use strict';
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var templateLocation = process.cwd() + '/pullrequest.tmpl',
    defaultTemplateLocation = __dirname + '/pullrequest.tmpl';

function Template(location) {
    var location = path.resolve(process.cwd(), location);

    this.get = function() {
        try {
            return fs.readFileSync(location);
        } catch (error) {
            return;
        }
    };

    this.set = function(template) {
        try {
            return fs.writeFileSync(location,  template);
        } catch (error) {
            return;
        }
    };

    this.compile = function(templateData) {
        var compiledString = _.template(this.get(), templateData, {
            variable: 'config'
        });

        return compiledString;
    }
}

Template.createDefaultIfNotExists = function() {
    try {
        var template = Template.default;
        if (!template.get()) {
            var defaultTemplate = fs.readFileSync(defaultTemplateLocation);
            template.set(defaultTemplate);
        }
    } catch (error) {
        return false;
    }

    return true;
};

Template.default = (function() {
    return new Template(templateLocation);
})();

module.exports = Template;
