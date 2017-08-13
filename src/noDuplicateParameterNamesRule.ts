import * as ts from 'typescript';
import * as Lint from 'tslint';

import {ErrorTolerantWalker} from './utils/ErrorTolerantWalker';
import {ExtendedMetadata} from './utils/ExtendedMetadata';

/**
 * Implementation of the no-duplicate-parameter-names rule.
 */
export class Rule extends Lint.Rules.AbstractRule {

    public static metadata: ExtendedMetadata = {
        ruleName: 'no-duplicate-parameter-names',
        type: 'maintainability',
        description: 'Deprecated - This rule is now enforced by the TypeScript compiler',
        options: null,
        optionsDescription: '',
        typescriptOnly: true,
        issueClass: 'Ignored',
        issueType: 'Warning',
        severity: 'Low',
        level: 'Opportunity for Excellence',
        group: 'Deprecated',
        recommendation: 'false, // now supported by TypeScript compiler'
    };

    public static FAILURE_STRING: string = 'Duplicate parameter name: ';

    public apply(sourceFile : ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoDuplicateParameterNamesWalker(sourceFile, this.getOptions()));
    }
}

class NoDuplicateParameterNamesWalker extends ErrorTolerantWalker {
    protected visitMethodDeclaration(node: ts.MethodDeclaration): void {
        this.validateParameterNames(node);
        super.visitMethodDeclaration(node);
    }

    protected visitConstructorDeclaration(node: ts.ConstructorDeclaration): void {
        this.validateParameterNames(node);
        super.visitConstructorDeclaration(node);
    }

    protected visitArrowFunction(node: ts.ArrowFunction): void {
        this.validateParameterNames(node);
        super.visitArrowFunction(node);
    }

    protected visitFunctionDeclaration(node: ts.FunctionDeclaration): void {
        this.validateParameterNames(node);
        super.visitFunctionDeclaration(node);
    }

    protected visitFunctionExpression(node: ts.FunctionExpression): void {
        this.validateParameterNames(node);
        super.visitFunctionExpression(node);
    }

    private validateParameterNames(node : ts.SignatureDeclaration) {
        const seenNames : {[index: string]: boolean} = {};
        node.parameters.forEach((parameter : ts.ParameterDeclaration) : void => {
            const parameterName : string = (<any>parameter.name).text;  // how does one check if the union type is Identifier?
            if (parameterName != null) {
                if (seenNames[parameterName]) {
                    this.addFailureAt(
                        parameter.name.getStart(), parameterName.length, Rule.FAILURE_STRING + '\'' + parameterName + '\'');
                } else {
                    seenNames[parameterName] = true;
                }
            }
        });
    }
}
