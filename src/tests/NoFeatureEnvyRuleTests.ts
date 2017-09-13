import { TestHelper } from './TestHelper';
// import { Rule, MethodFeature } from '../noFeatureEnvyRule';
// const { FAILURE_STRING } = Rule;

/**
 * Unit tests.
 */
describe.only('noFeatureEnvyRule', (): void => {

    const ruleName: string = 'no-feature-envy';

    it('should pass on method using this', (): void => {
        const script: string = `
        class Warehouse {
            salePrice(item) {
                return item.salePrice * this.vat;
            }
        }
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on method using super instead of this', (): void => {
        const script: string = `
        class CustomWarehouse extends BaseWarehouse {
            salePrice(item) {
                return item.salePrice * super.vat;
            }
        }
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should fail on class method which calls item more than super', (): void => {
        const script: string = `
        class CustomWarehouse extends BaseWarehouse {
            salePrice(item) {
                return (item.price - item.rebate) * super.vat;
            }
        }
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                failure: 'Method "salePrice" uses "item" more than its own class "CustomWarehouse". ' +
                'Extract or Move Method from "salePrice" into "item".',
                name: 'file.ts',
                ruleName: ruleName,
                startPosition: { character: 13, line: 3 }
            }
        ]);
    });

    it('should fail on class method which calls item more than this', (): void => {
        const script: string = `
        class Warehouse {
            salePrice(item) {
                return (item.price - item.rebate) * this.vat;
            }
        }
        `;

        TestHelper.assertViolations(ruleName, script, [
            {
                failure: 'Method "salePrice" uses "item" more than its own class "Warehouse". ' +
                'Extract or Move Method from "salePrice" into "item".',
                name: 'file.ts',
                ruleName: ruleName,
                startPosition: { character: 13, line: 3 }
            }
        ]);
    });

    it('should pass on method using chained property accesses on item', (): void => {
        const script: string = `
        class Warehouse {
            salePrice(item) {
                return item.price.sale * this.vat;
            }
        }
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

    it('should pass on method using chained property accesses on this', (): void => {
        const script: string = `
        class Warehouse {
            salePrice(item) {
                return item.salePrice * this.sale.vat;
            }
        }
        `;

        TestHelper.assertViolations(ruleName, script, []);
    });

});
