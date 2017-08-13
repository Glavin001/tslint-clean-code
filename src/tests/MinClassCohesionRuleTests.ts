import { TestHelper } from './TestHelper';

/**
 * Unit tests.
 */
const FAILURE_STRING: string = 'The cohesion of this class is too low. Consider splitting this class into multiple cohesive classes: ';
 describe('minClassCohesionRule', (): void => {
    const ruleName: string = 'min-class-cohesion';

    it('should pass on empty class', (): void => {
        const script: string = `
            class EmptyClass {
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on class with instance fields and no instance methods', (): void => {
        const script: string = `
            // classes with instance fields
            class ClassWithField {
                private field;
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on class with constructor parameters creating instance fields and no instance methods', (): void => {
        const script: string = `
            // classes with instance fields
            class ClassWithField {
                constructor(private field) {
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should fail on class without instance fields', (): void => {
        const script: string = `
            // classes without instance fields
            class ClassWithoutFields {
                private someMethod() {
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, [
            {
                "failure": FAILURE_STRING + "ClassWithoutFields",
                "name": "file.ts",
                "ruleName": "min-class-cohesion",
                "startPosition": { "character": 13, "line": 3 }
            }
        ]);
    });

    it('should pass on class with constructor parameters, instance fields, and instance method using all fields', (): void => {
        const script: string = `
            class CohesiveClass {
                constructor(private a: number) {
                }
                public b: number;
                public sum(): number {
                    return this.a + this.b;
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on class with constructor parameters, instance fields, and instance method using all fields', (): void => {
        const script: string = `
            class HalfCohesiveClass {
                constructor(private a: number) {
                }
                public b: number;
                public getA(): number {
                    return this.a;
                }
                public getB(): number {
                    return this.b;
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should fail on class with constructor parameters, instance fields, and instance method using all fields', (): void => {
        const script: string = `
            class ThirdCohesiveClass {
                constructor(private a: number) {
                }
                public b: number;
                private c: number;
                public getA(): number {
                    return this.a;
                }
                public getB(): number {
                    return this.b;
                }
                public getC(): number {
                    return this.c;
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, [
            {
                "failure": FAILURE_STRING + "ThirdCohesiveClass",
                "name": "file.ts",
                "ruleName": "min-class-cohesion",
                "startPosition": { "character": 13, "line": 2 }
            }
        ]);
    });

    it('should pass on Stack class', (): void => {
        const script: string = `
            class Stack {
                private topOfStack: number = 0;
                private elements: number[] = [];
                public size(): number {
                    return this.topOfStack;
                }
                public push(element: number): void {
                    this.topOfStack++;
                    this.elements.push(element);
                }
                public pop(): number {
                    if (this.topOfStack === 0)
                        throw new Error("PoppedWhenEmpty");
                    const element: number = this.elements[--this.topOfStack];
                    this.elements = this.elements.slice(this.topOfStack, 1);
                    return element;
                }
            }
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    context("reading options", (): void => {

        context("90% cohesion", (): void => {

            let options: any[];

            beforeEach((): void => {
                options = [true,
                    0.9
                ];
            });

            it('should fail on Stack class', (): void => {
                const script: string = `
                class Stack {
                    private topOfStack: number = 0;
                    private elements: number[] = [];
                    public size(): number {
                        return this.topOfStack;
                    }
                    public push(element: number): void {
                        this.topOfStack++;
                        this.elements.push(element);
                    }
                    public pop(): number {
                        if (this.topOfStack === 0)
                            throw new Error("PoppedWhenEmpty");
                        const element: number = this.elements[--this.topOfStack];
                        this.elements = this.elements.slice(this.topOfStack, 1);
                        return element;
                    }
                }
                `;
                TestHelper.assertViolationsWithOptions(ruleName, options, script, [
                    {
                        "failure": FAILURE_STRING + "Stack",
                        "name": "file.ts",
                        "ruleName": "min-class-cohesion",
                        "startPosition": { "character": 17, "line": 2 }
                    }
                ]);
            });

        });

        context("80% cohesion", (): void => {

            let options: any[];

            beforeEach((): void => {
                options = [true,
                    0.8
                ];
            });

            it('should pass on Stack class', (): void => {
                const script: string = `
                            class Stack {
                                private topOfStack: number = 0;
                                private elements: number[] = [];
                                public size(): number {
                                    return this.topOfStack;
                                }
                                public push(element: number): void {
                                    this.topOfStack++;
                                    this.elements.push(element);
                                }
                                public pop(): number {
                                    if (this.topOfStack === 0)
                                        throw new Error("PoppedWhenEmpty");
                                    const element: number = this.elements[--this.topOfStack];
                                    this.elements = this.elements.slice(this.topOfStack, 1);
                                    return element;
                                }
                            }
                            `;
                TestHelper.assertViolationsWithOptions(ruleName, options, script, []);
            });

        });
    });

});