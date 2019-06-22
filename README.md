tslint-clean-code [![Build Status](https://travis-ci.org/Glavin001/tslint-clean-code.svg?branch=master)](https://travis-ci.org/Glavin001/tslint-clean-code) [![Build status](https://ci.appveyor.com/api/projects/status/8femxsete95is18a/branch/master?svg=true)](https://ci.appveyor.com/project/Glavin001/tslint-clean-code/branch/master)
======

> A set of [TSLint](https://github.com/palantir/tslint) rules used to enforce [Clean Code](https://www.amazon.ca/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) practices. Inspired by [Clean Code: A Handbook of Agile Software Craftsmanship](https://www.amazon.ca/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882).

:point_right: Sign up for [**CodePass**, *the Quickest Way To Solve Your Coding Errors*](https://codepass.ca/)! :boom:

## Installation

```bash
npm install tslint-clean-code
```

## Configuration

##### Configure `tslint.json`

In your `tslint.json` file, extend this package.
For example:

```json
{
  "extends": [
    "tslint-clean-code"
  ],
  "rules": {
    "newspaper-order": true
  }
}
```

You can also extend other tslint config packages to combine this plugin with other community custom rules.

##### Configure your Grunt build task

Add the new rulesDirectory to your tslint task:

    grunt.initConfig({
      tslint: {
        options: {
          rulesDirectory: 'node_modules/tslint-clean-code/dist/src',
          configuration: grunt.file.readJSON("tslint.json")
        },
        files: {
          src: ['src/file1.ts', 'src/file2.ts']
        }
      }
    })

The tslint.json file does not change format when using this package. Just add our rule definitions to your existing tslint.json file.

## Supported Rules

Rule Name   | Description | Since
:---------- | :------------ | -------------
`id-length` | Enforces a minimum and/or maximum identifier length convention. | 0.1.0
`try-catch-first` | Try-catch blocks must be first within the scope. Try-catch blocks are transactions and should leave your program in a consistent state, no matter what happens in the try. | 0.1.0
`max-func-args` | Limit the number of input arguments for a function. The ideal number of arguments for a function is zero (niladic). | 0.1.0
`min-class-cohesion` | The more variables a method manipulates the more cohesive that method is to its class. A class in which each variable is used by each method is maximally cohesive. We would like cohesion to be high. When cohesion is high, it means that the methods and variables of the class are co-dependent and hang together as a logical whole. | 0.1.0
`newspaper-order` | We would like a source file to be like a newspaper article. Detail should increase as we move downward, until at the end we find the lowest level functions and details in the source file. | 0.1.0
`no-flag-args` | Functions should only do one thing, therefore passing a boolean into a function is a bad practice. The function does one thing if the flag is true and another if the flag is false! | 0.1.0
`no-for-each-push` | Enforce using `Array.prototype.map` instead of `Array.prototype.forEach` and `Array.prototype.push`. | 0.1.0
`no-feature-envy` | A method accesses the data of another object more than its own data. | 0.1.8
`no-map-without-usage` | Ensure results of `Array.prototype.map` is either assigned to variable or returned | 0.1.0
`no-complex-conditionals` | Enforce the maximum complexity of conditional expressions. | 0.1.0
`prefer-dry-conditionals` | Don't-Repeat-Yourself in if statement conditionals, instead use Switch statements. | 0.1.0
`no-commented-out-code` | Code must not be commented out. | 0.2.0

## Development

To develop tslint-clean-code simply clone the repository, install dependencies and run grunt:

```
git clone git@github.com:Glavin001/tslint-clean-code.git --config core.autocrlf=input --config core.eol=lf
cd tslint-clean-code
npm install
grunt all
grunt create-rule --rule-name=no-something-or-other
```

## Debug code

If command fails because of file access permissions, prefix it with sudo.

```bash
npm install -g node-inspector
```

Then run:

```bash
node-debug grunt mochaTest
```

The `node-debug` command will load Node Inspector in your default browser (works in Chrome and Opera only).

Set a breakpoint somewhere in your code and resume execution. Your breakpoint should be hit.

## Thank you

Thank you to maintainers of [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib), from which this repository was forked. The initial structure was kept and new rules were added, this would not have been possible without Microsoft's awesome work!
