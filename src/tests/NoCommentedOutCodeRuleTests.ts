import { TestHelper } from './TestHelper';

/**
 * Unit tests.
 */
describe('noCommentedOutCodeRule', (): void => {
    const ruleName: string = 'no-commented-out-code';

    it('should pass on single word', (): void => {
        const script: string = `
            // todo
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on single line', (): void => {
        const script: string = `
            // todo: add passing example
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on long single line', (): void => {
        const script: string = `
            // todo: add failing example and update assertions
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on long single line', (): void => {
        const script: string = `
        /**
         * Implementation of the no-commented-out-code rule.
         */
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on long single line', (): void => {
        const script: string = `
        /**
        Beautifier
        */
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on tslint:disable comment', (): void => {
        const script: string = `
        // tslint:disable:no-reserved-keywords
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on tslint:enable comment', (): void => {
        const script: string = `
        // tslint:enable:no-reserved-keywords
        `;
        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on TODO-like comments', (): void => {
        const script: string = `
        // TODO: foo
        // TODO foo
        // NOTE: foo
        // Note: foo
        // XXX: foo + bar
        // xxx: foo + bar
        // FIXME(foo) bar
        // FIXME(foo): bar
        // FIXME({foo: bar})
        `;
        TestHelper.assertViolations(ruleName, script, [
            noCommentedOutCodeError({
                character: 9,
                line: 5,
            }),
            noCommentedOutCodeError({
                character: 9,
                line: 7,
            }),
            noCommentedOutCodeError({
                character: 9,
                line: 10,
            }),
        ]);
    });

    it('should pass on code with inline comments', (): void => {
        const script: string = `
        const obj = {
            ruleName: "no-commented-out-code",
            type: "maintainability", // one of: 'functionality' | 'maintainability' | 'style' | 'typescript'
            description: "... add a meaningful one line description",
            options: null,
            optionsDescription: "",
            optionExamples: [], //Remove this property if the rule has no options
            typescriptOnly: false,
            issueClass: "Non-SDL", // one of: 'SDL' | 'Non-SDL' | 'Ignored'
            issueType: "Warning", // one of: 'Error' | 'Warning'
            severity: "Low", // one of: 'Critical' | 'Important' | 'Moderate' | 'Low'
            level: "Opportunity for Excellence", // one of 'Mandatory' | 'Opportunity for Excellence'
            group: "Clarity", // one of 'Ignored' | 'Security' | 'Correctness' | 'Clarity' | 'Whitespace' | 'Configurable' | 'Deprecated'
          };
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should fail on console.log', (): void => {
        const script: string = `
            // console.log("hello world");
        `;

        TestHelper.assertViolations(ruleName, script, [
            noCommentedOutCodeError({
                character: 13,
                line: 2,
            }),
        ]);
    });
});

function noCommentedOutCodeError(startPosition: TestHelper.FailurePosition): TestHelper.ExpectedFailure {
    return {
        failure: 'No commented out code.',
        name: 'file.ts',
        ruleName: 'no-commented-out-code',
        ruleSeverity: 'ERROR',
        startPosition,
    };
}
