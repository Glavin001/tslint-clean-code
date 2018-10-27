import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { ExtendedMetadata } from './utils/ExtendedMetadata';

/**
 * Implementation of the no-map-without-usage rule.
 */
export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: ExtendedMetadata = {
        ruleName: 'no-map-without-usage',
        type: 'maintainability', // one of: 'functionality' | 'maintainability' | 'style' | 'typescript'
        description: 'Prevent Array.prototype.map from being called and results not used.',
        options: null,
        optionsDescription: '',
        optionExamples: [], //Remove this property if the rule has no options
        typescriptOnly: false,
        issueClass: 'Non-SDL', // one of: 'SDL' | 'Non-SDL' | 'Ignored'
        issueType: 'Warning', // one of: 'Error' | 'Warning'
        severity: 'Low', // one of: 'Critical' | 'Important' | 'Moderate' | 'Low'
        level: 'Opportunity for Excellence', // one of 'Mandatory' | 'Opportunity for Excellence'
        group: 'Correctness', // one of 'Ignored' | 'Security' | 'Correctness' | 'Clarity' | 'Whitespace' | 'Configurable' | 'Deprecated'
        commonWeaknessEnumeration: '', // if possible, please map your rule to a CWE (see cwe_descriptions.json and https://cwe.mitre.org)
    };

    public static FAILURE_STRING: string =
        'Return value from Array.prototype.map should be assigned to a variable. ' + 'Consider using Array.prototype.forEach instead.';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoMapWithoutAssignmentRuleWalker(sourceFile, this.getOptions()));
    }
}

class NoMapWithoutAssignmentRuleWalker extends ErrorTolerantWalker {
    protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
        this.checkAndReport(node);
        super.visitPropertyAccessExpression(node);
    }

    private checkAndReport(node: ts.PropertyAccessExpression): void {
        if (this.isMapCall(node) && !this.isAssignment(node) && !this.isUsed(node)) {
            this.addFailureAtNode(node, Rule.FAILURE_STRING);
        }
    }

    private isMapCall(node: ts.PropertyAccessExpression): boolean {
        const isCallExpression = ts.isCallExpression(node.parent);
        const isMap = node.name.text === 'map';
        return isCallExpression && isMap;
    }

    private isAssignment(node: ts.PropertyAccessExpression): boolean {
        const { parent: parent1 } = node;
        if (parent1 && ts.isCallExpression(parent1)) {
            const { parent: parent2 } = parent1;
            const parentIsAssignment =
                ts.isPropertyAssignment(parent2) ||
                ts.isVariableDeclaration(parent2) ||
                (ts.isBinaryExpression(parent2) && parent2.operatorToken.kind === ts.SyntaxKind.FirstAssignment);
            if (parentIsAssignment) {
                return true;
            }
        }
        return false;
    }

    private isUsed(node: ts.PropertyAccessExpression): boolean {
        const { parent: parent1 } = node;
        if (parent1 && ts.isCallExpression(parent1)) {
            const { parent: parent2 } = parent1;
            if (this.parentUsesNode(parent2)) {
                return true;
            }
        }
        return false;
    }

    private parentUsesNode(parent?: ts.Node) {
        return (
            parent &&
            (ts.isPropertyAccessExpression(parent) ||
                ts.isPropertyDeclaration(parent) ||
                ts.isReturnStatement(parent) ||
                ts.isCallOrNewExpression(parent) ||
                ts.isSpreadElement(parent) ||
                ts.isJsxExpression(parent) ||
                ts.isConditionalExpression(parent) ||
                ts.isArrayLiteralExpression(parent) ||
                ts.isBinaryExpression(parent) ||
                ts.isArrowFunction(parent))
        );
    }
}
