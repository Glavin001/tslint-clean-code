// tslint:disable no-multiline-string
import { TestHelper } from './TestHelper';
import { FAILURE_STRING } from '../noFlagArgsRule';

/**
 * Unit tests.
 */
describe('noFlagArgsRule', (): void => {
    const ruleName: string = 'no-flag-args';

    context('Anonymous Function', () => {
        it('should pass on string parameter', (): void => {
            const script: string = `
            function (arg1: string) {
            }
            `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on boolean parameter', (): void => {
            const script: string = `
            function (arg1: boolean) {
            }
            `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_STRING + 'arg1' + '\nSplit the function into two.',
                    name: 'file.ts',
                    ruleName: 'no-flag-args',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 23,
                        line: 2,
                    },
                },
            ]);
        });
    });

    context('Anonymous Function', () => {
        it('should pass on string parameter', (): void => {
            const script: string = `
            function (arg1: string) {
            }
            `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on boolean parameter', (): void => {
            const script: string = `
            function (arg1: boolean) {
            }
            `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_STRING + 'arg1' + '\nSplit the function into two.',
                    name: 'file.ts',
                    ruleName: 'no-flag-args',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 23,
                        line: 2,
                    },
                },
            ]);
        });
    });

    context('Named Function', () => {
        it('should pass on string parameter', (): void => {
            const script: string = `
            function doStuff(stuff: string) {
            }
            `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on boolean parameter', (): void => {
            const script: string = `
            function doStuff(shouldDoStuff: boolean) {
            }
            `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure:
                        FAILURE_STRING +
                        'shouldDoStuff' +
                        '\nSplit the function into two, such as doStuffWhenShouldDoStuff and doStuffWhenNotShouldDoStuff.',
                    name: 'file.ts',
                    ruleName: 'no-flag-args',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 30,
                        line: 2,
                    },
                },
            ]);
        });
    });

    context('Arrow Function', () => {
        it('should pass on string parameter', (): void => {
            const script: string = `
                    (arg1: string) => {
                    }
                    `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on boolean parameter', (): void => {
            const script: string = `
                    (arg1: boolean) => {
                    }
                    `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_STRING + 'arg1' + '\nSplit the function into two.',
                    name: 'file.ts',
                    ruleName: 'no-flag-args',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 22,
                        line: 2,
                    },
                },
            ]);
        });
    });

    context('Class Methods', () => {
        it('should pass on setter method', (): void => {
            const script: string = `
            class MyClass {
                private value: boolean;
                public set myValue(newValue: boolean) {
                    this.value = newValue;
                }
            }
            `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should pass on getter method', (): void => {
            const script: string = `
            class MyClass {
                private value: boolean;
                public get myValue() {
                    return this.value;
                }
            }
            `;
            TestHelper.assertViolations(ruleName, script, []);
        });
    });
});
