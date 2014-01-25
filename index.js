'use strict';
var inquirer = require('inquirer');
var exec =  require('child_process').exec;
var config =  require('./pullrequest.json');
var fs = require('fs');
var _ = require('lodash');

fs.readFile(process.cwd() + '/pullrequest.tmpl', 'utf8', function (err, template) {
    if (err) {
        console.log('Error: Could not load file pullrequest template, add a pullrequest template like ' +
         __dirname + '/pullrequest.tmpl to your rep');
        return;
    }

    exec('git rev-parse --abbrev-ref HEAD', function (error, stdout) {
        if (error) {
            console.log('Cannot get branch name'.red);
        }
        var branchname = stdout.replace(/^\s+|\s+$/g, '');
        var storyId = stdout.match(/^\d+/)[0];

        console.log('Branch name = "' + branchname + '"');

        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                default: branchname,
                message: 'Title:'
            },
            {
                name: 'storyId',
                type: 'input',
                default: storyId,
                message: 'StoryId:'
            },
            {
                name: 'additionalRequirements',
                type: 'checkbox',
                message: 'Select additional requirements:',
                choices: config.requirements
            },
            {
                name: 'reviewers',
                type: 'checkbox',
                message: 'Select reviewers:',
                choices: config.developers
            },
            {
                name: 'testers',
                type: 'checkbox',
                message: 'Select testers:',
                choices: config.testers
            },
            {
                name: 'description',
                type: 'input',
                default: '',
                message: 'Description of changes:'
            }
        ], function (answers) {
            answers.branchname = branchname;
            var pullrequest = _.template(template, answers);
            pullrequest.replace('\'', '\'');
            console.log(pullrequest);
            exec('hub pull-request -m \'' + pullrequest + '\'', function (error, stdout) {
                if (error) {
                    console.log('Pull success', error.red);
                }
                console.log('Pull success', stdout);
            });
        });

    });
});




