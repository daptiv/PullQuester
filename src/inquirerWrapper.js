const  Q = require('q'),
    inquirer = require('inquirer');

function prompt(questions) {
    var deferred = Q.defer();

    inquirer.prompt(questions, function(answers) {
        deferred.resolve(answers);
    });

    return deferred.promise;
}

module.exports = {
    prompt: prompt
};
