const sinon         = require('sinon'),
    { expect }      = require('chai'),
    inquirer        = require('inquirer'),
    { beforeEach, describe, afterEach, it} = require('mocha'),
    inquirerWrapper = require('../src/inquirerWrapper');

describe('inquirer.js Tests', function() {
    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.promptStub = this.sandbox.stub(inquirer, 'prompt');
    });

    afterEach(function() {
        this.sandbox.restore();
    });

    it('should return a promise', function() {
        var questions = 'expected questions';
        var result = inquirerWrapper.prompt(questions);

        expect(result).to.have.property('then');
    });
});
