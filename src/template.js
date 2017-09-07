'use strict';

const _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    templateLocation = path.resolve(process.cwd(), '.pullquester', 'pullrequest.tmpl'),
    defaultTemplateLocation = path.resolve(__dirname , '..', 'pullrequest.tmpl');

class Template {
    constructor(location) {
        this.location = path.resolve(process.cwd(), '.pullquester', location);
    }

    get() {
        try {
            return fs.readFileSync(this.location);
        } catch (error) {
            return;
        }
    }

    set(template) {
        try {
            return fs.writeFileSync(this.location,  template);
        } catch (error) {
            return;
        }
    }

    compile(templateData) {
        const compiledString = _.template(this.get(), templateData, {
            variable: 'config'
        });
        return compiledString;
    }

    static createDefaultIfNotExists() {
        try {
            let template = Template.default;
            if (!template.get()) {
                let defaultTemplate = fs.readFileSync(defaultTemplateLocation);
                template.set(defaultTemplate);
            }
        } catch (error) {
            return false;
        }
        return true;
    }

    static get default() {
        return new Template(templateLocation);
    }

    static createPathFromId(id) {
        return 'pullrequest.' + id + '.tmpl';
    }
}

module.exports = Template;
