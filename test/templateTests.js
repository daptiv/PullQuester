var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;


var Template = require('../src/template');

describe('template.js Tests', function() {

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        this.sandbox.restore();
    });

    it('should return a compiled template', function() {
        var tempData = 'test';
        var compiledResult  = Template.default.compile(tempData);

        expect(compiledResult).to.not.be.undefined;
    });

});
