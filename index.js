
'use strict';
var inquirer = require('inquirer');
var exec =  require('child_process').exec;
var config =  require('./pullrequest.json');
var fs = require('fs');
var _ = require('lodash');

fs.readFile(__dirname + '/pullrequest.tmpl', 'utf8', function (err, template) {
    if (err) {
        console.log('Error: Could not load file pullrequest template');
        return;
    }

    exec('git rev-parse --abbrev-ref HEAD', function (error, stdout) {
        if (error) {
            console.error('Cannot get branch name'.red);
        }
        var branchname = stdout.replace(/^\s+|\s+$/g, '');

        console.log('Branch name = "' + branchname + '"');

        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                default: branchname,
                message: 'What would you like your title to be',
                choices: config.developers
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
            }
        ], function (answers) {
            answers.branchname = branchname;
            console.log(answers);
            var pullrequest = _.template.process(template, {data: answers});
            pullrequest.replace('\'', '\'');
            console.log(pullrequest);
            exec('hub pull-request -m \'' + pullrequest + '\'', function (error, stdout) {
                if (error) {
                    console.error(error.red);
                }
                console.log(stdout);
            });
        });

    });
});




