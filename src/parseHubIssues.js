'use strict';

var _ = require('lodash'),
    inquirer = require('inquirer');
/*
 * Converts string output from `hub issue` to an array of markdown formatted strings.
 * Array is split into issues and pull requests, each section is sorted by number.
 * There are 2 separators "Issues:" which is the first element, and "Pull Requests:" which comes after the last issue.
 *
 * example:
 * for this hub issue output: '    36] relate-issues ( https://github.com/daptiv/PullQuester/pull/36 )'
 * you get the formatted string: '#36 [ relate-issues ]( https://github.com/daptiv/PullQuester/pull/36 )'
 */
function parseHubIssues(rawIssues) {
    var sorted = rawIssues.split('\n').sort(function (a, b) {
        var aNum = parseInt(a.trim().replace(/(\d+).*/, '$1'), 10);
        var bNum = parseInt(b.trim().replace(/(\d+).*/, '$1'), 10);
        return aNum - bNum;
    });
    var formatted = _.map(sorted, function(i) {
        return i.trim().replace(/(\d+)]([^(]+)/, '#$1 [$2]');
    });
    var issuesAndPullRequests = _.filter(formatted, function(i) {
        return i.length > 0;
    });
    var issues = _.filter(issuesAndPullRequests, function(item) { return item.indexOf('/issues/') >= 0; });
    var pullRequests = _.filter(issuesAndPullRequests, function(item) { return item.indexOf('/pull/') >= 0; });
    var issuesSeparator = new inquirer.Separator('Issues:'),
        pullRequestsSeparator = new inquirer.Separator('Pull Requests:');
    var allChoices = [issuesSeparator].concat(issues)
        .concat([pullRequestsSeparator]).concat(pullRequests);

    return allChoices;
}

module.exports = parseHubIssues;
