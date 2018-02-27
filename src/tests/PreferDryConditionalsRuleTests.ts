import { TestHelper } from './TestHelper';
import { Rule } from '../preferDryConditionalsRule';
const { FAILURE_STRING } = Rule;

/**
 * Unit tests.
 */
describe('preferDryConditionalsRule', (): void => {
    const ruleName: string = 'prefer-dry-conditionals';

    it('should pass on switch statement', (): void => {
        const script: string = `
        switch (obj.name) {
            case "Stuff":
              doStuff();
              break;
            case "Other":
              doOtherStuff();
              break;
            default:
              doFallback();
          }
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on if statements with different operator', (): void => {
        const script: string = `
        if (obj.name === "Stuff") {
            doStuff();
          } else if (obj.name !== "Other") {
            doOtherStuff();
          } else {
            doFallback();
          }
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on single if statement', (): void => {
        const script: string = `
        if (obj.name === "Stuff") {
            doStuff();
        } else {
            doFallback();
        }
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on if statement which is not equality', (): void => {
        const script: string = `
        if (obj.name === 1) {
            doStuff();
          } else if (obj.name >= 4) {
            doOtherStuff();
          } else {
            doFallback();
          }
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should fail on multiple if statements with same left side', (): void => {
        const script: string = `
        if (obj.name === "Stuff") {
            doStuff();
          } else if (obj.name === "Other") {
            doOtherStuff();
          } else {
            doFallback();
          }
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                failure: FAILURE_STRING('obj.name', ['"Stuff"', '"Other"']),
                name: 'file.ts',
                ruleName: ruleName,
                ruleSeverity: 'ERROR',
                startPosition: {
                    character: 9,
                    line: 2,
                },
            },
        ]);
    });

    it('should fail on multiple if statements with same right side', (): void => {
        const script: string = `
        if ("Stuff" === obj.name) {
            doStuff();
          } else if ("Other" === obj.name) {
            doOtherStuff();
          } else {
            doFallback();
          }
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                failure: FAILURE_STRING('obj.name', ['"Stuff"', '"Other"']),
                name: 'file.ts',
                ruleName: ruleName,
                ruleSeverity: 'ERROR',
                startPosition: {
                    character: 9,
                    line: 2,
                },
            },
        ]);
    });

    it('should fail on multiple if statements with same string on right side', (): void => {
        const script: string = `
          if (obj.a === "Stuff") {
            doStuff();
          } else if (obj.b === "Stuff") {
            doOtherStuff();
          } else {
            doFallback();
          }
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                failure: FAILURE_STRING('"Stuff"', ['obj.a', 'obj.b']),
                name: 'file.ts',
                ruleName: ruleName,
                ruleSeverity: 'ERROR',
                startPosition: {
                    character: 11,
                    line: 2,
                },
            },
        ]);
    });

    context('options', () => {
        let options: any[] = [true];

        context('threshold = 3', () => {
            beforeEach(() => {
                options = [true, 3];
            });

            it('should pass on 2 if statements with same string on right side', (): void => {
                const script: string = `
                if (obj.a === "Stuff") {
                    doStuff();
                } else if (obj.b === "Stuff") {
                    doOtherStuff();
                } else {
                    doFallback();
                }
                `;

                TestHelper.assertViolationsWithOptions(ruleName, options, script, []);
            });

            it('should fail on 3 if statements with same right side', (): void => {
                const script: string = `
                  if ("Stuff" === obj.name) {
                    doStuff();
                  } else if ("Other" === obj.name) {
                    doOtherStuff();
                  } else if ("Another" === obj.name) {
                    doOtherStuff();
                  } else {
                    doFallback();
                  }
                `;

                TestHelper.assertViolations(ruleName, script, [
                    {
                        failure: FAILURE_STRING('obj.name', ['"Stuff"', '"Other"', '"Another"']),
                        name: 'file.ts',
                        ruleName: ruleName,
                        ruleSeverity: 'ERROR',
                        startPosition: {
                            character: 19,
                            line: 2,
                        },
                    },
                ]);
            });
        });
    });
});
