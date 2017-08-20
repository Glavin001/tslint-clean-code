import { TestHelper } from './TestHelper';
import { Rule } from '../preferDryConditionalsRule';
const { FAILURE_STRING } = Rule;

/**
 * Unit tests.
 */
describe.only('noReturnPromiseMixedTypeRule', (): void => {

    const ruleName: string = 'no-return-promise-mixed-type';

    context('FunctionDeclaration', () => {

        it('should pass on function returning Promise<boolean>', (): void => {
            const inputFile : string = 'test-data/NoReturnPromiseMixedType/passingTestInput1.ts';

            TestHelper.assertViolationsWithTypeChecker(ruleName, inputFile, []);
        });

        it('should fail on function returning Promise<boolean> | boolean', (): void => {
            const inputFile : string = 'test-data/NoReturnPromiseMixedType/failingTestInput1.ts';

            TestHelper.assertViolationsWithTypeChecker(ruleName, inputFile, [
                {
                    failure: FAILURE_STRING('obj.name', ['"Stuff"', '"Other"']),
                    name: 'file.ts',
                    ruleName: ruleName,
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 9,
                        line: 2
                    }
                }
            ]);
        });

    });

});
