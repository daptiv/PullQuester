'use strict';

var inquirer = require('../inquirerWrapper');
var _ = require('lodash');
var Q = require('q');
var Config = require('../config');
var Template = require('../template');
var exec =  require('child_process').exec;
var fs = require('fs');

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

function getOrganizationMembers() {
    return github.getOrganizations()
        .then(function(orgs) {
            var orgsToDisplay = _.pluck(orgs, 'login');

            return inquirer.prompt(
                new InquirerQuestionBuilder()
                    .withListQuestion('org', 'Choose the org you wish to view', orgsToDisplay)
                    .build());
        })
        .then(function(answers) {
            return github.getMembers(answers.org);
        });
}

function getTeamMembers() {
    var teams;

    return github.getOrganizations()
        .then(function(orgs) {
            var orgsToDisplay = _.pluck(orgs, 'login');

            return inquirer.prompt(
                new InquirerQuestionBuilder()
                    .withListQuestion('org', 'Choose the org to get teams from', orgsToDisplay)
                    .build());
        })
        .then(function(answers) {
            return github.getTeams(answers.org);
        })
        .then(function(getTeamsResult) {
            teams = getTeamsResult;

            return inquirer.prompt(
                new InquirerQuestionBuilder()
                    .withListQuestion('team', 'Choose the team you wish to view', teams)
                    .build());
        })
        .then(function(answers) {
            var team = _.findWhere(teams, { name: answers.team });

            return github.getTeamMembers(team.id);
        });
}

module.exports = function (id, source) {
    var config = Config.default;
    if (id) {
        var configPath = Config.createPathFromId(id)
        console.log(configPath);
        config = new Config(configPath);
    }

    inquirer.prompt(InquirerQuestionBuilder.GithubAuth)

        // authenticate github api
        .then(function (answers) {
            return github.authenticate(answers.username, answers.password);
        })

        // either get the collaborators for the repo, or get the members for the organization
        .then(function() {
            var usersPromise;

            if (source === 'collab') {
                usersPromise = getCollaborators();
            } else if (source == 'team') {
                usersPromise = getTeamMembers();
            } else {
                usersPromise = getOrganizationMembers();
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
            return inquirer.prompt(
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
                fs.mkdir('.pullquester', function (err) {
                    if (err && err.code !== 'EEXIST') {
                        throw err;
                    }
                });

                var configValue = config.get() || {};

                configValue.developers = answers.developers;
                if (answers.testers.length > 0) {
                    configValue.testers = answers.testers;
                }
                else {
                    delete configValue.testers;
                }
                config.set(configValue);

                var template = Template.default;
                if (id) {
                    template = new Template(Template.createPathFromId(id));
                }

                template.set(Template.default.get());
            }
        })

        // print any error
        .catch(function (err) {
            console.log(err);
        })
        .done();
};
