import {TestHelper} from './TestHelper';

/**
 * Unit tests.
 */
describe('noSingleLineBlockCommentRule', () : void => {

    const ruleName : string = 'no-single-line-block-comment';

    it('should pass on multi-line block comment', () : void => {
        const script : string = `
            /**
            * This is a multiline comment.
            */
            const something = 'whatever';
        `;

        TestHelper.assertViolations(ruleName, script, [ ]);
    });

    it('should pass on tslint suppressions', () : void => {
        const script : string = `
            /* tslint:disable:function-name */
            const something = 'whatever';
            /* tslint:enable:function-name */
        `;

        TestHelper.assertViolations(ruleName, script, [ ]);
    });

    it('should fail on a trailing single line comment', () : void => {
        const script : string = `
            const something = 'whatever'; /* my comment */
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                "failure": "Replace block comment with a single-line comment",
                "name": "file.ts",
                "ruleName": "no-single-line-block-comment",
                "startPosition": { "character": 43, "line": 2 }
            }
        ]);
    });

    it('should fail on a single long block comment', () : void => {
        const script : string = `
            /* Single line */
            const something = 'whatever';
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                "failure": "Replace block comment with a single-line comment",
                "name": "file.ts",
                "ruleName": "no-single-line-block-comment",
                "startPosition": { "character": 13, "line": 2 }
            }
        ]);
    });

});