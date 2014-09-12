'use strict';
var inquirer = require('../inquirerWrapper');
var exec =  require('child_process').exec;
var spawn =  require('child_process').spawn;
var _ = require('lodash');
var Q = require('q');
var temp = require('temp');
var fs = require('fs');
temp.track();

var InquirerQuestionBuilder = require('../inquirerQuestionBuilder');

var Config = require('../config');
var Template = require('../template');

module.exports = function (id) {
    var gitBranchPromise = Q.nfcall(exec, 'git rev-parse --abbrev-ref HEAD').catch(function (error) {
        console.log('This is not a git repo or there was an error getting the branch name', error);
    });

    Q.all(gitBranchPromise)
        .then(function (results) {

            var branchname = results[0].replace(/^\s+|\s+$/g, ''),
                storyIdMatches = branchname.match(/^\d+/),
                storyId = storyIdMatches ? storyIdMatches[0] : '',
                template = new Template(Template.createPathFromId(id)),
                config = new Config(Config.createPathFromId(id)),
                configValue = config.get(),
                builder = new InquirerQuestionBuilder();

            builder.withInputQuestion('title', 'Title:', branchname)
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

                    var request = 'hub pull-request -F ' + pullFile.path;
                    console.log(request);
                    var env = process.env;
                    env.REQUEST = pullrequest;

                    process.on('exit', function() {
                        temp.cleanup();
                    });

                    spawn('hub', ['pull-request', '-F', pullFile.path], { stdio: 'inherit' });
                });

        });
};
