var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var parseHubIssues = require('../src/parseHubIssues');
var inquirer = require('inquirer');

describe('parseHubIssues', function() {

    it('should start with Issues: separator', function() {
        var hubIssues = '\n    10] latest issue ( https://github.com/daptiv/PullQuester/issues/10 )';
        var issuesSeparator = new inquirer.Separator('Issues:');
        var parsed = parseHubIssues(hubIssues);
        expect(parsed[0]).to.deep.equal(issuesSeparator);
    });

    it('should correctly parse issues', function() {
        var hubIssues = '    10] latest issue ( https://github.com/daptiv/PullQuester/issues/10 )';
        var parsed = parseHubIssues(hubIssues);

        expect(parsed).to.have.length(3);
        expect(parsed[1]).to.equal('#10 [ latest issue ]( https://github.com/daptiv/PullQuester/issues/10 )');
    });

    it('should have Pull Requests: separator after issues', function() {
        var hubIssues = '\n    10] latest issue ( https://github.com/daptiv/PullQuester/issues/10 )';
        var prSeparator = new inquirer.Separator('Pull Requests:');
        var parsed = parseHubIssues(hubIssues);
        expect(parsed).to.have.length(3);
        expect(parsed[2]).to.deep.equal(prSeparator);
    });

    it('should correctly parse pull requests', function() {
        var hubIssues = '    9] latest pull request ( https://github.com/daptiv/PullQuester/pull/9 )';
        var parsed = parseHubIssues(hubIssues);

        expect(parsed).to.have.length(3);
        expect(parsed[2]).to.equal('#9 [ latest pull request ]( https://github.com/daptiv/PullQuester/pull/9 )');
    });

    it('should order issues numerically ascending then pull requests numerically ascending', function() {
        var hubIssues = '\n'
        hubIssues += '    10] latest issue ( https://github.com/daptiv/PullQuester/issues/10 )\n';
        hubIssues += '    8] another pull ( https://github.com/daptiv/PullQuester/pull/8 )\n';
        hubIssues += '    3] fake issue ( https://github.com/daptiv/PullQuester/issues/3 )\n';
        hubIssues += '    1] first pull ( https://github.com/daptiv/PullQuester/pull/1 )\n';
        var issuesSeparator = new inquirer.Separator('Issues:');
        var prSeparator = new inquirer.Separator('Pull Requests:');

        var parsed = parseHubIssues(hubIssues);

        expect(parsed).to.have.length(6);
        expect(parsed[0]).to.deep.equal(issuesSeparator);
        expect(parsed[1]).to.equal('#3 [ fake issue ]( https://github.com/daptiv/PullQuester/issues/3 )');
        expect(parsed[2]).to.equal('#10 [ latest issue ]( https://github.com/daptiv/PullQuester/issues/10 )');
        expect(parsed[3]).to.deep.equal(prSeparator);
        expect(parsed[4]).to.equal('#1 [ first pull ]( https://github.com/daptiv/PullQuester/pull/1 )');
        expect(parsed[5]).to.equal('#8 [ another pull ]( https://github.com/daptiv/PullQuester/pull/8 )');
    });
});
