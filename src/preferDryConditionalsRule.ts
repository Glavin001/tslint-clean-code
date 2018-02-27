import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { ExtendedMetadata } from './utils/ExtendedMetadata';

/**
 * Implementation of the prefer-dry-conditionals rule.
 */
export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: ExtendedMetadata = {
        ruleName: 'prefer-dry-conditionals',
        type: 'maintainability', // one of: 'functionality' | 'maintainability' | 'style' | 'typescript'
        description: "Don't-Repeat-Yourself in if statement conditionals, instead use Switch statements.",
        options: null,
        optionsDescription: '',
        optionExamples: [], //Remove this property if the rule has no options
        typescriptOnly: false,
        issueClass: 'Non-SDL', // one of: 'SDL' | 'Non-SDL' | 'Ignored'
        issueType: 'Warning', // one of: 'Error' | 'Warning'
        severity: 'Low', // one of: 'Critical' | 'Important' | 'Moderate' | 'Low'
        level: 'Opportunity for Excellence', // one of 'Mandatory' | 'Opportunity for Excellence'
        group: 'Clarity', // one of 'Ignored' | 'Security' | 'Correctness' | 'Clarity' | 'Whitespace' | 'Configurable' | 'Deprecated'
        commonWeaknessEnumeration: '', // if possible, please map your rule to a CWE (see cwe_descriptions.json and https://cwe.mitre.org)
    };

    public static FAILURE_STRING(switchExpression: string, caseExpressions: string[]): string {
        const cases: string[] = caseExpressions.map(text => `    case ${text}:\n      // ...\n      break;`);
        return (
            "Don't Repeat Yourself in If statements. Try using a Switch statement instead:\n" +
            `  switch (${switchExpression}) {\n${cases.join('\n')}\n    default:\n      // ...\n}`
        );
    }

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new PreferDryConditionalsRuleWalker(sourceFile, this.getOptions()));
    }
}

class PreferDryConditionalsRuleWalker extends ErrorTolerantWalker {
    private threshold: number = 1;

    constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
        super(sourceFile, options);
        this.parseOptions();
    }

    protected visitIfStatement(node: ts.IfStatement): void {
        this.checkAndReport(node);
        super.visitIfStatement(node);
    }

    private checkAndReport(node: ts.IfStatement): void {
        const { expression, parent } = node;
        if (!ts.isIfStatement(parent) && ts.isBinaryExpression(expression)) {
            const ifStatements: ts.IfStatement[] = this.allNestedIfStatements(node);
            const exceedsThreshold: boolean = ifStatements.length > this.threshold;
            if (!exceedsThreshold) {
                return;
            }
            const areAllBinaryExpressions: boolean = ifStatements.every(statement => ts.isBinaryExpression(statement.expression));
            if (areAllBinaryExpressions) {
                const binaryExpressions: ts.BinaryExpression[] = ifStatements.map(statement => <ts.BinaryExpression>statement.expression);
                this.checkBinaryExpressions(binaryExpressions);
            }
        }
    }

    private allNestedIfStatements(node: ts.IfStatement): ts.IfStatement[] {
        const ifStatements: ts.IfStatement[] = [node];
        let curr: ts.IfStatement = node;
        while (ts.isIfStatement(curr.elseStatement)) {
            ifStatements.push(curr.elseStatement);
            curr = curr.elseStatement;
        }
        return ifStatements;
    }

    private checkBinaryExpressions(expressions: ts.BinaryExpression[]): void {
        // console.log('expressions', expressions);
        if (expressions.length <= 1) {
            return;
        }
        const firstExpression = expressions[0];
        const expectedOperatorToken = firstExpression.operatorToken;
        const isEqualityCheck =
            expectedOperatorToken.kind === ts.SyntaxKind.EqualsEqualsToken ||
            expectedOperatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken;
        if (!isEqualityCheck) {
            return;
        }

        const expectedLeft = firstExpression.left;
        const expectedRight = firstExpression.right;

        const hasSameOperator = expressions.every(expression => expression.operatorToken.kind === expectedOperatorToken.kind);
        if (!hasSameOperator) {
            return;
        }

        const leftExpressions = expressions.map(expression => expression.left);
        const rightExpressions = expressions.map(expression => expression.right);

        const hasSameLeft = leftExpressions.every(expression => expression.getText() === expectedLeft.getText());
        const hasSameRight = rightExpressions.every(expression => expression.getText() === expectedRight.getText());
        if (hasSameLeft) {
            this.addFailureAtNode(
                firstExpression.parent,
                Rule.FAILURE_STRING(expectedLeft.getText(), rightExpressions.map(expression => expression.getText()))
            );
        } else if (hasSameRight) {
            this.addFailureAtNode(
                firstExpression.parent,
                Rule.FAILURE_STRING(expectedRight.getText(), leftExpressions.map(expression => expression.getText()))
            );
        }
    }

    private parseOptions(): void {
        this.getOptions().forEach((opt: any) => {
            if (typeof opt === 'boolean') {
                return;
            }
            if (typeof opt === 'number') {
                this.threshold = Math.max(1, opt);
                return;
            }
        });
    }
}
