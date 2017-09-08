const sinon         = require('sinon'),
    { expect }      = require('chai'),
    { beforeEach, describe, afterEach, it} = require('mocha'),
    inquirerWrapper = require('../src/inquirerWrapper');

describe('inquirer.js Tests', function() {
    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        this.sandbox.restore();
    });

    it('should return a promise', function() {
        var questions = [];
        var result = inquirerWrapper.prompt(questions);

        expect(result).to.have.property('then');
    });
});
