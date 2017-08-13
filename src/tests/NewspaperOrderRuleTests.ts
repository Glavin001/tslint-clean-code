import { TestHelper } from './TestHelper';

/**
 * Unit tests.
 */
const FAILURE_STRING: string = 'The class does not read like a Newpaper. Please reorder the methods of the class: ';

describe('newspaperOrderRule', (): void => {
    const ruleName: string = 'newspaper-order';

    it('should pass on empty class', (): void => {
        const script: string = `
            class EmptyClass {
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on class with 1 method', (): void => {
        const script: string = `
            class SingleMethodClass {
                private onlyMethod() {
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on class with 2 unrelated method', (): void => {
        const script: string = `
            class UnrelatedMethodsClass {
                private firstMethod() {
                }
                private secondMethod() {
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should fail on incorrectly ordered class methods', (): void => {
        const script: string = `
            class BadClass {
                private secondMethod() {
                    return this.firstMethod();
                }
                private firstMethod() {
                    return true;
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, [
            {
                "failure": FAILURE_STRING + "BadClass",
                "name": "file.ts",
                "ruleName": ruleName,
                "startPosition": { "character": 13, "line": 2 }
            }
        ]);
    });

    it('should pass on correctly ordered class methods', (): void => {
        const script: string = `
            class BadClass {
                private firstMethod() {
                    return true;
                }
                private secondMethod() {
                    return this.firstMethod();
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on SubClass by ignoring calls to BaseClass methods', (): void => {
        const script: string = `
            class BaseClass {
                protected baseMethod() {
                    return true;
                }
            }
            class SubClass extends BaseClass {
                private firstMethod() {
                    return this.baseMethod();
                }
                private secondMethod() {
                    return this.firstMethod();
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, [
            // {
            //     "failure": FAILURE_STRING + "BadClass",
            //     "name": "file.ts",
            //     "ruleName": ruleName,
            //     "startPosition": { "character": 13, "line": 2 }
            // }
        ]);
    });

});