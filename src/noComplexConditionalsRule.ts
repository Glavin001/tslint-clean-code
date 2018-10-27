import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { ExtendedMetadata } from './utils/ExtendedMetadata';

/**
 * Implementation of the no-complex-conditionals rule.
 */
export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: ExtendedMetadata = {
        ruleName: 'no-complex-conditionals',
        type: 'maintainability', // one of: 'functionality' | 'maintainability' | 'style' | 'typescript'
        description: 'Enforce the maximum complexity of conditional expressions.',
        options: null,
        optionsDescription: '',
        optionExamples: [], //Remove this property if the rule has no options
        typescriptOnly: false,
        issueClass: 'Non-SDL', // one of: 'SDL' | 'Non-SDL' | 'Ignored'
        issueType: 'Warning', // one of: 'Error' | 'Warning'
        severity: 'Moderate', // one of: 'Critical' | 'Important' | 'Moderate' | 'Low'
        level: 'Opportunity for Excellence', // one of 'Mandatory' | 'Opportunity for Excellence'
        group: 'Clarity', // one of 'Ignored' | 'Security' | 'Correctness' | 'Clarity' | 'Whitespace' | 'Configurable' | 'Deprecated'
        commonWeaknessEnumeration: '', // if possible, please map your rule to a CWE (see cwe_descriptions.json and https://cwe.mitre.org)
    };

    public static FAILURE_STRING: string =
        'Conditional expression is too complex. ' + 'Consider moving expression to a variable or function with a meaningful name.';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoComplexConditionalsRuleWalker(sourceFile, this.getOptions()));
    }
}

class NoComplexConditionalsRuleWalker extends ErrorTolerantWalker {
    private threshold: number = 3;

    constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
        super(sourceFile, options);
        this.parseOptions();
    }

    protected visitIfStatement(node: ts.IfStatement): void {
        const { expression } = node;
        const complexity = this.countComplexity(expression);
        // console.log('complexity', complexity); //tslint:disable-line
        if (complexity > this.threshold) {
            this.addFailureAtNode(expression, Rule.FAILURE_STRING);
        }
        super.visitIfStatement(node);
    }

    private countComplexity(expression: ts.Expression): number {
        let complexity = 0;
        const cb = (node: ts.Node) => {
            // console.log('complexity', complexity); //tslint:disable-line
            if (this.increasesComplexity(node)) {
                complexity = complexity + 1;
            }
            return ts.forEachChild(node, cb);
        };
        // ts.forEachChild(expression, cb);
        cb(expression);
        return complexity;
    }

    private increasesComplexity(node: ts.Node): boolean {
        // console.log(ts.SyntaxKind[node.kind] + ' ' + node.getText());
        switch (node.kind) {
            case ts.SyntaxKind.CaseClause:
                return (<ts.CaseClause>node).statements.length > 0;
            case ts.SyntaxKind.CatchClause:
            case ts.SyntaxKind.ConditionalExpression:
            case ts.SyntaxKind.DoStatement:
            case ts.SyntaxKind.ForStatement:
            case ts.SyntaxKind.ForInStatement:
            case ts.SyntaxKind.ForOfStatement:
            case ts.SyntaxKind.IfStatement:
            case ts.SyntaxKind.WhileStatement:
                return true;

            case ts.SyntaxKind.BinaryExpression:
                switch ((<ts.BinaryExpression>node).operatorToken.kind) {
                    case ts.SyntaxKind.BarBarToken:
                    case ts.SyntaxKind.AmpersandAmpersandToken:
                        return true;
                    default:
                        return false;
                }

            default:
                return false;
        }
    }

    private parseOptions(): void {
        this.getOptions().forEach((opt: any) => {
            if (typeof opt === 'boolean') {
                return;
            }
            if (typeof opt === 'number') {
                this.threshold = opt;
                return;
            }
        });
    }
}
