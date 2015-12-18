'use strict';
var inquirer = require('../inquirerWrapper');
var spawn =  require('cross-spawn');
var exec = require('child_process').execSync;
var _ = require('lodash');
var Q = require('q');
var temp = require('temp');
var fs = require('fs');
temp.track();

var InquirerQuestionBuilder = require('../inquirerQuestionBuilder');

var Config = require('../config');
var Template = require('../template');

module.exports = function (id) {
            var refOut = exec('git rev-parse --abbrev-ref HEAD').toString();
            var issuesOut = exec('hub issue').toString();
            var template = Template.default;
            var config = Config.default;

            if (id) {
                template = new Template(Template.createPathFromId(id));
                config = new Config(Config.createPathFromId(id));
            }

            var issues = _.filter(issuesOut.split('\n').sort(), function(issue) { return issue && issue.trim().length > 0; });
            var branchname = refOut.replace(/^\s+|\s+$/g, ''),
                storyIdMatches = branchname.match(/^\d+/),
                storyId = storyIdMatches ? storyIdMatches[0] : '',
                configValue = config.get(),
                builder = new InquirerQuestionBuilder();

            builder
                .withListQuestion('issues', 'Selected any related issues:', issues)
                .withInputQuestion('baseBranch', 'Base branch', 'master')
                .withInputQuestion('title', 'Title:', branchname)
                .withInputQuestion('storyId', 'StoryId:', storyId)
                .withInputQuestion('description', 'Description of changes:', storyId);

            if (!configValue) {
                console.log('Error: Pull not initialized pull --init to build one for your repository');
                return;
            }

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
        //
        // }).catch(function (error) {
        //     console.log('Something bad happened', error);
        // });
};
