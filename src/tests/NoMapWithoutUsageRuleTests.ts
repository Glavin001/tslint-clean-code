import { TestHelper } from './TestHelper';
import { Rule } from '../noMapWithoutUsageRule';
const { FAILURE_STRING } = Rule;

/**
 * Unit tests.
 */
describe('noMapWithoutUsageRule', (): void => {

    const ruleName: string = 'no-map-without-usage';

    it('should pass on Array.forEach', (): void => {
        const script: string = `
        arr.forEach(item => doStuff(item));
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.map with assignment', (): void => {
        const script: string = `
        const results = arr.map(item => doStuff(item));
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.map with assignment to an existing variable', (): void => {
        const script: string = `
        let results;
        results = arr.map(item => doStuff(item));
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.map with assignment to object property', (): void => {
        const script: string = `
        const obj = {
            key: arr.map(item => doStuff(item))
          };
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.map with additional access on result', (): void => {
        const script: string = `
        arr.map(item => doStuff(item))
            .forEach();
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.map with results returned', (): void => {
        const script: string = `
        function () {
            return arr.map(item => doStuff(item));
        }
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.map with results used in parent call', (): void => {
        const script: string = `
        doStuff(arr.map(item => doStuff(item)))
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.map with spread', (): void => {
        const script: string = `
        doOtherStuff(...arr.map(item => doStuff(item)))
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.map within true case of ternary/conditional expression', (): void => {
        const script: string = `
        b ? arr.map(curr => curr * 2) : [];
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.map within false case of ternary/conditional expression', (): void => {
        const script: string = `
        b ? [] : arr.map(curr => curr * 2);
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.map as array value', (): void => {
        const script: string = `
        const arr2 = [1, arr.map(curr => curr * 2), 3];
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should fail on Array.map without assignment', (): void => {
        const script: string = `
        arr.map(item => doStuff(item));
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                failure: FAILURE_STRING,
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

    context('React', () => {
        it('should pass on JavaScript Expression within TSX', () => {
            const file: string = 'test-data/NoMapWithoutUsage/JavaScriptExpressionInReact.tsx';
            TestHelper.assertViolations(ruleName, file, []);
        });
    });

});