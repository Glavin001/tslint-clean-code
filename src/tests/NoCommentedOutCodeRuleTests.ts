import { TestHelper } from './TestHelper';

/**
 * Unit tests.
 */
describe('noCommentedOutCodeRule', (): void => {
    const ruleName: string = 'no-commented-out-code';

    context(
        'when inside inline comment',
        (): void => {
            it('should pass on single word', (): void => {
                const script: string = `
            // lorem
            `;

                TestHelper.assertNoViolation(ruleName, script);
            });

            it('should pass on multiple words', (): void => {
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

            it('should fail on commented-out code', (): void => {
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
        }
    );

    context(
        'when inside block comment',
        (): void => {
            it('should pass on single word', (): void => {
                const script: string = `
            /*
            lorem
            */

           /* lorem */
        `;
                TestHelper.assertNoViolation(ruleName, script);
            });

            it('should pass on multiple words', (): void => {
                const script: string = `
            /*
            Lorem ipsum dolor sit
            */

           /* Lorem ipsum dolor sit */
           `;

                TestHelper.assertNoViolation(ruleName, script);
            });

            it('should fail on commented-out code', (): void => {
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
        }
    );

    context(
        'when inside JSDoc-style block comment',
        (): void => {
            it('should pass on single word', (): void => {
                const script: string = `
            /**
             * lorem
             */

            /** lorem */
            `;
                TestHelper.assertNoViolation(ruleName, script);
            });

            it('should pass on multiple words', (): void => {
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

            it('should fail on commented-out code', (): void => {
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
        }
    );

    context(
        'when tslint comment',
        (): void => {
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
        }
    );

    context(
        'when comment contains TODO-like note',
        (): void => {
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
        }
    );
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
