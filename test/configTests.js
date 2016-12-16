const sinon = require('sinon'),
    { expect } = require('chai'),
    { describe, beforeEach, afterEach, it } = require('mocha'),
    Config = require('../src/config');

describe('config.js Tests', function() {
    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        this.sandbox.restore();
    });

    it('should return the created path form the Id', function() {
        var Id = 'test';
        var path  = Config.createPathFromId(Id);

        expect(path).to.equal('pullrequest.' + Id + '.json');
    });

    it('should return the default path', function() {
        var config  = Config.default;

        expect(config).to.not.be.undefined;
    });
});
