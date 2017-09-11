const GitHubApi = require('github'),
    github = new GitHubApi({
        debug: false
    }),
    _ = require('lodash'),
    exec =  require('child_process').exec,
    inquirer = require('./inquirerWrapper'),
    InquirerQuestionBuilder = require('./inquirerQuestionBuilder'),
    GITHUB_REMOTE_REGEXP = /github\.com:([^\/]+)\/([^\/]+?)(\.git)? \(fetch\)$/;

function authenticate() {
    return inquirer.prompt(InquirerQuestionBuilder.GithubAuth)
        .then(answers => {
            return github.authenticate({
                type: 'basic',
                username: answers.username,
                password: answers.password
            });
        })
}

function getRemoteRepo() {
    return new Promise(resolve => {
        exec('git remote -v', function (error, stdout) {
            var remotes = stdout.toString().split('\n');

            inquirer
                .prompt([{
                    name: 'remote',
                    type: 'list',
                    message: 'Choose a remote',
                    choices: _.filter(remotes, function (remote) { return GITHUB_REMOTE_REGEXP.test(remote); })
                }])
                .then(function (answers) {
                    answers.remote.match(GITHUB_REMOTE_REGEXP);
                    resolve({
                        owner: RegExp.$1,
                        repo: RegExp.$2
                    });
                });
        });
    });
}

function getDefaultBranch(repo) {
    return github.repos.get(repo)
        .then((response) => {
            return response.data.default_branch;
        });
}

function getRepoInfo() {
    let repoInfo
    return authenticate()
        .then(getRemoteRepo)
        .then(repository => {
            repoInfo = repository;
            return getDefaultBranch(repoInfo);
        })
        .then(defaultBranch => {
            repoInfo.defaultBranch = defaultBranch;
            return repoInfo;
        })
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
    getRepoInfo: getRepoInfo
};
