import {TestHelper} from './TestHelper';

/**
 * Unit tests.
 */
describe('mochaAvoidOnlyRule', () : void => {
    const ruleName : string = 'mocha-avoid-only';

    it('should pass when only is not invoked', () : void => {
        const script : string = `
            describe('some unit test', () => {
                it('some test', () => {
                    // some test code
                });

                // these are not calls to mocha's it.only
                it.only();
                it.only('');
                it.only(() => {});
                it.only(something, () => {});
                it.only('', something);
                it.only(something, somethingElse);

                // these are not calls to mocha's describe.only
                describe.only();
                describe.only('');
                describe.only(() => {});
                describe.only(something, () => {});
                describe.only('', something);
                describe.only(something, somethingElse);

                // these are not calls to mocha's context.only
                context.only();
                context.only('');
                context.only(() => {});
                context.only(something, () => {});
                context.only('', something);
                context.only(something, somethingElse);
            });
        `;

        TestHelper.assertViolations(ruleName, script, [ ]);
    });

    it('should fail on it.only with lambda', () : void => {
        const script : string = `
            describe('some unit test', () => {
                it.only('some test', () => {
                    // some test code
                });
            });
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                "failure": "Do not commit Mocha it.only function call",
                "name": "file.ts",
                "ruleName": "mocha-avoid-only",
                "startPosition": { "character": 17, "line": 3 }
            }
        ]);
    });

    it('should fail on specify.only with lambda', () : void => {
        const script : string = `
            context('some unit test', () => {
                specify.only('some test', () => {
                    // some test code
                });
            });
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                "failure": "Do not commit Mocha specify.only function call",
                "name": "file.ts",
                "ruleName": "mocha-avoid-only",
                "startPosition": { "character": 17, "line": 3 }
            }
        ]);
    });

    it('should fail on it.only with function', () : void => {
        const script : string = `
            describe('some unit test', () => {
                it.only('some test', function() {
                    // some test code
                });
            });
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                "failure": "Do not commit Mocha it.only function call",
                "name": "file.ts",
                "ruleName": "mocha-avoid-only",
                "startPosition": { "character": 17, "line": 3 }
            }
        ]);
    });

    it('should fail on describe.only with lambda', () : void => {
        const script : string = `
            describe.only('some unit test', () => {
                // some test code
            });
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                "failure": "Do not commit Mocha describe.only function call",
                "name": "file.ts",
                "ruleName": "mocha-avoid-only",
                "startPosition": { "character": 13, "line": 2 }
            }
        ]);
    });

    it('should fail on describe.only with function', () : void => {
        const script : string = `
            describe.only('some unit test', function() {
                // some test code
            });
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                "failure": "Do not commit Mocha describe.only function call",
                "name": "file.ts",
                "ruleName": "mocha-avoid-only",
                "startPosition": { "character": 13, "line": 2 }
            }
        ]);
    });

    it('should fail on context.only with lambda', () : void => {
        const script : string = `
            context.only('some unit test', () => {
                // some test code
            });
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                "failure": "Do not commit Mocha context.only function call",
                "name": "file.ts",
                "ruleName": "mocha-avoid-only",
                "startPosition": { "character": 13, "line": 2 }
            }
        ]);
    });

    it('should fail on context.only with function', () : void => {
        const script : string = `
            context.only('some unit test', function() {
                // some test code
            });
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                "failure": "Do not commit Mocha context.only function call",
                "name": "file.ts",
                "ruleName": "mocha-avoid-only",
                "startPosition": { "character": 13, "line": 2 }
            }
        ]);
    });

});
