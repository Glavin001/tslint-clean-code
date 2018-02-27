import { TestHelper } from './TestHelper';
import { Rule } from '../noComplexConditionalsRule';
const { FAILURE_STRING } = Rule;

/**
 * Unit tests.
 */
describe('noComplexConditionalsRule', (): void => {
    const ruleName: string = 'no-complex-conditionals';

    it('should pass on single variable as conditional expression', (): void => {
        const script: string = `
        const shouldDoStuff = (((status === 1 || status === 2 || status === 3) || isSkyBlue) && isRightDay);
        if (shouldDoStuff) {
          doStuff();
        }
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on function call as conditional expression', (): void => {
        const script: string = `
        class StuffDoer {
          doTheThing() {
            if (this.shouldDoStuff()) {
              doStuff();
            }
          }
          shouldDoStuff() {
            return (((status === 1 || status === 2 || status === 3) || isSkyBlue) && isRightDay);
          }
        }
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should fail on complex conditional expression in if statement', (): void => {
        const script: string = `
        // Test
        if (((status === 1 || status === 2 || status === 3) || isSkyBlue) && isRightDay) {
          doStuff();
        }
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                failure: FAILURE_STRING,
                name: 'file.ts',
                ruleName: ruleName,
                ruleSeverity: 'ERROR',
                startPosition: {
                    character: 13,
                    line: 3,
                },
            },
        ]);
    });
});
