'use strict';

var inquirer = require('../inquirerWrapper');
var _ = require('lodash');
var Q = require('q');
var config = require('./../../config');
var template = require('./../../template');
var exec =  require('child_process').exec;

var github = require('../githubWrapper');
var InquirerQuestionBuilder = require('../inquirerQuestionBuilder');

var GITHUB_REMOTE_REGEXP = /github\.com:([^\/]+)\/([^\/]+) \(fetch\)$/;
function getCollaborators() {
    var deferred = Q.defer();

    exec('git remote -v', function(error, stdout, stderr) {
        var remotes = stdout.toString().split('\n');

        inquirer
            .prompt([{
                    name: 'remote',
                    type: 'list',
                    message: 'Choose a remote to get collaborators for',
                    choices: _.filter(remotes, function(remote) { return GITHUB_REMOTE_REGEXP.test(remote); })
                }])
            .then(function(answers) {
                answers.remote.match(GITHUB_REMOTE_REGEXP);

                github
                    .getCollaborators(RegExp.$1, RegExp.$2)
                    .then(function(users) {
                        deferred.resolve(users);
                    });
            });
    });

    return deferred.promise;
}

module.exports = function () {

    inquirer.prompt(InquirerQuestionBuilder.GithubAuth)

        // authenticate github api
        .then(function (answers) {
            console.log('authenticating');
            return github.authenticate(answers.username, answers.password);
        })

        // get github organizations for user
        .then(function() {
            console.log('getting organizations');
            return github.getOrganizations();
        })

        // have user choose which organization to pull users from
        .then(function(orgs) {
            var orgsToDisplay = _.pluck(orgs, 'login');
            orgsToDisplay.push('none');

            return inquirer.prompt(
                new InquirerQuestionBuilder()
                    .withListQuestion('org', 'Choose the org you wish to view', orgsToDisplay)
                    .build());
        })

        // either get the collaborators for the repo, or get the members for the organization
        .then(function(answers) {
            var usersPromise;
            if (answers.org === 'none') {
                usersPromise = getCollaborators();
            } else {
                usersPromise = Q.nfcall(github.orgs.getMembers, {org: answers.org, per_page: 100});
            }

            return usersPromise;
        })

        // fetch user data for each user
        .then(function(users) {
            return Q.all(_.map(users, function (user) {
                return github.getUser(user.login)
                    .then(function(user) {
                        return {
                            name: user.name || user.login,
                            value: {
                                name: user.name,
                                value: '@' + user.login
                            }
                        };
                    });
                }));
        })

        // have user choose subsets of returned users to include as testers and/or developers
        .then(function (githubMembers) {
            var configValue = config.get() || {},
                currentTesters = _.map(configValue.testers, function (item) {
                    return _.find(_.pluck(githubMembers, 'value'), {value: item.value});
                }),
                currentDevelopers = _.map(configValue.developers, function (item) {
                    return _.find(_.pluck(githubMembers, 'value'), {value: item.value});
                });

            githubMembers = _.sortBy(githubMembers, 'name');
            inquirer.prompt(
                new InquirerQuestionBuilder()
                    .withCheckboxQuestion(
                        'developers',
                        'Choose the users you wish to be available as developer reviewers:',
                        githubMembers,
                        currentDevelopers)
                    .withCheckboxQuestion(
                        'testers',
                        'Choose the users you wish to be available as testers:',
                        githubMembers,
                        currentTesters)
                    .withConfirmQuestion('confirmCreation', 'Are you sure you wish to create/update your PullQuester config?')
                    .build());
        })

        // write out files
        .then(function (answers) {
            if (answers.confirmCreation) {
                configValue.developers = answers.developers;
                if (answers.testers.length > 0) {
                    configValue.testers = answers.testers;
                }
                else {
                    delete configValue.testers;
                }
                config.set(configValue);
                template.createDefaultIfNotExists();
            }
        })

        // print any error
        .catch(function (err) {
            console.log(err);
        })
        .done();
};
