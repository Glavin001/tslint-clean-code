import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { ExtendedMetadata } from './utils/ExtendedMetadata';
import { forEachTokenWithTrivia } from 'tsutils';

const FAILURE_STRING: string = 'No commented out code.';

/**
 * Implementation of the no-commented-out-code rule.
 */
export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: ExtendedMetadata = {
        ruleName: 'no-commented-out-code',
        type: 'maintainability', // one of: 'functionality' | 'maintainability' | 'style' | 'typescript'
        description: 'Code must not be commented out.',
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

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoCommentedOutCodeRuleWalker(sourceFile, this.getOptions()));
    }
}

class NoCommentedOutCodeRuleWalker extends ErrorTolerantWalker {
    public visitSourceFile(node: ts.SourceFile) {
        forEachTokenWithTrivia(node, (text, tokenSyntaxKind, range) => {
            if (tokenSyntaxKind === ts.SyntaxKind.SingleLineCommentTrivia || tokenSyntaxKind === ts.SyntaxKind.MultiLineCommentTrivia) {
                this.scanCommentForCode(range.pos, text.substring(range.pos, range.end));
            }
        });
    }

    private scanCommentForCode(startPosition: number, commentText: string) {
        if (this.textIsCode(this.cleanComment(commentText))) {
            this.foundSuspiciousComment(startPosition, commentText);
        }
    }

    private textIsCode(text: string): boolean {
        text = text.trim();
        if (this.textIsSingleWord(text)) {
            return false;
        }
        if (this.textIsTslintFlag(text)) {
            return false;
        }
        const sourceFile = ts.createSourceFile('', text, ts.ScriptTarget.ES5, true);
        if (sourceFile) {
            const { statements } = sourceFile;
            const diagnostics: any[] = (<any>sourceFile).parseDiagnostics;
            return statements.length > 0 && diagnostics.length === 0;
        }
        return false;
    }

    private textIsSingleWord(text: string): boolean {
        const pattern = new RegExp('^[\\w-]*$');
        return pattern.test(text);
    }

    private textIsTslintFlag(text: string): boolean {
        return text.startsWith('tslint:');
    }

    private cleanComment(text: string): string {
        const pattern = /^([^a-zA-Z0-9]+)/;
        const lines = text.split('\n');
        return lines.map(line => line.replace(pattern, '').trim()).join('\n');
    }

    private foundSuspiciousComment(startPosition: number, commentText: string) {
        this.addFailureAt(startPosition, commentText.length, FAILURE_STRING);
    }
}
