import * as ts from 'typescript';
import * as Lint from 'tslint';

import {ErrorTolerantWalker} from './utils/ErrorTolerantWalker';
import {ExtendedMetadata} from './utils/ExtendedMetadata';

/**
 * Implementation of the no-invalid-regexp rule.
 */
export class Rule extends Lint.Rules.AbstractRule {

    public static metadata: ExtendedMetadata = {
        ruleName: 'no-invalid-regexp',
        type: 'maintainability',
        description: 'Do not use invalid regular expression strings in the RegExp constructor.',
        options: null,
        optionsDescription: '',
        typescriptOnly: true,
        issueClass: 'Non-SDL',
        issueType: 'Error',
        severity: 'Critical',
        level: 'Opportunity for Excellence',
        group: 'Correctness'
    };

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoInvalidRegexpRuleWalker(sourceFile, this.getOptions()));
    }
}

class NoInvalidRegexpRuleWalker extends ErrorTolerantWalker {
    protected visitNewExpression(node: ts.NewExpression): void {
        this.validateCall(node);
        super.visitNewExpression(node);
    }

    protected visitCallExpression(node: ts.CallExpression): void {
        this.validateCall(node);
        super.visitCallExpression(node);
    }

    private validateCall(expression: ts.CallExpression | ts.NewExpression): void {
        if (expression.expression.getText() === 'RegExp') {
            if (expression.arguments.length > 0) {
                const arg1: ts.Expression = expression.arguments[0];
                if (arg1.kind === ts.SyntaxKind.StringLiteral) {
                    const regexpText: string = (<ts.StringLiteral>arg1).text;
                    try {
                        // tslint:disable-next-line:no-unused-expression
                        new RegExp(regexpText);
                    } catch (e) {
                        this.addFailureAt(arg1.getStart(), arg1.getWidth(), e.message);
                    }
                }
            }
        }
    }
}
