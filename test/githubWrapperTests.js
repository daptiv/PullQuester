var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;

var GitHubApi = require('github');
var gitHubWrapper = require('../src/githubWrapper');

describe('githubwrapper.js Tests', function() {

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();

        //this.gitHubStub = this.sandbox.stub(GitHubApi, 'prompt');
    });

    afterEach(function() {
        this.sandbox.restore();
    });

    it('should return a promise from authenticate', function() {
        var username = 'TestUser';
        var password = '154154';

        var result = gitHubWrapper.authenticate(username, password);

        expect(result).to.have.property('then');
    });

    it('should return a promise from getOrganizations', function() {

      var result = gitHubWrapper.getOrganizations();

      expect(result).to.have.property('then');
    });

    it('should return a promise from getCollaborators', function() {

      var result = gitHubWrapper.getCollaborators('testUser', 'testRepo');

      expect(result).to.have.property('then');
    });

    it('should return a promise from getMembers', function() {
      var organization = 'TestOrg';

      var result = gitHubWrapper.getMembers(organization);

      expect(result).to.have.property('then');
    });

    it('should returna a promise from getUser', function() {
      var username = 'testUser'
      var result = gitHubWrapper.getUser(username);

      expect(result).to.have.property('then');
    });

});
