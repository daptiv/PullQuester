'use strict';

var _ = require('lodash'),
    inquirer = require('inquirer');
/*
 * Converts string output from `hub issue` to an array of markdown formatted strings
 *
 * example:
 * > var rawIssues = execSync('hub issues');
 * > console.log(rawIssues);
 * <
 *    36] relate-issues ( https://github.com/daptiv/PullQuester/pull/36 )
 *    34] add "prefer global" warning when installed non-globally ( https://github.com/daptiv/PullQuester/issues/34 )
 *    33] add  ( https://github.com/daptiv/PullQuester/issues/33 )
 *    29] windows dev box: hub credentials won't initialize in git bash when password >8 characters ( https://github.com/daptiv/PullQuester/issues/29 )
 *    22] Pullquester should use owners.md for suggested reviewers.  ( https://github.com/daptiv/PullQuester/issues/22 )
 *    21] Relate to pulls in other reposistories ( https://github.com/daptiv/PullQuester/issues/21 )
 *    15] Support searching for users ( https://github.com/daptiv/PullQuester/issues/15 )"
 * > var parsedIssues = parseHubIssues(rawIssues);
 * > console.log(parsedIssues);
 * < [
 *    '#15 [ Support searching for users ]( https://github.com/daptiv/PullQuester/issues/15 )',
 *    '#21 [ Relate to pulls in other reposistories ]( https://github.com/daptiv/PullQuester/issues/21 )',
 *    '#22 [ Pullquester should use owners.md for suggest…https://github.com/daptiv/PullQuester/issues/22 )',
 *    '#29 [ windows dev box: hub credentials won't initi…https://github.com/daptiv/PullQuester/issues/29 )',
 *    '#33 [ add  ]( https://github.com/daptiv/PullQuester/issues/33 )',
 *    '#34 [ add "prefer global" warning when installed n…https://github.com/daptiv/PullQuester/issues/34 )',
 *    '#36 [ relate-issues ]( https://github.com/daptiv/PullQuester/pull/36 )'
 *   ]
 */
function parseHubIssues(rawIssues) {
    var issuesAndPullRequests = _.filter(_.map(rawIssues.split('\n').sort(), function(i) {
        return i.trim().replace(/(\d+)]([^\(]+)/, '#$1 [$2]');
    }), function(item) {
        return item.length > 0;
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
