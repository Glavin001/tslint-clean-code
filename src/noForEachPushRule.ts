import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { ExtendedMetadata } from './utils/ExtendedMetadata';

/**
 * Implementation of the id-length rule.
 */
export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: ExtendedMetadata = {
        ruleName: 'no-for-each-push',
        type: 'maintainability',
        description: 'Enforce using Array.prototype.map instead of Array.prototype.forEach and Array.prototype.push.',
        options: null,
        optionsDescription: '',
        typescriptOnly: true,
        issueClass: 'Non-SDL',
        issueType: 'Warning',
        severity: 'Important',
        level: 'Opportunity for Excellence',
        group: 'Correctness',
        recommendation: 'true,',
        commonWeaknessEnumeration: '',
    };

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoForeachPushRuleWalker(sourceFile, this.getOptions()));
    }

    public static FAILURE_STRING: string =
        'Do not use Array.prototype.push inside of Array.prototype.forEach. ' + 'Use Array.prototype.map instead to replace both.';
}

class NoForeachPushRuleWalker extends ErrorTolerantWalker {
    protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
        this.checkAndReport(node);
        super.visitPropertyAccessExpression(node);
    }

    private checkAndReport(node: ts.PropertyAccessExpression): void {
        const isCallExpression = ts.isCallExpression(node.parent);
        const isForEach = node.name.text === 'forEach';
        // console.log('checkAndReport', isCallExpression, isForEach); // tslint:disable-line
        if (isCallExpression && isForEach) {
            if (this.doesCallPush(node)) {
                this.addFailureAtNode(node.parent, Rule.FAILURE_STRING);
            }
        }
    }

    private doesCallPush(node: ts.PropertyAccessExpression) {
        const walker = new PushCallWalker();
        walker.walk(node.parent);
        return walker.isFound;
    }
}

class PushCallWalker extends Lint.SyntaxWalker {
    private foundPush: boolean = false;
    private foundIf: boolean = false;

    protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
        const isCallExpression = ts.isCallExpression(node.parent);
        const isPush = node.name.text === 'push';
        // console.log('PushCallWalker', isCallExpression, isPush, node); // tslint:disable-line
        if (isCallExpression && isPush) {
            this.foundPush = true;
            return;
        }
        super.visitPropertyAccessExpression(node);
    }

    protected visitIfStatement(): void {
        this.foundIf = true;
        return;
    }

    public get isFound(): boolean {
        return !this.foundIf && this.foundPush;
    }
}
