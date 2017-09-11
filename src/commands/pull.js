'use strict';

const inquirer = require('../inquirerWrapper'),
    spawn =  require('cross-spawn'),
    exec = require('child_process').exec,
    _ = require('lodash'),
    Q = require('q'),
    temp = require('temp'),
    fs = require('fs'),
    InquirerQuestionBuilder = require('../inquirerQuestionBuilder'),
    Config = require('../config'),
    Template = require('../template'),
    parseHubIssues = require('../parseHubIssues');

temp.track();

module.exports = function (id) {
    var gitBranchPromise = Q.nfcall(exec, 'git rev-parse --abbrev-ref HEAD').catch(function (error) {
        console.log('This is not a git repo or there was an error getting the branch name', error);
    });

    var gitIssuesPromise = Q.nfcall(exec, 'hub issue').catch(function (error) {
        console.log('This is not a git repo or there was an error getting the issues', error);
    });

    Q.all([gitBranchPromise, gitIssuesPromise])
        .then(function (results) {

            if (results[0] === undefined || results[1] === undefined) {
                throw new Error('Problem getting get information');
            }

            return {
                branch: results[0][0].replace(/^\s+|\s+$/g, ''),
                issues: parseHubIssues(results[1][0])
            };
        })
        .then(function(data) {
            var template = Template.default;
            var config = Config.default;

            if (id && id !== 'pull') {
                template = new Template(Template.createPathFromId(id));
                config = new Config(Config.createPathFromId(id));
            }

            var branchname = data.branch,
                issues = data.issues,
                storyIdMatches = branchname.match(/^\d+/),
                storyId = storyIdMatches ? storyIdMatches[0] : '',
                configValue = config.get(),
                builder = new InquirerQuestionBuilder();

            if (!configValue) {
                let errorMsg = 'Error: Pull not initialized';
                if (id) {
                    errorMsg += ' for id `' + id + '`';
                }
                errorMsg += '.';

                console.log(errorMsg + ' Run `pull init` to build one for your repository');
                return;
            }

            builder
                .withCheckboxQuestion('issues', 'Related issue(s):', issues)
                .withInputQuestion('baseBranch', 'Base branch', configValue.defaultBaseBranch || 'master')
                .withInputQuestion('title', 'Title:', branchname)
                .withInputQuestion('storyId', 'StoryId:', storyId)
                .withInputQuestion('description', 'Description of changes:', storyId);

            if (configValue.requirements) {
                builder.withCheckboxQuestion('additionalRequirements', 'Select additional requirements', configValue.requirements);
            }

            if (configValue.developers) {
                builder.withCheckboxQuestion('reviewers', 'Select reviewers:', _.sortBy(configValue.developers, 'name'));
            }

            if (configValue.testers) {
                builder.withCheckboxQuestion('testers', 'Select testers:', _.sortBy(configValue.testers, 'name'));
            }

            if (configValue.questions) {
                var questions = _.map(configValue.questions, function(question) {
                    if (question.when) {
                        var conditional = question.when;
                        question.when = function(answers) {
                            return answers[conditional];
                        };
                    }

                    return question;
                });

                builder.withUserDefinedQuestions(questions);
            }

            inquirer.prompt(builder.build())
                .then(function (answers) {
                    answers.branchname = branchname;
                    answers.buildTypeId = configValue.buildTypeId;

                    var pullrequest = template.compile(answers);
                    var pullFile = temp.openSync();

                    fs.writeSync(pullFile.fd, pullrequest);

                    process.on('exit', function() {
                        temp.cleanup();
                    });

                    var args = [
                        'pull-request',
                        '-b', answers.baseBranch,
                        '-F', pullFile.path
                    ];

                    spawn('hub', args, { stdio: 'inherit' });
                });

        }).catch(function (error) {
            console.log('Something bad happened', error);
        });
};
