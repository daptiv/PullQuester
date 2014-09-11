var Q = require('q'),
    GitHubApi = require('github'),
    github = new GitHubApi({
        // required
        version: '3.0.0'
    });

function authenticate(username, password) {
    var deferred = Q.defer();

    var options = {
        type: 'basic',
        username: username,
        password: password
    };

    github.authenticate(options);

    deferred.resolve();

    return deferred.promise
}

function getOrganizations() {
    return Q.ninvoke(github.user, 'getOrgs', {});
}

function getCollaborators(user, repository) {
    var options = {
        user: user,
        repo: repository,
        per_page: 100
    };

    return Q.ninvoke(github.repos, 'getCollaborators', options);
}

function getMembers(organization) {
    var options = {
        org: organization,
        per_page: 100
    };

    return Q.ninvoke(github.orgs, 'getMembers', options);
}

function getUser(username) {
    var options = {
        user: username
    };

    return Q.ninvoke(github.user, 'getFrom', options);
}

module.exports = {
    authenticate: authenticate,
    getOrganizations: getOrganizations,
    getCollaborators: getCollaborators,
    getMembers: getMembers,
    getUser: getUser
};