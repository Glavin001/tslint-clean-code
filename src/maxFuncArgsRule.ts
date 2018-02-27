import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { ExtendedMetadata } from './utils/ExtendedMetadata';

export const FAILURE_STRING: string = 'Exceeds maximum function argument list length of ';
export const FAILURE_RECOMMENDATION_STRING: string =
    '\nConsider these two solutions for refactoring:\n' +
    '1) Create a Class and pass common arguments into the constructor as instance properties. ' +
    'Move this function to the new Class with a reduced arguments list.\n' +
    '2) Instantiate an object containing each of the arguments and pass in the object instance as a single argument.';
export const DEFAULT_MAX_ARGS_LENGTH: number = 3;

/**
 * Implementation of the newspaper-order rule.
 */
export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: ExtendedMetadata = {
        ruleName: 'max-func-args',
        type: 'maintainability',
        description: 'The ideal number of arguments for a function is zero (niladic).',
        options: null,
        optionsDescription: '',
        typescriptOnly: true,
        issueClass: 'Non-SDL',
        issueType: 'Warning',
        severity: 'Important',
        level: 'Opportunity for Excellence',
        group: 'Correctness',
        recommendation: '[true, 3],',
        commonWeaknessEnumeration: '',
    };

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new MaxFunctionArgsRuleWalker(sourceFile, this.getOptions()));
    }
}

class MaxFunctionArgsRuleWalker extends ErrorTolerantWalker {
    private maxArgs: number = DEFAULT_MAX_ARGS_LENGTH;

    constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
        super(sourceFile, options);
        this.parseOptions();
    }

    protected visitFunctionDeclaration(node: ts.FunctionDeclaration): void {
        this.checkAndReport(node);
        super.visitFunctionDeclaration(node);
    }

    protected visitArrowFunction(node: ts.ArrowFunction): void {
        this.checkAndReport(node);
        super.visitArrowFunction(node);
    }

    protected visitMethodDeclaration(node: ts.MethodDeclaration): void {
        this.checkAndReport(node);
        super.visitMethodDeclaration(node);
    }

    private checkAndReport(node: ts.SignatureDeclaration) {
        if (node.parameters.length > this.maxArgs) {
            const failureMessage = this.makeFailureMessage();
            const { start, width } = this.getStartAndWidth(node.parameters);
            this.addFailureAt(start, width, failureMessage);
        }
    }

    private getStartAndWidth(nodes: ts.NodeArray<any>) {
        const { pos, end } = nodes;
        const start = pos;
        const width = end - pos;
        return {
            start,
            width,
        };
    }

    private makeFailureMessage(): string {
        return FAILURE_STRING + this.maxArgs + FAILURE_RECOMMENDATION_STRING;
    }

    private parseOptions(): void {
        this.getOptions().forEach((opt: any) => {
            if (typeof opt === 'boolean') {
                return;
            }
            if (typeof opt === 'number') {
                this.maxArgs = opt;
                return;
            }
        });
    }
}
