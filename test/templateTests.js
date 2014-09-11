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

    it('should return a compiled template', function() {
        var templateFile = '??';

        var result = template.create(templateFilePath)

        expect(result).to.equal();
    });

});