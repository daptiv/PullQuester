var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;

var GitHubApi = require('github');
var gitHubWrapper = require('../src/githubWrapper');

describe('githubwrapper.js Tests', function() {

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();

        this.promptStub = this.sandbox.stub(GitHubApi, 'prompt');
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