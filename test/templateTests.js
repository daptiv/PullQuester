const sinon = require('sinon'),
    { expect } = require('chai'),
    { describe, beforeEach, afterEach, it } = require('mocha'),
    Template = require('../src/template');

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
