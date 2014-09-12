var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;


var template = require('../src/template');

describe('template.js Tests', function() {

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        this.sandbox.restore();
    });

    it('should create a default template', function() {
        template.createDefault();
        var defaultTemplate  = template.get();

        expect(defaultTemplate).to.not.be.undefined;
    });

    it('should return a compiled template', function() {
        var tempData = 'test';
        var compiledResult  = template.compile(tempData);

        expect(compiledResult).to.not.be.undefined;
    });

});
