const sinon   = require('sinon'),
    { expect } = require('chai'),
    { describe, beforeEach, afterEach, it } = require('mocha'),
    inquirer = require('inquirer'),
    gitHubWrapper = require('../src/githubWrapper');

describe('githubwrapper.js Tests', function() {
    let mockGithub;
    let sandbox;
    beforeEach(function() {
        sandbox = sinon.createSandbox();
        mockGithub = {
            authenticate: sandbox.stub().resolves(),
            users: {
                getForUser: sandbox.stub().resolves(),
                getOrgs: sandbox.stub().resolves(),
            },
            orgs: {
                getTeams: sandbox.stub().resolves(),
                getTeamMembers: sandbox.stub().resolves(),
                getMembers: sandbox.stub().resolves(),
            },
            repos: {
                get: sandbox.stub().resolves(),
                getCollaborators: sandbox.stub().resolves(),
            },
        };
        sandbox.stub(gitHubWrapper, 'ghApi').returns(mockGithub);
    });

    afterEach(function() {
        sandbox.restore();
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
        var result = gitHubWrapper.getUser(username, {});

        expect(result).to.have.property('then');
    });

    it('authenticate should use token type auth when username is `<token>`', (done) => {
        const password = 'thisisanapitoken';
        sandbox.stub(inquirer, 'prompt').resolves({username: '<token>', password});
        gitHubWrapper.authenticate().then(() => {
            expect(mockGithub.authenticate.calledOnce).to.be.true;
            expect(mockGithub.authenticate.args[0][0]).to.eql({type: 'token', token: password});
            done();
        })
        .catch(e => {
            done(e);
        });
    });

    it('authenticate should use basic type auth when username is anything except `<token>`', (done) => {
        const password = 'this is some password';
        const username = 'not-token';
        sandbox.stub(inquirer, 'prompt').resolves({username, password});
        gitHubWrapper.authenticate().then(() => {

            expect(mockGithub.authenticate.calledOnce).to.be.true;
            expect(mockGithub.authenticate.args[0][0]).to.eql({type: 'basic', username, password});
            done();
        })
        .catch(e => {
            done(e);
        });
    });

    describe('2FA checks', () => {
        let errorSpy;
        const otpError = {
            code: 401,
            headers: { ['x-github-otp']: 'required; app'}
        };
        const otherError = new Error('not a 2FA issue');

        const otpReject = (spy) => {
            spy.reset();
            spy.rejects(otpError);
        };
        const otherReject = (spy) => {
            spy.reset();
            spy.rejects(otherError);
        };

        beforeEach(() => {
            errorSpy = sandbox.stub(console, 'error');
        });

        [
            ['getUser', mock => mock.users.getForUser],
            ['getMembers', mock => mock.orgs.getMembers],
            ['getTeamMembers', mock => mock.orgs.getTeamMembers],
            ['getTeams', mock => mock.orgs.getTeams],
            ['getCollaborators', mock => mock.repos.getCollaborators],
            ['getOrganizations', mock => mock.users.getOrgs],
        ].forEach(([methodName, getApiSpy]) => {
            it(`${methodName} should message on 2fa error`, (done) => {
                otpReject(getApiSpy(mockGithub));

                gitHubWrapper[methodName].call()
                    .then(() => {}, () => {}) // catch any uncaught errors
                    .then(() => {
                        expect(errorSpy.calledOnce).to.be.true;
                        done();
                    });
            });

            it(`${methodName} should not message on non-2fa error`, (done) => {
                otherReject(getApiSpy(mockGithub));
                gitHubWrapper[methodName].call()
                    .then(() => {}, () => {}) // catch any uncaught errors
                    .then(() => {
                        expect(errorSpy.called).to.be.false;
                        done();
                    });
            });

            it(`${methodName} should not resolve error state on 2fa error`, (done) => {
                otpReject(getApiSpy(mockGithub));
                gitHubWrapper[methodName].call()
                    .then(() => {
                        done(new Error('error state was resolved.'));
                    }, (error) => {
                        expect(error).to.eql(otpError);
                        done();
                    });
            });

            it(`${methodName} should not resolve error state on non-2fa error`, (done) => {
                otherReject(getApiSpy(mockGithub));
                gitHubWrapper[methodName].call()
                    .then(() => {
                        done(new Error('error state was resolved.'));
                    }, (error) => {
                        expect(error).to.eql(otherError);
                        done();
                    });
            });
        });

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
