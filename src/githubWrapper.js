const GitHubApi = require('github'),
    github = new GitHubApi({
        debug: false
    }),
    _ = require('lodash'),
    exec =  require('child_process').exec,
    inquirer = require('./inquirerWrapper'),
    InquirerQuestionBuilder = require('./inquirerQuestionBuilder'),
    GITHUB_REMOTE_REGEXP = /github\.com(?::|\/)([^\/]+)\/([^\/]+?)(?:\.git)? \(fetch\)$/;

let wrapper = {
    ghApi: () => github,
};

const requires2FA = (result) => {
    const isUnauthorized = result && result.code === 401;
    if (!isUnauthorized) {
        return false;
    }
    const otpHeader = result.headers['x-github-otp'] || '';
    const otpRequired = otpHeader.split(';').shift() === 'required';
    return otpRequired;
};

const checkFor2faError = (error) => {
    if (requires2FA(error)) {
        const msg =
            'ERROR: Your account requires Two Factor Authorization.\n' +
            '       Currently PullQuester is unable to support 2FA.\n' +
            '       Instead you may authenticate using an API token.\n' +
            '       When prompted for username enter: <token>\n' +
            '       and when prompted for password, enter your API token.\n' +
            '       Tokens require at least org:read scope.';


        console.error(msg);
    }

    throw error;
};

const basicAuth = (username, password) => {
    return wrapper.ghApi().authenticate({
        type: 'basic',
        username,
        password,
    });
};

const tokenAuth = (token) => {
    return wrapper.ghApi().authenticate({
        type: 'token',
        token
    });
};

function authenticate() {
    return inquirer.prompt(InquirerQuestionBuilder.GithubAuth)
        .then(answers => {
            if (answers.username === '<token>') {
                return tokenAuth(answers.password);
            } else {
                return basicAuth(answers.username, answers.password);
            }
        });
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
    return wrapper.ghApi().repos.get(repo)
        .then((response) => {
            return response.data.default_branch;
        }, checkFor2faError);
}

function getRepoInfo() {
    let repoInfo;
    return authenticate()
        .then(getRemoteRepo)
        .then(repository => {
            repoInfo = repository;
            return getDefaultBranch(repoInfo);
        })
        .then(defaultBranch => {
            repoInfo.defaultBranch = defaultBranch;
            return repoInfo;
        });
}

function getOrganizations() {
    return wrapper.ghApi().users.getOrgs({})
        .then(orgs => {
            return orgs && orgs.data;
        }, checkFor2faError);
}

function getCollaborators(user, repository) {
    var options = {
        owner: user,
        repo: repository,
        per_page: 100
    };

    return wrapper.ghApi().repos.getCollaborators(options)
        .then(collaborators => {
            return collaborators && collaborators.data;
        }, checkFor2faError);
}

function getTeams(organization) {
    var options = {
        org: organization
    };

    return wrapper.ghApi().orgs.getTeams(options)
        .then(teams => {
            return teams && teams.data;
        }, checkFor2faError);
}

function getTeamMembers(teamId) {
    var options = {
        id: teamId
    };

    return wrapper.ghApi().orgs.getTeamMembers(options)
        .then(members => {
            return members && members.data;
        }, checkFor2faError);
}

function getMembers(organization) {
    var options = {
        org: organization,
        per_page: 100
    };

    return wrapper.ghApi().orgs.getMembers(options)
        .then(members => {
            return members && members.data;
        }, checkFor2faError);
}

function getUser(username) {
    var options = {
        username: username
    };

    return wrapper.ghApi().users.getForUser(options)
        .then(user => {
            return user && user.data;
        }, checkFor2faError);
}

wrapper.GITHUB_REMOTE_REGEXP = GITHUB_REMOTE_REGEXP;
wrapper.authenticate = authenticate;
wrapper.getOrganizations = getOrganizations;
wrapper.getCollaborators = getCollaborators;
wrapper.getTeams = getTeams;
wrapper.getTeamMembers = getTeamMembers;
wrapper.getMembers = getMembers;
wrapper.getUser = getUser;
wrapper.getRepoInfo = getRepoInfo;
wrapper.getDefaultBranch = getDefaultBranch;

module.exports = wrapper;
