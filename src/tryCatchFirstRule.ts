import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { ExtendedMetadata } from './utils/ExtendedMetadata';

export const FAILURE_STRING: string = 'Try-catch blocks must be at the top of the scope';

/**
 * Implementation of the newspaper-order rule.
 */
export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: ExtendedMetadata = {
        ruleName: 'try-catch-first',
        type: 'maintainability',
        description:
            'Try-catch blocks must be first within the scope. ' +
            'Try-catch blocks are transactions and should leave your program in a consistent state, no matter what happens in the try.',
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
        return this.applyWithWalker(new TryCatchFirstRuleWalker(sourceFile, this.getOptions()));
    }
}

class TryCatchFirstRuleWalker extends ErrorTolerantWalker {
    private scopeKinds: ts.SyntaxKind[] = [
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.ArrowFunction,
        ts.SyntaxKind.SourceFile,
        ts.SyntaxKind.MethodDeclaration,
        ts.SyntaxKind.GetAccessor,
        ts.SyntaxKind.SetAccessor,
    ];

    protected visitTryStatement(node: ts.TryStatement): void {
        this.checkAndReport(node);
        super.visitTryStatement(node);
    }

    private checkAndReport(node: ts.TryStatement) {
        const block = node.parent;
        const { parent } = block;
        // console.log('checkAndReport', block, parent); // tslint:disable-line no-console
        const isFirst = this.scopeKinds.indexOf((parent || block).kind) !== -1;
        if (!isFirst) {
            const failureMessage = this.makeFailureMessage();
            this.addFailureAt(node.getStart(), node.getWidth(), failureMessage);
        }
    }

    private makeFailureMessage(): string {
        return FAILURE_STRING;
    }
}
