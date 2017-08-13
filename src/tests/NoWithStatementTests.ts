import {TestHelper} from './TestHelper';

/**
 * Unit tests.
 */

describe('noWithStatementsRule', () : void => {
    it('should produce violations', () : void => {
        const ruleName : string = 'no-with-statement';
        const script : string = `
            with ({}) {
                a = 1;
                b = 2;
            }
        `;
        TestHelper.assertViolations(ruleName, script, [
                {
                    "failure": "Forbidden with statement",
                    "name": "file.ts",
                    "ruleName": "no-with-statement",
                    "startPosition": { "character": 13, "line": 2 }
                }
            ]);
    });
});