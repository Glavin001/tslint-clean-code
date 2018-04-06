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

    it('should pass on Array.prototype.map with assignment', (): void => {
        const script: string = `
        const results = arr.map(item => doStuff(item));
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map with assignment to an existing variable', (): void => {
        const script: string = `
        let results;
        results = arr.map(item => doStuff(item));
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map with assignment to object property', (): void => {
        const script: string = `
        const obj = {
            key: arr.map(item => doStuff(item))
          };
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map with additional access on result', (): void => {
        const script: string = `
        arr.map(item => doStuff(item))
            .forEach();
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map with results returned', (): void => {
        const script: string = `
        function () {
            return arr.map(item => doStuff(item));
        }
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map with results used in parent call', (): void => {
        const script: string = `
        doStuff(arr.map(item => doStuff(item)))
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map with spread', (): void => {
        const script: string = `
        doOtherStuff(...arr.map(item => doStuff(item)))
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map within true case of ternary/conditional expression', (): void => {
        const script: string = `
        b ? arr.map(curr => curr * 2) : [];
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map within false case of ternary/conditional expression', (): void => {
        const script: string = `
        b ? [] : arr.map(curr => curr * 2);
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map as array value', (): void => {
        const script: string = `
        const arr2 = [1, arr.map(curr => curr * 2), 3];
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map within Binary Expression after &&', (): void => {
        const script: string = `
        arr && arr.map(curr => curr * 2);
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map within Binary Expression after ||', (): void => {
        const script: string = `
        b && firstThing() || arr.map(curr => curr * 2);
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map within arrow function return shorthand', (): void => {
        const script: string = `
        this.getFiles()
            .then(files => files.map(file => path.join(this.basePath, file)))
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map within arrow function return shorthand inside a constructor', (): void => {
        const script: string = `
        new Map(
            [{ id: 0, name: 'John' }]
                .map<[number, string]>(entity => [entity.id, entity.name])
        );
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on Array.prototype.map with assignment to a property initializer', (): void => {
        const script: string = `
        class Example {
            items = [1, 2].map(item => doStuff(item));
        }`;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should fail on Array.prototype.map within arrow function block without return statement', (): void => {
        const script: string = `
        this.getFiles()
            .then(files => {
                files.map(file => path.join(this.basePath, file));
            })
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                failure: FAILURE_STRING,
                name: 'file.ts',
                ruleName: ruleName,
                ruleSeverity: 'ERROR',
                startPosition: {
                    character: 17,
                    line: 4,
                },
            },
        ]);
    });

    it('should fail on Array.prototype.map without assignment', (): void => {
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
                    line: 2,
                },
            },
        ]);
    });

    context('React', () => {
        it('should pass on JavaScript Expression within TSX', () => {
            const file: string = 'test-data/NoMapWithoutUsage/JavaScriptExpressionInReact.tsx';
            TestHelper.assertViolations(ruleName, file, []);
        });
    });
});
