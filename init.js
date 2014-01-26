'use strict';

var inquirer = require('inquirer');
var _ = require('lodash');
var Q = require('q');
var config = require('./config');
var template = require('./template');

var GitHubApi = require('github');

var github = new GitHubApi({
    // required
    version: '3.0.0'
});
module.exports = function () {

    inquirer.prompt([
        {
            name: 'username',
            type: 'input',
            message: 'Input your github username to get a list of github users associated with your project:'
        },
        {
            name: 'password',
            type: 'password',
            message: 'password:'
        }
    ], function (answers) {
        github.authenticate({
            type: 'basic',
            username: answers.username,
            password: answers.password
        });

        Q.nfcall(github.user.getOrgs, {}).then(function (orgs) {
            inquirer.prompt([
                {
                    name: 'org',
                    type: 'list',
                    message: 'Choose the org you wish to view',
                    choices: _.pluck(orgs, 'login')
                }
            ], function (answers) {
                Q.nfcall(github.orgs.getMembers, {org: answers.org, per_page: 100}).then(function (users) {
                    Q.all(_.map(users, function (user) {
                        return Q.nfcall(github.user.getFrom, { user: user.login}).then(function (user) {
                            return {
                                name: user.name || user.login,
                                value: {
                                    name: user.login,
                                    value: '@' + user.login
                                }
                            };
                        });
                    })).then(function (githubMembers) {
                        var configValue = config.get() || {},
                            currentTesters  = _.map(configValue.testers, function (item) { return _.find(_.pluck(githubMembers, 'value'), item); }),
                            currentDevelopers  = _.map(configValue.developers, function (item) { return _.find(_.pluck(githubMembers, 'value'), item); });
                        console.log(currentTesters);
                        githubMembers = _.sortBy(githubMembers, 'name');
                        inquirer.prompt([
                            {
                                name: 'developers',
                                type: 'checkbox',
                                message: 'Choose the users you wish to be available as developer reviewers:',
                                choices: githubMembers,
                                default: currentDevelopers
                            },
                            {
                                name: 'testers',
                                type: 'checkbox',
                                message: 'Choose the users you wish to be available as testers:',
                                choices: githubMembers,
                                default: currentTesters
                            },
                            {
                                name: 'confirmCreation',
                                type: 'confirm',
                                message: 'Are you sure you wish to create/update your PullQuester config?'
                            }
                        ], function (answers) {
                            if (answers.confirmCreation) {
                                configValue.developers = answers.developers;
                                configValue.testers = answers.testers;
                                config.set(configValue);
                                template.createDefaultIfNotExists();
                            }
                        });
                    });
                })
                .catch(function (err) {
                    console.log(err);
                });
            });
        })
        .fail(function (err) {
            console.log(err);
        });
    });
};
