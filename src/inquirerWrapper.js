var Q = require('q'),
  inquirer = require('inquirer');

function prompt(questions) {
    console.log('prompting for questions');
    return Q.ninvoke(inquirer, 'prompt', questions);
}

module.exports = {
    prompt: prompt
};
