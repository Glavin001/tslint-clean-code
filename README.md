tslint-clean-code [![Build Status](https://travis-ci.org/Glavin001/tslint-clean-code.svg?branch=master)](https://travis-ci.org/Glavin001/tslint-clean-code)
======

A set of [TSLint](https://github.com/palantir/tslint) rules used to enforce [Clean Code](https://www.amazon.ca/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) practices. Inspired by [Clean Code: A Handbook of Agile Software Craftsmanship](https://www.amazon.ca/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882).

Version 0.1.0 (In-Development)
-------------
The [Latest Development Version](https://github.com/Glavin001/tslint-clean-code/tree/releases) is available online.
To use the nightly build set your npm version to `git://github.com/Glavin001/tslint-clean-code.git#releases`

Installation
------------

    npm install tslint-clean-code

Configuration
-------------

##### Configure your Grunt build task

Add the new rulesDirectory to your tslint task:

    grunt.initConfig({
      tslint: {
        options: {
          rulesDirectory: 'node_modules/tslint-clean-code',
          configuration: grunt.file.readJSON("tslint.json")
        },
        files: {
          src: ['src/file1.ts', 'src/file2.ts']
        }
      }
    })

The tslint.json file does not change format when using this package. Just add our rule definitions to your existing tslint.json file.

##### Which Rules Should I Turn On?
There certainly are a lot of options! Here are some links to get you started.
* Easiest Option - Our recommended ruleset is here: [recommended_ruleset.js](recommended_ruleset.js). You can also easily extend the ruleset by adding `"extends": "tslint-microsoft-contrib"` to your configuration. Please note, the default rules require the `--type-check` and `--project` TSLint options. Also, please note that adding a rule to the recommended ruleset is considered backwards compatible. If you reply on version ranges in your dependencies then you may find that new rules being added to the product create violations and fail your build.
* A nice blog post on the MSDN secure development blog can be found here: [Automating Secure Development Lifecycle Checks in TypeScript with TSLint](https://blogs.msdn.microsoft.com/secdevblog/2016/05/11/automating-secure-development-lifecycle-checks-in-typescript-with-tslint/)
* A wiki briefly describing the SDL and related rules is here: [TSLint and the Microsoft Security Development Lifecycle](https://github.com/Microsoft/tslint-microsoft-contrib/wiki/TSLint-and-the-Microsoft-Security-Development-Lifecycle)
* And our configuration file with all options is available here: [tslint.json](tslint.json)

Supported Rules
-----

Rule Name   | Description | Since
:---------- | :------------ | -------------
`min-class-cohesion` | The more variables a method manipulates the more cohesive that method is to its class. A class in which each variable is used by each method is maximally cohesive. We would like cohesion to be high. When cohesion is high, it means that the methods and variables of the class are co-dependent and hang together as a logical whole. | 0.1.0
`newspaper-order` | We would like a source file to be like a newspaper article. Detail should increase as we move downward, until at the end we find the lowest level functions and details in the source file. | 0.1.0

Supported Formatters
-----

These formatters assume that you use the UTF-8 file encoding. They may not work if you have a different encoding, especially if your encoding uses a 2-byte line ending (such as \r\n on Windows).

Formatter Name          | Description | Since
:----------             | :------------ | -------------
`fix-no-require-imports`| This formatter automatically converts imports from the require syntax to the ES6 syntax. For example `import Utils = require('Utils');` becomes `import {Utils} from 'Utils';`. However, be warned that the fix assumes that your imported module exports the correct thing. If anything goes wrong with your exports then you'll get a compiler failure saying there is no default export. | 2.0.8
`fix-no-var-keyword`    | This formatter automatically converts var variable declarations into let variable declarations found by the no-var-keyword rule. | 2.0.8

Development
-----------

To develop tslint-microsoft-contrib simply clone the repository, install dependencies and run grunt:

    git clone git@github.com:Microsoft/tslint-microsoft-contrib.git --config core.autocrlf=input --config core.eol=lf
    cd tslint-microsoft-contrib
    npm install
    grunt all
    grunt create-rule --rule-name=no-something-or-other

Debug code
-----------
If command fails because of file access permissions, prefix it with sudo.

    npm install -g node-inspector

Then run:

    node-debug grunt mochaTest

The `node-debug` command will load Node Inspector in your default browser (works in Chrome and Opera only).

Set a breakpoint somewhere in your code and resume execution. Your breakpoint should be hit.

Creating a new Release
----------------------

Refer to the [Releases Wiki Page](https://github.com/Microsoft/tslint-microsoft-contrib/wiki/Releases)

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
