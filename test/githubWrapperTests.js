const sinon   = require('sinon'),
    { expect } = require('chai'),
    { describe, beforeEach, afterEach, it } = require('mocha'),
    gitHubWrapper = require('../src/githubWrapper');

describe('githubwrapper.js Tests', function() {

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
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

    it('should return a promise from getTeams', function() {

        var result = gitHubWrapper.getTeams('test org');

        expect(result).to.have.property('then');
    });

    it('should return a promise from getTeamsMembers', function() {

        var result = gitHubWrapper.getTeamMembers('test id');

        expect(result).to.have.property('then');
    });

    it('should return a promise from getMembers', function() {
        var organization = 'TestOrg';

        var result = gitHubWrapper.getMembers(organization);

        expect(result).to.have.property('then');
    });

    it('should return a promise from getUser', function() {
        var username = 'testUser';
        var result = gitHubWrapper.getUser(username);

        expect(result).to.have.property('then');
    });

    describe('remote regex', function() {
        const regexp = gitHubWrapper.GITHUB_REMOTE_REGEXP;
        const user = 'someuser';
        const repo = 'somerepo';
        const sshFetch = `origin	git@github.com:${user}/${repo}.git (fetch)`;
        const httpsFetch = `origin	https://github.com/${user}/${repo}.git (fetch)`;
        const sshPush = `origin	git@github.com:${user}/${repo}.git (push)`;

        it('should match fetch remote in ssh format', function() {
            expect(regexp.test(sshFetch)).to.be.true;

            const [, userCap, repoCap] = sshFetch.match(regexp);
            expect(userCap).to.equal(user);
            expect(repoCap).to.equal(repo);
        });

        it('should match fetch remote in https format', function () {
            expect(regexp.test(httpsFetch)).to.be.true;

            const [, userCap, repoCap] = httpsFetch.match(regexp);
            expect(userCap).to.equal(user);
            expect(repoCap).to.equal(repo);
        });

        it('should not match push remote', function () {
            expect(regexp.test(sshPush)).to.be.false;
        });
    });
});
