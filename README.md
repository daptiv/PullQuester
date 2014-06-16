PullQuester
===========

pull request tool for generating pull requests on demand via command line

Installation
============

Install hub via instructions in readme https://github.com/github/hub

```
npm install -g pullquester
```

Configuration
=============

Ensure that hub is installed and you have provided credentials to it. Hub will ask for credentials the first time it needs them.  http://hub.github.com

In order to get hub to ask you for credentials run the following

```
hub pull-request
```


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
