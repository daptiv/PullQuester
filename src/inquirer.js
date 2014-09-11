var Q = require('q'),
    inquirer = require('inquirer'),
    github = new GitHubApi({
        // required
        version: '3.0.0'
    });

function promt(username, password) {
    var options = {
        type: 'basic',
        username: username,
        password: password
    };

    return Q.ninvoke(github, 'authenticate', options);
}



module.exports = {
    prompt: authenticate
};
