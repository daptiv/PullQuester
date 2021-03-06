'use strict';

const CONFIG_REVISION = require('../constants').CONFIG_REVISION;

const inquirer = require('../inquirerWrapper'),
    _ = require('lodash'),
    Config = require('../config'),
    Template = require('../template'),
    fs = require('fs'),
    github = require('../githubWrapper'),
    InquirerQuestionBuilder = require('../inquirerQuestionBuilder');

function getOrganizationMembers() {
    return github.getOrganizations()
        .then(function(orgs) {
            var orgsToDisplay = orgs.map(o => o.login);
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
            var orgsToDisplay = orgs.map(o => o.login);

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
    let repoInfo;

    var config = Config.default;
    if (id) {
        config = new Config(Config.createPathFromId(id));
    }

    github.getRepoInfo()
        // either get the collaborators for the repo, or get the members for the organization
        .then(function(repoInformation) {
            repoInfo = repoInformation;
            var usersPromise;

            if (source === 'collab') {
                usersPromise = github.getCollaborators(repoInfo);
            } else if (source == 'team') {
                usersPromise = getTeamMembers();
            } else {
                usersPromise = getOrganizationMembers();
            }

            return usersPromise;
        })

        // fetch user data for each user
        .then(function(users) {
            return Promise.all(_.map(users, function (user) {
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
                    return _.find(_.pick(githubMembers, 'value'), {value: item.value});
                }),
                currentDevelopers = _.map(configValue.developers, function (item) {
                    return _.find(_.pick(githubMembers, 'value'), {value: item.value});
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

                configValue.revision = CONFIG_REVISION;
                configValue.defaultBaseBranch = repoInfo.defaultBranch;
                configValue.developers = answers.developers;
                if (answers.testers.length > 0) {
                    configValue.testers = answers.testers;
                }
                else {
                    delete configValue.testers;
                }
                config.set(configValue);

                Template.createDefaultIfNotExists();

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
        });
};
