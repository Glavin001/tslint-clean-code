// tslint:disable max-func-body-length
import { TestHelper } from './TestHelper';
import * as stripIndent from 'strip-indent';

/**
 * Unit tests.
 */
describe('noFeatureEnvyRule', (): void => {
    const ruleName: string = 'no-feature-envy';

    context('when default options', () => {
        context('when using this', () => {
            it('should pass on method using this', (): void => {
                const script: string = `
                class Warehouse {
                    salePrice(item) {
                        return item.salePrice * this.vat;
                    }
                }
                `;

                TestHelper.assertViolations(ruleName, stripIndent(script), []);
            });

            it('should fail on class method which calls item more than this', (): void => {
                const script: string = `
                class Warehouse {
                    salePrice(item) {
                        return (item.price - item.rebate) * this.vat;
                    }
                }
                `;

                TestHelper.assertViolations(ruleName, stripIndent(script), [
                    {
                        failure:
                            'Method "salePrice" uses "item" more than its own class "Warehouse". ' +
                            'Extract or Move Method from "salePrice" into "item".',
                        name: 'file.ts',
                        ruleName: ruleName,
                        startPosition: { character: 5, line: 3 },
                    },
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

                TestHelper.assertViolations(ruleName, stripIndent(script), []);
            });

            it('should pass on method using chained property accesses on this', (): void => {
                const script: string = `
                class Warehouse {
                    salePrice(item) {
                        return item.salePrice * this.sale.vat;
                    }
                }
                `;

                TestHelper.assertViolations(ruleName, stripIndent(script), []);
            });

            context('when multiple instances of feature envy', () => {
                it('should fail on class method with the highest feature envy', (): void => {
                    const script: string = `
                    class SocialNetwork {
                        connectMessage(person1, person2) {
                            const person1Name = \`\${person1.firstName} \${person1.lastName}\`;
                            const person2Name = \`\${person2.firstName} \${person2.lastName}\`;
                            return \`\${person1Name} just met \${person2Name}\`;
                        }
                    }
                    `;

                    TestHelper.assertViolations(ruleName, stripIndent(script), [
                        {
                            failure:
                                'Method "connectMessage" uses "person1" more than its own class "SocialNetwork". ' +
                                'Extract or Move Method from "connectMessage" into "person1".',
                            name: 'file.ts',
                            ruleName: ruleName,
                            startPosition: { character: 5, line: 3 },
                        },
                    ]);
                });
            });
        });

        context('when using super', () => {
            it('should pass on method using super instead of this', (): void => {
                const script: string = `
                class CustomWarehouse extends BaseWarehouse {
                    salePrice(item) {
                        return item.salePrice * super.vat;
                    }
                }
                `;

                TestHelper.assertViolations(ruleName, stripIndent(script), []);
            });

            it('should fail on class method which calls item more than super', (): void => {
                const script: string = `
                class CustomWarehouse extends BaseWarehouse {
                    salePrice(item) {
                        return (item.price - item.rebate) * super.vat;
                    }
                }
                `;

                TestHelper.assertViolations(ruleName, stripIndent(script), [
                    {
                        failure:
                            'Method "salePrice" uses "item" more than its own class "CustomWarehouse". ' +
                            'Extract or Move Method from "salePrice" into "item".',
                        name: 'file.ts',
                        ruleName: ruleName,
                        startPosition: { character: 5, line: 3 },
                    },
                ]);
            });
        });

        context('when using static properties / methods', () => {
            it('should pass on method using static properties instead of this', (): void => {
                const script: string = `
                class CustomWarehouse {
                    private static readonly vat: number = 1.2;
                    salePrice(item) {
                        return item.salePrice * CustomWarehouse.vat;
                    }
                }
                `;

                TestHelper.assertViolations(ruleName, stripIndent(script), []);
            });

            it('should pass on method using static methods instead of this', (): void => {
                const script: string = `
                class CustomWarehouse {
                    private static getVat() { return 1.2; }
                    salePrice(item) {
                        return item.salePrice * CustomWarehouse.getVat();
                    }
                }
                `;

                TestHelper.assertViolations(ruleName, stripIndent(script), []);
            });

            it('should fail on class method which calls item more than static properties', (): void => {
                const script: string = `
                class CustomWarehouse {
                    private static readonly vat: number = 1.2;
                    salePrice(item) {
                        return (item.price - item.rebate) * CustomWarehouse.vat;
                    }
                }
                `;

                TestHelper.assertViolations(ruleName, stripIndent(script), [
                    {
                        failure:
                            'Method "salePrice" uses "item" more than its own class "CustomWarehouse". ' +
                            'Extract or Move Method from "salePrice" into "item".',
                        name: 'file.ts',
                        ruleName: ruleName,
                        startPosition: { character: 5, line: 4 },
                    },
                ]);
            });

            it('should fail on class method which calls item more than static methods', (): void => {
                const script: string = `
                class CustomWarehouse {
                    private static getVat() { return 1.2; }
                    salePrice(item) {
                        return (item.price - item.rebate) * CustomWarehouse.getVat();
                    }
                }
                `;

                TestHelper.assertViolations(ruleName, stripIndent(script), [
                    {
                        failure:
                            'Method "salePrice" uses "item" more than its own class "CustomWarehouse". ' +
                            'Extract or Move Method from "salePrice" into "item".',
                        name: 'file.ts',
                        ruleName: ruleName,
                        startPosition: { character: 5, line: 4 },
                    },
                ]);
            });
        });
    });

    context('when threshold option changed', () => {
        it('should pass on class method which calls item more than this within the threshold', (): void => {
            const options = [1];
            const script: string = `
            class Warehouse {
                salePrice(item) {
                    return (item.price - item.rebate) * this.vat;
                }
            }
            `;
            TestHelper.assertViolationsWithOptions(ruleName, options, stripIndent(script), []);
        });
    });

    context('when exclude option changed', () => {
        it('should pass on class method which calls excluded item more than this', (): void => {
            const options = [['item']];
            const script: string = `
            class Warehouse {
                salePrice(item) {
                    return (item.price - item.rebate) * this.vat;
                }
            }
            `;
            TestHelper.assertViolationsWithOptions(ruleName, options, stripIndent(script), []);
        });
    });
});
