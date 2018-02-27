import { TestHelper } from './TestHelper';
import { FAILURE_STRING, FAILURE_RECOMMENDATION_STRING, DEFAULT_MAX_ARGS_LENGTH } from '../maxFuncArgsRule';

/**
 * Unit tests.
 */
describe('maxFuncArgsRule', (): void => {
    const ruleName: string = 'max-func-args';

    context('Anonymous Function', () => {
        const maxLength = DEFAULT_MAX_ARGS_LENGTH;

        it('should pass on function with 0 arguments', (): void => {
            const script: string = `
                    function () {
                    }
                    `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on function with 5 arguments', (): void => {
            const script: string = `
                    function (a1, a2, a3, a4, a5) {
                    }
                    `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_STRING + maxLength + FAILURE_RECOMMENDATION_STRING,
                    name: 'file.ts',
                    ruleName: 'max-func-args',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 31,
                        line: 2,
                    },
                },
            ]);
        });
    });

    context('Arrow Function', () => {
        const maxLength = DEFAULT_MAX_ARGS_LENGTH;

        it('should pass on function with 0 arguments', (): void => {
            const script: string = `
                            () => {
                            }
                            `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on function with 5 arguments', (): void => {
            const script: string = `
                            (a1, a2, a3, a4, a5) => {
                            }
                            `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_STRING + maxLength + FAILURE_RECOMMENDATION_STRING,
                    name: 'file.ts',
                    ruleName: 'max-func-args',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 30,
                        line: 2,
                    },
                },
            ]);
        });
    });

    context('Class method', () => {
        const maxLength = DEFAULT_MAX_ARGS_LENGTH;

        it('should pass on function with 0 arguments', (): void => {
            const script: string = `
            class MyClass {
                private myFunc(): string {
                  // ...
                }
              }
            `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on function with 5 arguments', (): void => {
            const script: string = `
            class MyClass {
                private myFunc(
                  arg1: Date | string | void, arg2: boolean,
                  arg3?: Date | string | void, arg4?: boolean,
                  arg5: string = "en"
                ): string {
                  // ...
                }
              }
            `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_STRING + maxLength + FAILURE_RECOMMENDATION_STRING,
                    name: 'file.ts',
                    ruleName: 'max-func-args',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 32,
                        line: 3,
                    },
                },
            ]);
        });
    });
});
