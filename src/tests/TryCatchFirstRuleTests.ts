import { TestHelper } from './TestHelper';
import { FAILURE_STRING } from '../tryCatchFirstRule';

/**
 * Unit tests.
 */
describe('tryCatchFirstRule', (): void => {
    const ruleName: string = 'try-catch-first';

    it('should pass on with try-catch being top-level of SourceFile', (): void => {
        const script: string = `
            try {
            } catch (error) {
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on with try-catch being top-level of FunctionDeclaration', (): void => {
        const script: string = `
            function () {
                try {
                } catch (error) {
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on with try-catch being top-level of ArrowFunction', (): void => {
        const script: string = `
            () => {
                try {
                } catch (error) {
                }
            }
            `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on with try-catch being top-level of MethodDeclaration', (): void => {
        const script: string = `
            class MyClass {
                doStuff() {
                    try {
                    } catch (error) {
                    }
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on with try-catch being top-level of GetAccessor', (): void => {
        const script: string = `
            class MyClass {
                get stuff() {
                    try {
                    } catch (error) {
                    }
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on with try-catch being top-level of SetAccessor', (): void => {
        const script: string = `
            class MyClass {
                set stuff() {
                    try {
                    } catch (error) {
                    }
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should fail on with try-catch not being top-level of FunctionDeclaration', (): void => {
        const script: string = `
            function () {
                if (true) {
                    try {
                    } catch (error) {
                    }
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, [
            {
                failure: FAILURE_STRING,
                name: 'file.ts',
                ruleName: 'try-catch-first',
                ruleSeverity: 'ERROR',
                startPosition: {
                    character: 21,
                    line: 4,
                },
            },
        ]);
    });

    it('should fail on with try-catch not being top-level of named FunctionDeclaration', (): void => {
        const script: string = `
            function funName() {
                if (true) {
                    try {
                    } catch (error) {
                    }
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, [
            {
                failure: FAILURE_STRING,
                name: 'file.ts',
                ruleName: 'try-catch-first',
                ruleSeverity: 'ERROR',
                startPosition: {
                    character: 21,
                    line: 4,
                },
            },
        ]);
    });
});
