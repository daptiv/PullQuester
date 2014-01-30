PullQuester
===========

pull request tool for generating pull requests on demand via command line

Installation
============

Install hub via instructions in readme https://github.com/github/hub

```
npm install -g git+ssh://git@github.com:daptiv/PullQuester.git
```

Configuration
=============

Move to root directory of the repo you wish to add the pull request configuration to and run

```
pull --init
```

Follow the prompts to initialize the tool

Custom questions can be added by adding Inquirer question configs to the pullrequest.json config file.

https://github.com/SBoudrias/Inquirer.js

answers are added to the config in the template.

Usage
=====

Ensure your branch is pushed, and you are currently in the branch you want pulled.
Then just run `pull` and follow the promps
