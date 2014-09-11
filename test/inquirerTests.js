var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;

var inquirer = require('inquirer');
var inquirerWrapper = require('../src/inquirerWrapper');

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