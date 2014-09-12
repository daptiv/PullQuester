'use strict';
var _ = require('lodash');
var fs = require('fs');
var templateLocation = process.cwd() + '/pullrequest.tmpl',
defaultTemplateLocation = __dirname + '/pullrequest.tmpl';

function createDefault (){
    var defaultTemplate = fs.readFileSync(defaultTemplateLocation);
    return this.set(defaultTemplate);
};

function createDefaultIfNotExists (){
  try {
      var template = this.get();
      if (!template) {
          this.createDefault();
      }
      return template;
  } catch (error) {
      return;
  }
}

function compile(templateData) {
    var compiledString = _.template(this.get(), templateData, {
        variable: 'config'
    });

    return compiledString;
}

function get () {
    try {
        return fs.readFileSync(templateLocation);
    } catch (error) {
        return;
    }
}

function set (template) {
    try {
        return fs.writeFileSync(templateLocation,  template);
    } catch (error) {
        return;
    }
}

module.exports = {
    createDefault: createDefault,
    compile: compile,
    createDefaultIfNotExists: createDefaultIfNotExists,
    get: get,
    set: set
};
