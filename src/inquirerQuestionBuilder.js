'use strict';

var inquirer = require('inquirer');

var SEPARATOR = new inquirer.Separator();

function InquirerQuestionsBuilder() {
    var questions = [];

    var addQuestion = function(question) {
        questions.push(question);
    };

    this.withInputQuestion = function(name, message, defaultValue) {
        addQuestion({
            name: name,
            type: 'input',
            default: defaultValue,
            message: message
        });

        return this;
    };

    this.withPasswordQuestion = function(name, message) {
        addQuestion({
            name: name,
            type: 'password',
            message: message
        });

        return this;
    };

    this.withCheckboxQuestion = function(name, message, choices, defaultValue) {
        choices = choices.concat([SEPARATOR]);

        addQuestion({
            name: name,
            type: 'checkbox',
            message: message,
            default: defaultValue,
            choices: choices
        });

        return this;
    };

    this.withListQuestion = function(name, message, choices) {
        addQuestion({
            name: name,
            type: 'list',
            message: message,
            choices: choices
        })
    };

    this.withConfirmQuestion = function(name, message) {
        addQuestion({
            name: name,
            type: 'confirm',
            message: message
        });

        return this;
    };

    this.withUserDefinedQuestions = function(questions) {
        questions = questions.concat(questions);

        return this;
    };

    this.build = function() {
        return questions;
    };

    return this;
}

InquirerQuestionsBuilder.GithubAuth = (function() {
    var builder = new InquirerQuestionsBuilder();

    return builder
        .withInputQuestion(username, 'Input your github username to get a list of github users associated with your project:')
        .withPasswordQuestion(password, 'password:')
        .build();
})();

module.exports = InquirerQuestionsBuilder;
