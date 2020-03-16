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
    parseHubIssues = require('../parseHubIssues'),
    packageVersion = require('../../package.json').version,
    configRevision = require('../constants').CONFIG_REVISION;

temp.track();

module.exports = function (id, isDraft) {
    var gitBranchPromise = Q.nfcall(exec, 'git rev-parse --abbrev-ref HEAD').catch(function (error) {
        console.log('This is not a git repo or there was an error getting the branch name', error);
    });

    var gitIssuesPromise = Q.nfcall(exec, 'hub issue').catch(function (error) {
        console.log('This is not a git repo or there was an error getting the issues', error);
    });

    var versionPromise = Q.nfcall(exec, 'npm view pullquester version').catch(function(error){
        console.log('Unable to retrieve latest version of pullquester from npm', error);
    });

    Q.all([gitBranchPromise, gitIssuesPromise, versionPromise])
        .then(function (results) {

            if (results[0] === undefined || results[1] === undefined || results[2] === undefined) {
                throw new Error('Problem getting get information');
            }

            return {
                branch: results[0][0].replace(/^\s+|\s+$/g, ''),
                issues: parseHubIssues(results[1][0]),
                version: results[2][0].trim()
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
                version = data.version,
                storyIdMatches = branchname.match(/^\d+/),
                storyId = storyIdMatches ? storyIdMatches[0] : '',
                configValue = config.get(),
                builder = new InquirerQuestionBuilder();

            if (version !== packageVersion) {
                console.log('A new version of pullquester is available: ' + version);
                console.log('Run `npm install -g pullquester` to get the latest version\n');
            }

            if (!configValue) {
                let errorMsg = 'Error: Pull not initialized';
                if (id) {
                    errorMsg += ' for id `' + id + '`';
                }
                errorMsg += '.';

                console.log(errorMsg + ' Run `pull init` to build one for your repository');
                return;
            }

            if (configValue.revision !== configRevision) {
                console.log('PullQuester configs are out of date.');
                console.log('Run `pull update` to apply updates.\n');
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
                        '-r', answers.reviewers.map(r => r.replace('@', '')).join(','),
                        '-b', answers.baseBranch,
                        '-F', pullFile.path
                    ];

                    if (isDraft) {
                        args.push('-d');
                    }

                    spawn('hub', args, { stdio: 'inherit' });
                });

        }).catch(function (error) {
            console.log('Something bad happened', error);
        });
};
