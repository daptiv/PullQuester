'use strict';

const sinon = require('sinon'),
    { describe, beforeEach, afterEach, it } = require('mocha'),
    { expect } = require('chai'),
    inquirer = require('inquirer'),
    InquirerQuestionBuilder = require('../src/inquirerQuestionBuilder');

describe('inquirerQuestionBuilder.js Tests', function() {
    beforeEach(function() {
        this.inputQuestionResult = new InquirerQuestionBuilder();
        this.sandbox = sinon.sandbox.create();
        this.promptStub = this.sandbox.stub(inquirer);
    });

    afterEach(function() {
        this.sandbox.restore();
    });

    it('should return value for push withInputQuestion', function() {
        var name = 'Adam';
        var message = 'input type';
        var defaults = 'new default';
        var questions = this.inputQuestionResult
            .withInputQuestion(name, message, defaults)
            .build();

        expect(questions).to.have.length(1);
    });

    it('should return value for push withPasswordQuestion', function() {
        var name = 'Adam';
        var message = 'input type';
        var questions = this.inputQuestionResult
            .withPasswordQuestion(name, message)
            .build();

        expect(questions).to.have.length(1);
    });

    it('should return value for push withCheckboxQuestion', function() {
        var name = 'Adam';
        var message = 'input type';
        var choice = [ 'New Choice', 'second choice' ];
        var defaults = 'new default';
        var questions = this.inputQuestionResult
            .withCheckboxQuestion(name, message,choice, defaults)
            .build();

        expect(questions).to.have.length(1);
    });

    it('should return value for push withListQuestion', function() {
        var  name = 'List Question' ;
        var  message = 'test message';
        var choice = 'second choice' ;
        var questions = this.inputQuestionResult
            .withListQuestion(name, message, choice)
            .build();

        expect(questions).to.have.length(1);
    });

    it('should return value for push withConfirmQuestion', function() {
        var  name = 'Confirm Questions' ;
        var  message = 'Do you want to continue?';
        var questions = this.inputQuestionResult
            .withConfirmQuestion(name, message)
            .build();

        expect(questions).to.have.length(1);
    });

    it('should return value for push withUserDefinedQuestions', function() {
        var userquestions =[
            'how long it takes to finish?',
            'when are u planning to finish it'
        ];
        var questions = this.inputQuestionResult
            .withUserDefinedQuestions(userquestions)
            .build();

        expect(questions).to.have.length(userquestions.length);
    });


    it('should return the length of the list for multi question test and tests the type of each added question', function() {
        var  name = 'Adam';
        var  message = 'input type';
        var defaults = 'new default';
        var choice = [
            'New Choice',
            'second choice'
        ];

        var questions = this.inputQuestionResult
            .withPasswordQuestion(name, message)
            .withInputQuestion(name, message, defaults)
            .withCheckboxQuestion(name, message, choice, defaults)
            .withConfirmQuestion(name, message)
            .build();

        expect(questions).to.have.length(4);

        expect(questions[0].type).to.equal('password');
        expect(questions[1].type).to.equal('input');
        expect(questions[2].type).to.equal('checkbox');
        expect(questions[3].type).to.equal('confirm');
    });
});
