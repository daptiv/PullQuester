'use strict';

const _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    templateLocation = process.cwd() + '/.pullquester' + '/pullrequest.tmpl',
    defaultTemplateLocation = path.resolve(__dirname, '..', 'pullrequest.tmpl');

function Template(location) {
    location = path.resolve(process.cwd(), '.pullquester', location);

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
        var compiledString = _.template(this.get());

        return compiledString(templateData);
    };
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

Template.createPathFromId = function(id) {
    return 'pullrequest.' + id + '.tmpl';
};

module.exports = Template;
