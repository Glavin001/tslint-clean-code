import {TestHelper} from './TestHelper';

/**
 * Unit tests.
 */
describe('noUnnecessaryBindRule', () : void => {
    const ruleName : string = 'no-unnecessary-bind';

    describe('should pass', () : void => {
        it('should pass on function/lambda literals with multiple parameters', () : void => {
            const script : string = `
            _.bind(function() {}, this, someArg);
            (function() {}).bind(this, someArg);
            (() => {}).bind(this, someArg);
            (someReference).bind(this, someArg);
        `;

            TestHelper.assertViolations(ruleName, script, [ ]);
        });

        it('should pass on function/lambda literals with non-this parameter', () : void => {
            const script : string = `
            (function() {}).bind(context);
            (() => {}).bind(context);
            (someReference).bind(context);
        `;

            TestHelper.assertViolations(ruleName, script, [ ]);
        });

        it('should pass on underscore static invocation with no context', () : void => {
            const script : string = `
            _.forEach(list, function() {});
            _.forEach(list, () => {});
            _.forEach(list, someReference);
        `;

            TestHelper.assertViolations(ruleName, script, [ ]);
        });

        it('should pass on underscore invocation with no context', () : void => {
            const script : string = `
            _(list).collect(function() {});
            _(list).collect(() => {});
            _(list).collect(someReference);
        `;

            TestHelper.assertViolations(ruleName, script, [ ]);
        });

        it('should pass on underscore static invocation with context', () : void => {
            const script : string = `
            _.bind(function() {}, context);
            _.map(list, function() {}, context);
            _.map(list, () => {}, context);
            _.map(list, someReference, context);
        `;

            TestHelper.assertViolations(ruleName, script, [ ]);
        });

        it('should pass on underscore invocation with context', () : void => {
            const script : string = `
            _(list).map(function() {}, context);
            _(list).map(() => {}, context);
            _(list).map(someReference, context);
        `;

            TestHelper.assertViolations(ruleName, script, [ ]);
        });

        it('should pass on "this" context with non-literal function', () : void => {
            const script : string = `
            (someReference).bind(this);
            _(list).reject(someReference, this);
            _.reject(list, someReference, this);
        `;

            TestHelper.assertViolations(ruleName, script, [ ]);
        });

        it('should pass on _.sortedIndex', () : void => {
            // sortedIndex is unique because the function parameter is the 2nd in the list
            const script : string = `
            _(list).sortedIndex(value, someReference, this);
            _.sortedIndex(list, value, someReference, this);

            _(list).sortedIndex(() => {}, someReference, this);
            _.sortedIndex(function () {}, value, someReference, this);
        `;

            TestHelper.assertViolations(ruleName, script, [ ]);
        });

        it('should pass on underscore static invocation with unknown method', () : void => {
            const script : string = `
            _.not_an_underscore_function(list, function() {}, this);
            _.not_an_underscore_function(list, () => {}, this);
        `;

            TestHelper.assertViolations(ruleName, script, [ ]);
        });

        it('should pass on underscore invocation with unknown method', () : void => {
            const script : string = `
            _(list).not_an_underscore_function(function() {}, context);
            _(list).not_an_underscore_function(() => {}, context);
        `;
            TestHelper.assertViolations(ruleName, script, [ ]);
        });

    });

    describe('should fail', (): void => {
        it('should fail on binding this on function literal', () : void => {
            const script : string = `
            (function() {}).bind(this);
        `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding function literal with 'this' context. Use lambdas instead",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 13, "line": 2 }
                }
            ]);
        });

        it('should fail on binding this on lambda', () : void => {
            const script : string = `
            (() => {}).bind(this);
        `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding lambda with 'this' context. Lambdas already have 'this' bound",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 13, "line": 2 }
                }
            ]);
        });

        it('should fail on underscore static invocation with this as context and function', () : void => {
            const script : string = `
                _.map(list, function() {}, this);
            `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding function literal with 'this' context. Use lambdas instead",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2 }
                }
            ]);
        });

        it('should fail on underscore static invocation with this as context and lambda', () : void => {
            const script : string = `
                _.map(list, () => {}, this);
            `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding lambda with 'this' context. Lambdas already have 'this' bound",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2 }
                }
            ]);
        });

        it('should fail on underscore instance invocation with this as context and function', () : void => {
            const script : string = `
                _(list).forEach(function() {}, this);
            `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding function literal with 'this' context. Use lambdas instead",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2 }
                }
            ]);
        });

        it('should fail on underscore instance invocation with this as context and lambda', () : void => {
            const script : string = `
                _(list).every(() => {}, this);
            `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding lambda with 'this' context. Lambdas already have 'this' bound",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2                     }
                }
            ]);
        });

        it('fail on _.reduce - static invocation - function parameter', () : void => {
            // reduce is a special case because the 2nd parameter in the list is a value
            const script : string = `
                _.reduce(list, function () {}, memo, this);
            `;

            TestHelper.assertViolations(ruleName, script, [  {
                "failure": "Binding function literal with 'this' context. Use lambdas instead",
                "name": "file.ts",
                "ruleName": "no-unnecessary-bind",
                "startPosition": { "character": 17, "line": 2 }
            }
            ]);
        });

        it('fail on _.reduce - static invocation - lambda parameter', () : void => {
            // reduce is a special case because the 2nd parameter in the list is a value
            const script : string = `
                _.reduce(list, () => {}, memo, this);
            `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding lambda with 'this' context. Lambdas already have 'this' bound",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2 }
                }
            ]);
        });

        it('fail on _.reduce - instance invocation - function parameter', () : void => {
            // reduce is a special case because the 2nd parameter in the list is a value
            const script : string = `
                _(list).reduce(function () {}, memo, this);
            `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding function literal with 'this' context. Use lambdas instead",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2 }
                }
            ]);
        });

        it('fail on _.reduce - instance invocation - lambda parameter', () : void => {
            // reduce is a special case because the 2nd parameter in the list is a value
            const script : string = `
                _(list).reduce(() => {}, memo, this);
            `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding lambda with 'this' context. Lambdas already have 'this' bound",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2 }
                }
            ]);
        });

        it('fail on _.sortedIndex - static invocation - function literal', () : void => {
            // sortedIndex is special case because the 2nd parameter in the list is a value
            const script : string = `
                _.sortedIndex(list, value, function () {}, this);
            `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding function literal with 'this' context. Use lambdas instead",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2 }
                }
            ]);
        });

        it('fail on _.sortedIndex - static invocation - lambda', () : void => {
            // sortedIndex is special case because the 2nd parameter in the list is a value
            const script : string = `
                _.sortedIndex(list, value, () => {}, this);
            `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding lambda with 'this' context. Lambdas already have 'this' bound",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2 }
                }
            ]);
        });

        it('fail on _.sortedIndex - instance invocation - function literal', () : void => {
            // sortedIndex is special case because the 2nd parameter in the list is a value
            const script : string = `
                _(list).sortedIndex(value, function () {}, this);
            `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding function literal with 'this' context. Use lambdas instead",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2 }
                }
            ]);
        });

        it('fail on _.sortedIndex - instance invocation - lambda', () : void => {
            // sortedIndex is special case because the 2nd parameter in the list is a value
            const script : string = `
                _(list).sortedIndex(value, () => {}, this);
            `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding lambda with 'this' context. Lambdas already have 'this' bound",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2 }
                }
            ]);
        });

        it('fail on _.bind - function literal', () : void => {
            const script : string = `
                _.bind(function () {}, this);
            `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding function literal with 'this' context. Use lambdas instead",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2 }
                }
            ]);
        });

        it('fail on _.bind - lambda', () : void => {
            const script : string = `
                _.bind(() => {}, this);
            `;

            TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Binding lambda with 'this' context. Lambdas already have 'this' bound",
                    "name": "file.ts",
                    "ruleName": "no-unnecessary-bind",
                    "startPosition": { "character": 17, "line": 2 }
                }
            ]);
        });

    });

});