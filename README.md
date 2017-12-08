[![Build Status](https://travis-ci.org/daptiv/PullQuester.svg?branch=travis)](https://travis-ci.org/daptiv/PullQuester)
[![Dependency Status](https://david-dm.org/daptiv/pullquester.svg)](https://david-dm.org/daptiv/pullquester)

PullQuester
===========

pull request tool for generating pull requests on demand via command line

Installation
============

Install hub via instructions in readme https://github.com/github/hub

```
npm install -g pullquester
```

Ensure that hub is installed and you have provided credentials to it. Hub will
ask for credentials the first time it needs them.  http://hub.github.com

In order to get hub to ask you for credentials run the following

```
hub pull-request
```


Configuration
=============

Move to root directory of the repo you wish to add the pull request configuration
to and run

```
pull init
```

Follow the prompts to initialize the tool

**NOTE:** When providing credentials, if you have Two-Factor Auth enabled, authentication will fail. You may optionally provide the special username `<token>` which will change the auth type to `token`. This will expect your password to be a GitHub API token with at least `org:read` scope enabled.

Custom questions can be added by adding Inquirer question configs to the
pullrequest.json config file.

https://github.com/SBoudrias/Inquirer.js

answers are added to the config in the template.

Usage
=====

From command line, simply run `pull` or `pull [subcommand]`.

Ensure your branch is pushed, and you are currently in the branch you want
pulled. Then just run `pull` and follow the promps.

Command Information
=====================

### `pull [team]`

Create a pull request for the current branch. Branch must not have any pending changes and must be pushed up to the remote.

Arguments:

- team (optional) - Identifier for team configuration to use instead of default configuration. May not contain spaces.

Examples:

- `pull` - Starts prompts to create a pull request for the current branch. Uses default configuration.
- `pull myteam` - Starts prompts to create a pull request for the current branch using team configuration for `myteam` instead of default configuration.

### `pull init [team]`

Create or update pullquester configuration. A `team` may be specified to allow per-team configuration.

Arguments:

- team (optional) - Identifier used to create/update team configuration vs default configuration. May not contain spaces.

Examples:

- `pull init` - creates/updates default pullquester configuration for the current repository.
- `pull init myteam` - creates/updates pullquester configuration for team `myteam`

### `pull update`

Updates the pullquester config files if required.

### `pull install`

Runs an installer script to install the `hub` command on your system.
