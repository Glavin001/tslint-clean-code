import { TestHelper } from './TestHelper';

/**
 * Unit tests.
 */
describe('noCommentedOutCodeRule', (): void => {
    const ruleName: string = 'no-commented-out-code';

    it('should pass on single word', (): void => {
        const script: string = `
            // lorem
        `;

        TestHelper.assertNoViolation(ruleName, script);
    });

    it('should pass on inline comment', (): void => {
        const script: string = `
            // Lorem ipsum dolor sit

            const obj = {
                foo: "bar", // Lorem ipsum dolor sit
                fooz: 42,  // Lorem ipsum dolor sit

                // Lorem ipsum dolor sit
                baz: true
            }
        `;

        TestHelper.assertNoViolation(ruleName, script);
    });

    it('should fail on commented-out code with inline comment', (): void => {
        const script: string = `
            // console.log("Lorem ipsum");
        `;

        TestHelper.assertViolations(ruleName, script, [
            noCommentedOutCodeError({
                character: 13,
                line: 2,
            }),
        ]);
    });

    it('should pass on block comments', (): void => {
        const script: string = `
            /*
                Lorem ipsum dolor sit
            */

            /* Lorem ipsum dolor sit */
        `;

        TestHelper.assertNoViolation(ruleName, script);
    });

    it('should fail on commented-out code with block comments', (): void => {
        const script: string = `
            /*
            console.log("Lorem ipsum");
            */

            /* console.log("Lorem ipsum"); */
        `;

        TestHelper.assertViolations(ruleName, script, [
            noCommentedOutCodeError({
                character: 13,
                line: 2,
            }),
            noCommentedOutCodeError({
                character: 13,
                line: 6,
            }),
        ]);
    });

    it('should pass on JSDoc-style block comment', (): void => {
        const script: string = `
            /**
             *  Lorem ipsum dolor sit
             */

            /** Lorem ipsum dolor sit */
        `;

        TestHelper.assertNoViolation(ruleName, script);
    });

    it('should pass on JSDoc with tags', (): void => {
        const script: string = `
            /**
             * @constructor
             */

            /**
             * @param {string} foo
             * @param {number} bar
             */

            /**
             * @param {string} foo
             * @return {string}
             */

            /**
             * @return {string}
             */
        `;

        TestHelper.assertNoViolation(ruleName, script);
    });

    it('should fail on commented-out code with JSDoc-style block comment', (): void => {
        const script: string = `
            /**
             * console.log("Lorem ipsum");
             */

            /** console.log("Lorem ipsum"); */
        `;

        TestHelper.assertViolations(ruleName, script, [
            noCommentedOutCodeError({
                character: 13,
                line: 2,
            }),
            noCommentedOutCodeError({
                character: 13,
                line: 6,
            }),
        ]);
    });

    it('should pass on tslint:disable comment', (): void => {
        const script: string = `
            // tslint:disable:no-reserved-keywords
        `;

        TestHelper.assertNoViolation(ruleName, script);
    });

    it('should pass on tslint:enable comment', (): void => {
        const script: string = `
            // tslint:enable:no-reserved-keywords
        `;

        TestHelper.assertNoViolation(ruleName, script);
    });

    it('should allow commenting-out code if prefixed with uppercase TODO-like note', (): void => {
        const script: string = `
            // TODO: a + b
            // NOTE: a + b
            // FIXME: a + b
            // BUG: a + b
            // HACK: a + b
            // XXX: a + b
        `;

        TestHelper.assertNoViolation(ruleName, script);
    });

    it('should validate as usual if prefixed with unexpected TODO-like note', (): void => {
        const script: string = `
            // todo: a + b
            // ToDo: a + b
            // Foo: a + b

            // TODO a + b
            // TODO() a + b
            // TODO(): a + b
            // TODO(foo) a + b
            // TODO(foo): a + b
            // TODO({foo: "bar"}) a + b
            // TODO({foo: "bar"}): a + b
        `;

        TestHelper.assertViolations(ruleName, script, [
            noCommentedOutCodeError({
                character: 13,
                line: 2,
            }),
            noCommentedOutCodeError({
                character: 13,
                line: 3,
            }),
            noCommentedOutCodeError({
                character: 13,
                line: 4,
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
