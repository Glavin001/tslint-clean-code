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
        optionExamples: [], // Remove this property if the rule has no options
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
        const trimmedCommentText = this.trimTextLines(commentText);

        if (this.isTextCode(trimmedCommentText)) {
            this.handleSuspiciousComment(startPosition, commentText);
        }
    }

    /**
     * Removes spaces and comment delimiters at beginning
     * and end of each line
     */
    private trimTextLines(text: string): string {
        const lines = text.split('\n');

        const trimAtStart = /^\s*\/*\**\s*/;
        const trimAtEnd = /\s*\**\/*\s*$/;

        const trimmedLines = lines.map(line => {
            return line.replace(trimAtStart, '').replace(trimAtEnd, '');
        });

        return trimmedLines.join('\n');
    }

    private isTextCode(text: string): boolean {
        if (this.isTextSingleWord(text)) {
            return false;
        }
        if (this.isTextTsLintFlag(text)) {
            return false;
        }
        if (this.isTextToDoLikeNote(text)) {
            return false;
        }

        return this.isTextCodeWithoutErrors(text);
    }

    private isTextSingleWord(text: string): boolean {
        const pattern = new RegExp('^([\\w-]*)$');
        return pattern.test(text.trim());
    }

    /**
     * TSLint flags will be will be parsed as labeled statements and thus
     * may result in valid code, so they need to be handled separately
     */
    private isTextTsLintFlag(text: string): boolean {
        return text.startsWith('tslint:');
    }

    /**
     * These notes followed by a colon will be parsed as labeled statements
     * and thus may result in valid code, so they need to be handled separately
     */
    private isTextToDoLikeNote(text: string): boolean {
        return /^(NOTE|TODO|FIXME|BUG|HACK|XXX):/.test(text);
    }

    /**
     * If text contains statements but not one error, it must be code
     */
    private isTextCodeWithoutErrors(text: string) {
        const sourceFile = this.createSourceFileFromText(text);

        if (!this.hasSourceFileStatements(sourceFile)) {
            return false;
        }

        const sourceFileDiagnostics = this.getSourceFileDiagnostics(sourceFile);

        return sourceFileDiagnostics.length === 0;
    }

    private createSourceFileFromText(text: string): ts.SourceFile {
        return ts.createSourceFile('', text, ts.ScriptTarget.ES5, true);
    }

    private hasSourceFileStatements(sourceFile: ts.SourceFile): boolean {
        return sourceFile && sourceFile.statements.length > 0;
    }

    /**
     * The most efficient way to get a source file's diagnostics is from parseDiagnostics,
     * which isn't exposed in the API, since the cast to any.
     * @see https://github.com/Microsoft/TypeScript/issues/21940
     * Tried using ts.Program.getSyntacticDiagnostics + getDeclarationDiagnostics, which
     * wasn't quiet as fast.
     */
    private getSourceFileDiagnostics(sourceFile: ts.SourceFile): ts.Diagnostic[] {
        return (<any>sourceFile).parseDiagnostics;
    }

    private handleSuspiciousComment(startPosition: number, commentText: string) {
        this.addFailureAt(startPosition, commentText.length, FAILURE_STRING);
    }
}
