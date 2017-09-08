const inquirer = require('inquirer');

function prompt(questions) {
    return inquirer.prompt(questions);
}

module.exports = {
    prompt: prompt
};
