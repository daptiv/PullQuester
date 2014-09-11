var Q = require('q'),
  inquirer = require('inquirer');

function prompt(questions) {
    return Q.ninvoke(inquirer, 'prompt', questions);
}

module.exports = {
    prompt: prompt
};
