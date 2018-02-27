import { TestHelper } from './TestHelper';
import { Rule } from '../noForEachPushRule';
const { FAILURE_STRING } = Rule;

/**
 * Unit tests.
 */
describe('noForEachPushRule', (): void => {
    const ruleName: string = 'no-for-each-push';

    it('should pass using Array.prototype.map', (): void => {
        const script: string = `
            const arr1 = [1,2,3];
            const results = arr1.map(item => item * 2);
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should fail using Array.prototype.push nested within Array.prototype.forEach', (): void => {
        const script: string = `
            const arr1 = [1,2,3];
            const results = [];
            arr1.forEach(item => {
                const newValue = item * 2;
                results.push(newValue);
            });
        `;
        TestHelper.assertViolations(ruleName, script, [
            {
                failure: FAILURE_STRING,
                name: 'file.ts',
                ruleName: ruleName,
                ruleSeverity: 'ERROR',
                startPosition: {
                    character: 13,
                    line: 4,
                },
            },
        ]);
    });

    it('should pass using Array.prototype.push nested within Array.prototype.forEach with an If Statement', (): void => {
        const script: string = `
            const arr1 = [1,2,3];
            const results = [];
            arr1.forEach(item => {
                if (item === 2) {
                    return;
                }
                const newValue = item * 2;
                results.push(newValue);
            });
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });
});
