import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { ExtendedMetadata } from './utils/ExtendedMetadata';

export const FAILURE_MIN_STRING: string = 'Too short; difficult to understand its purpose without context';
export const FAILURE_MAX_STRING: string = 'Too long; difficult to read and potentially less maintainable';

/**
 * Implementation of the id-length rule.
 */
export class Rule extends Lint.Rules.AbstractRule {

    public static metadata: ExtendedMetadata = {
        ruleName: 'id-length',
        type: 'maintainability',
        description: 'This rule enforces a minimum and/or maximum identifier length convention.',
        options: null,
        optionsDescription: '',
        typescriptOnly: true,
        issueClass: 'Non-SDL',
        issueType: 'Warning',
        severity: 'Important',
        level: 'Opportunity for Excellence',
        group: 'Correctness',
        recommendation: 'true,',
        commonWeaknessEnumeration: '398, 710'
    };

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new IdLengthRuleWalker(sourceFile, this.getOptions()));
    }

}

class IdLengthRuleWalker extends ErrorTolerantWalker {

    private min: number = 2;
    private max: number = Infinity;
    private exceptions: string[] = [];

    constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
        super(sourceFile, options);
        this.parseOptions();
    }

    protected visitIdentifier(node: ts.Identifier): void {
        this.checkAndReport(node);
        super.visitIdentifier(node);
    }

    private checkAndReport(node: ts.Identifier): void {
        const { text } = node;
        if (this.exceptions.indexOf(text) === -1) {
            if (text.length < this.min) {
                return this.addFailureAt(node.getStart(), node.getWidth(), FAILURE_MIN_STRING + ': ' + text);
            }
            if (text.length > this.max) {
                return this.addFailureAt(node.getStart(), node.getWidth(), FAILURE_MAX_STRING + ': ' + text);
            }
        }
    }

    private parseOptions(): void {
        this.getOptions().forEach((opt: any) => {
            if (typeof (opt) === 'boolean') {
                return;
            }
            if (typeof (opt) === 'number') {
                this.min = opt;
                return;
            }
            if (Array.isArray(opt)) {
                this.exceptions = opt;
                return;
            }
            if (typeof (opt) === 'object') {
                this.min = typeof opt.min === 'number' ? opt.min : this.min;
                this.max = typeof opt.max === 'number' ? opt.max : this.max;
                this.exceptions = opt.exceptions || this.exceptions;
                return;
            }
        });
    }

}
