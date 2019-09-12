// tslint:disable max-func-body-length
import { TestHelper } from './TestHelper';
import { FAILURE_CLASS_STRING, FAILURE_FILE_STRING, FAILURE_BLOCK_STRING } from '../newspaperOrderRule';

/**
 * Unit tests.
 */
describe('newspaperOrderRule', (): void => {
    const ruleName: string = 'newspaper-order';

    context('ClassDeclaration', () => {
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

        it('should pass on class with 2 unrelated methods using an instance field', (): void => {
            const script: string = `
            class UnrelatedMethodsClass {
                private field;
                private secondMethod() {
                    return this.field * 2;
                }
                private firstMethod() {
                    return this.field;
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on incorrectly ordered class methods', (): void => {
            const script: string = `
            class BadClass {
                private secondMethod() {
                    return true;
                }
                private firstMethod() {
                    return this.secondMethod();
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_CLASS_STRING + 'BadClass' + '\n\nMethods order:\n1. x firstMethod\n2. x secondMethod',
                    name: 'file.ts',
                    ruleName: ruleName,
                    startPosition: { character: 17, line: 3 },
                },
            ]);
        });

        it('should pass on correctly ordered class methods', (): void => {
            const script: string = `
            class GoodClass {
                private firstMethod() {
                    return this.secondMethod();
                }
                private secondMethod() {
                    return true;
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should pass on correctly ordered class getter methods', (): void => {
            const script: string = `
            class GoodClass {
                private get firstMethod() {
                    return this.secondMethod;
                }
                private get secondMethod() {
                    return true;
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should pass with 3 methods (2 related, 1 independent)', (): void => {
            const script: string = `
            class GoodClass {
                private firstRelatedMethod() {
                    return this.secondRelatedMethod();
                }
                private secondRelatedMethod() {
                    return true;
                }
                private independentMethod() {
                    return true;
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should pass with 3 methods (1 independent, 2 related)', (): void => {
            const script: string = `
            class GoodClass {
                private independentMethod() {
                    return true;
                }
                private firstRelatedMethod() {
                    return this.secondRelatedMethod();
                }
                private secondRelatedMethod() {
                    return true;
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on incorrectly ordered class getter methods', (): void => {
            const script: string = `
            class BadClass {
                private get secondMethod() {
                    return true;
                }
                private get firstMethod() {
                    return this.secondMethod;
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_CLASS_STRING + 'BadClass' + '\n\nMethods order:\n1. x firstMethod\n2. x secondMethod',
                    name: 'file.ts',
                    ruleName: ruleName,
                    startPosition: { character: 17, line: 3 },
                },
            ]);
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
                    return this.secondMethod();
                }
                private secondMethod() {
                    return this.baseMethod();
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on SubClass with incorrectly ordered methods and by ignoring calls to BaseClass methods', (): void => {
            const script: string = `
            class BaseClass {
                protected baseMethod() {
                    return true;
                }
            }
            class SubClass extends BaseClass {
                private secondMethod() {
                    return this.baseMethod();
                }
                private firstMethod() {
                    return this.secondMethod();
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_CLASS_STRING + 'SubClass' + '\n\nMethods order:\n1. x firstMethod\n2. x secondMethod',
                    name: 'file.ts',
                    ruleName: ruleName,
                    startPosition: { character: 17, line: 8 },
                },
            ]);
        });

        it('should pass on class with recursive method', (): void => {
            const script: string = `
            class CountDownClass {
                private startCountDown() {
                    this.countDown(10);
                }
                private countDown(curr: number): void {
                    if (curr > 0) {
                        console.log(curr);
                        return this.countDown(curr - 1);
                    }
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on class with incorrectly ordered methods with a recursive method', (): void => {
            const script: string = `
            class CountDownClass {
                private countDown(curr: number): void {
                    if (curr > 0) {
                        console.log(curr);
                        return this.countDown(curr - 1);
                    }
                }
                private startCountDown() {
                    this.countDown(10);
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_CLASS_STRING + 'CountDownClass' + '\n\nMethods order:\n1. x startCountDown\n2. x countDown',
                    name: 'file.ts',
                    ruleName: 'newspaper-order',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 17,
                        line: 3,
                    },
                },
            ]);
        });

        it('should pass on class with correctly ordered methods and indirectly recursive methods', (): void => {
            const script: string = `
            class CountDownClass {
                private startCountDown() {
                    this.countDown(10);
                }
                private countDown(curr: number): void {
                    if (curr > 0) {
                        console.log(curr);
                        return this.step(curr);
                    }
                }
                private step(curr: number): void {
                    return this.countDown(curr - 1);
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should pass on class with correctly ordered methods and with indirectly recursive methods', (): void => {
            const script: string = `
            class CountDownClass {
                private startCountDown() {
                    this.countDown(10);
                }
                private step(curr: number): void {
                    return this.countDown(curr - 1);
                }
                private countDown(curr: number): void {
                    if (curr > 0) {
                        console.log(curr);
                        return this.step(curr);
                    }
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on class with incorrectly ordered methods and indirectly recursive methods', (): void => {
            const script: string = `
            class CountDownClass {
                private step(curr: number): void {
                    return this.countDown(curr - 1);
                }
                private countDown(curr: number): void {
                    if (curr > 0) {
                        console.log(curr);
                        return this.step(curr);
                    }
                }
                private startCountDown() {
                    this.countDown(10);
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_CLASS_STRING + 'CountDownClass' + '\n\nMethods order:\n1. x startCountDown\n2. ✓ countDown\n3. x step',
                    name: 'file.ts',
                    ruleName: 'newspaper-order',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 17,
                        line: 3,
                    },
                },
            ]);
        });

        it('should pass on SubClass by ignoring undefined constructor calls', (): void => {
            const script: string = `
            class BaseClass {
            }
            class SubClass extends BaseClass {
                private firstMethod() {
                    return this.secondMethod();
                }
                private secondMethod() {
                    return this.constructor();
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on subset of incorrectly ordered class methods', (): void => {
            const script: string = `
            class BadClass {
                private firstMethod() {
                    return this.secondMethod();
                }
                private thirdMethod() {
                    true;
                }
                private secondMethod() {
                    return this.thirdMethod();
                }
            }
        `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure:
                        FAILURE_CLASS_STRING + 'BadClass' + '\n\nMethods order:\n1. ✓ firstMethod\n2. x secondMethod\n3. x thirdMethod',
                    name: 'file.ts',
                    ruleName: ruleName,
                    startPosition: { character: 17, line: 6 },
                },
            ]);
        });
    });

    context('SourceFile', () => {
        it('should pass on correctly ordered functions', (): void => {
            const script: string = `
            function firstMethod(): number {
                return 2 + secondMethod();
            }
            function secondMethod(): number {
                return 2;
            }
            `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should pass on correctly ordered functions', (): void => {
            const script: string = `
            function firstMethod(): number {
                return 1 + thirdMethod();
            }
            function secondMethod(): number {
                return 2 + thirdMethod();
            }
            function thirdMethod(): number {
                return 2;
            }
            `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should pass on correctly ordered functions', (): void => {
            const script: string = `
            function secondMethod(): number {
                return 2 + thirdMethod();
            }
            function firstMethod(): number {
                return 1 + thirdMethod();
            }
            function thirdMethod(): number {
                return 2;
            }
            `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should pass with 3 functions (2 related, 1 independent)', (): void => {
            const script: string = `
            function firstRelatedMethod() {
                return secondRelatedMethod();
            }
            function secondRelatedMethod() {
                return true;
            }
            function independentMethod() {
                return true;
            }
            `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should pass with 3 functions (1 independent, 2 related)', (): void => {
            const script: string = `
            function independentMethod() {
                return true;
            }
            function firstRelatedMethod() {
                return secondRelatedMethod();
            }
            function secondRelatedMethod() {
                return true;
            }
            `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should pass with 5 functions (3 independent, 2 related)', (): void => {
            const script: string = `
            function independentMethod1() {
                return true;
            }
            function relatedMethod1() {
                return relatedMethod2();
            }
            function independentMethod2() {
                return true;
            }
            function relatedMethod2() {
                return true;
            }
            function independentMethod3() {
                return true;
            }
        `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should pass with 5 functions (4 independent, 3 related)', (): void => {
            const script: string = `
            function independentMethod1() {
                return true;
            }
            function relatedMethod1() {
                return relatedMethod2();
            }
            function independentMethod2() {
                return true;
            }
            function relatedMethod2() {
                return true;
            }
            function independentMethod3() {
                return true;
            }
            function relatedMethod3() {
                return true;
            }
            function independentMethod4() {
                return true;
            }
        `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on incorrectly ordered functions', (): void => {
            const script: string = `
            function secondMethod(): number {
                return 2;
            }
            function firstMethod(): number {
                return 2 + secondMethod();
            }
            `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_FILE_STRING + 'file.ts' + '\n\nMethods order:\n1. x firstMethod\n2. x secondMethod',
                    name: 'file.ts',
                    ruleName: 'newspaper-order',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 13,
                        line: 2,
                    },
                },
            ]);
        });

        it('should fail on subset of incorrectly ordered functions', (): void => {
            const script: string = `
            function firstMethod(): number {
                return 1 + secondMethod();
            }
            function thirdMethod(): number {
                return 3;
            }
            function secondMethod(): number {
                return thirdMethod();
            }
            `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_FILE_STRING + 'file.ts' + '\n\nMethods order:\n1. ✓ firstMethod\n2. x secondMethod\n3. x thirdMethod',
                    name: 'file.ts',
                    ruleName: 'newspaper-order',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 13,
                        line: 5,
                    },
                },
            ]);
        });

        it('should pass on correctly ordered functions with a function passed as an argument', (): void => {
            const script: string = `
            function first(): Promise<number> {
                return Promise.resolve(2)
                    .then(second);
            }
            function second(n: number) {
                return third() * n;
            }
            function third(): number {
                return 2;
            }`;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on incorrrectly ordered functions with a function as a variable', (): void => {
            const script: string = `
            const myFunc3 = function() {
                return "Hello";
            }
            function myFunc2() {
                return "World";
            }
            function myFunc1() {
                return myFunc2() + " " + myFunc3();
            }
            `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_FILE_STRING + 'file.ts' + '\n\nMethods order:\n1. x myFunc1\n2. x myFunc2\n3. ✓ myFunc3',
                    name: 'file.ts',
                    ruleName: 'newspaper-order',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 13,
                        line: 5,
                    },
                },
            ]);
        });
    });

    context('Block', () => {
        it('should pass on correctly ordered functions within named function', (): void => {
            const script: string = `
                    function doStuff() {
                        function firstMethod(): number {
                            return 2 + secondMethod();
                        }
                        function secondMethod(): number {
                            return 2;
                        }
                    }
                    `;
            TestHelper.assertViolations(ruleName, script, []);
        });

        it('should fail on incorrectly ordered functions within named function', (): void => {
            const script: string = `
                    function doStuff() {
                        function secondMethod(): number {
                            return 2;
                        }
                        function firstMethod(): number {
                            return 2 + secondMethod();
                        }
                    }
                    `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_BLOCK_STRING + 'doStuff' + '\n\nMethods order:\n1. x firstMethod\n2. x secondMethod',
                    name: 'file.ts',
                    ruleName: 'newspaper-order',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 25,
                        line: 3,
                    },
                },
            ]);
        });

        it('should fail on incorrectly ordered functions within anonymous function', (): void => {
            const script: string = `
                    function () {
                        function secondMethod(): number {
                            return 2;
                        }
                        function firstMethod(): number {
                            return 2 + secondMethod();
                        }
                    }
                    `;
            TestHelper.assertViolations(ruleName, script, [
                {
                    failure: FAILURE_BLOCK_STRING + '<anonymous>' + '\n\nMethods order:\n1. x firstMethod\n2. x secondMethod',
                    name: 'file.ts',
                    ruleName: 'newspaper-order',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 25,
                        line: 3,
                    },
                },
            ]);
        });
    });
});
