import * as ts from 'typescript';
import * as Lint from 'tslint';

import {ErrorTolerantWalker} from './utils/ErrorTolerantWalker';
import {ExtendedMetadata} from './utils/ExtendedMetadata';

const FAILURE_STRING: string = 'Do not use http-equiv="refresh"';

/**
 * Implementation of the react-a11y-meta rule.
 */
export class Rule extends Lint.Rules.AbstractRule {

    public static metadata: ExtendedMetadata = {
        ruleName: 'react-a11y-meta',
        type: 'functionality',
        description: 'For accessibility of your website, HTML meta elements must not have http-equiv="refresh".',
        options: null,
        optionsDescription: '',
        typescriptOnly: true,
        issueClass: 'Ignored',
        issueType: 'Warning',
        severity: 'Low',
        level: 'Opportunity for Excellence',
        group: 'Accessibility'
    };

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        if (sourceFile.languageVariant === ts.LanguageVariant.JSX) {
            return this.applyWithWalker(new ReactA11yMetaRuleWalker(sourceFile, this.getOptions()));
        } else {
            return [];
        }
    }
}

class ReactA11yMetaRuleWalker extends ErrorTolerantWalker {

    protected visitJsxElement(node: ts.JsxElement): void {
        this.validateOpeningElement(node, node.openingElement);
        super.visitJsxElement(node);
    }

    protected visitJsxSelfClosingElement(node: ts.JsxSelfClosingElement): void {
        this.validateOpeningElement(node, node);
    }

    private validateOpeningElement(parent: ts.Node, openElement: ts.JsxOpeningLikeElement): void {
        if (openElement.tagName.getText() === 'meta') {
            const attributes: ts.JsxAttributes = openElement.attributes;
            attributes.properties.forEach((parameter: ts.JsxAttributeLike): void => {
                if (parameter.kind === ts.SyntaxKind.JsxAttribute) {
                    const attribute: ts.JsxAttribute = <ts.JsxAttribute>parameter;
                    if (attribute.name.getText() === 'http-equiv') {
                        if (this.isStringLiteral(attribute.initializer, 'refresh')) {
                            this.addFailureAt(parent.getStart(), openElement.getWidth(), FAILURE_STRING);
                        }
                    }
                }
            });
        }
    }

    private isStringLiteral(expression: ts.Expression, literal: string): boolean {
        if (expression != null) {
            if (expression.kind === ts.SyntaxKind.StringLiteral) {
                const value: string = (<ts.StringLiteral>expression).text;
                return value === literal;
            } else if (expression.kind === ts.SyntaxKind.JsxExpression) {
                const exp: ts.JsxExpression = <ts.JsxExpression>expression;
                if (exp.expression.kind === ts.SyntaxKind.StringLiteral) {
                    const value: string = (<ts.StringLiteral>exp.expression).text;
                    return value === literal;
                }
            }
        }
        return null;
    }
}
