import {TestHelper} from './TestHelper';
import { Rule } from '../noMapWithoutAssignmentRule';
const { FAILURE_STRING } = Rule;

/**
 * Unit tests.
 */
describe('noMapWithoutAssignmentRule', () : void => {

    const ruleName : string = 'no-map-without-assignment';

    it('should pass on Array.forEach', () : void => {
        const script : string = `
        arr.forEach(item => doStuff(item));
        `;

        TestHelper.assertViolations(ruleName, script, [ ]);
    });

    it('should pass on Array.map with assignment', () : void => {
        const script : string = `
        const results = arr.map(item => doStuff(item));
        `;

        TestHelper.assertViolations(ruleName, script, [ ]);
    });

    it('should pass on Array.map with assignment to object property', () : void => {
        const script : string = `
        const obj = {
            key: arr.map(item => doStuff(item))
          };
        `;

        TestHelper.assertViolations(ruleName, script, [ ]);
    });

    it('should pass on Array.map with additional access on result', () : void => {
        const script : string = `
        arr.map(item => doStuff(item))
            .forEach();
        `;

        TestHelper.assertViolations(ruleName, script, [ ]);
    });

    it('should pass on Array.map with results returned', () : void => {
        const script : string = `
        function () {
            return arr.map(item => doStuff(item));
        }
        `;

        TestHelper.assertViolations(ruleName, script, [ ]);
    });

    it('should fail on Array.map without assignment', () : void => {
        const script : string = `
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

});
