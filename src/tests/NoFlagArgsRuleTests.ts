import { TestHelper } from './TestHelper';
import { FAILURE_STRING } from '../noFlagArgsRule';

/**
 * Unit tests.
 */
describe('noFlagArgsRule', (): void => {
    const ruleName: string = 'no-flag-args';

    context("Function", () => {

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
                    "failure": FAILURE_STRING + "arg1",
                    "name": "file.ts",
                    "ruleName": "no-flag-args",
                    "ruleSeverity": "ERROR",
                    "startPosition": {
                        "character": 23,
                        "line": 2
                    }
                }
            ]);
        });

    });

    context("Arrow Function", () => {

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
                    "failure": FAILURE_STRING + "arg1",
                    "name": "file.ts",
                    "ruleName": "no-flag-args",
                    "ruleSeverity": "ERROR",
                    "startPosition": {
                        "character": 22,
                        "line": 2
                    }
                }
            ]);
        });

    });

});