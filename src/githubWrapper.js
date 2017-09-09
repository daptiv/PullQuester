const Q = require('q'),
    GitHubApi = require('github'),
    github = new GitHubApi({
        debug: false,
        Promise: Q.Promise
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

    return deferred.promise;
}

function getOrganizations() {
    return github.users.getOrgs({})
        .then(orgs => {
            return orgs.data;
        });
}

function getCollaborators(user, repository) {
    var options = {
        owner: user,
        repo: repository,
        per_page: 100
    };

    return github.repos.getCollaborators(options)
        .then(collaborators => {
            return collaborators.data;
        });
}

function getTeams(organization) {
    var options = {
        org: organization
    };

    return github.orgs.getTeams(options)
        .then(teams => {
            return teams.data;
        });
}

function getTeamMembers(teamId) {
    var options = {
        id: teamId
    };

    return github.orgs.getTeamMembers(options)
        .then(members => {
            return members.data;
        });
}

function getMembers(organization) {
    var options = {
        org: organization,
        per_page: 100
    };

    return github.orgs.getMembers(options)
        .then(members => {
            return members.data;
        });
}

function getUser(username) {
    var options = {
        username: username
    };

    return github.users.getForUser(options)
        .then(user => {
            return user.data;
        });
}

module.exports = {
    authenticate: authenticate,
    getOrganizations: getOrganizations,
    getCollaborators: getCollaborators,
    getTeams: getTeams,
    getTeamMembers: getTeamMembers,
    getMembers: getMembers,
    getUser: getUser,
    getRepo: github.repos.get
};
