import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { ExtendedMetadata } from './utils/ExtendedMetadata';
import { AstUtils } from './utils/AstUtils';

/**
 * Implementation of the no-feature-envy rule.
 */
export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: ExtendedMetadata = {
        ruleName: 'no-feature-envy',
        type: 'maintainability', // one of: 'functionality' | 'maintainability' | 'style' | 'typescript'
        description: 'A method accesses the data of another object more than its own data.',
        options: null,
        optionsDescription: '',
        optionExamples: [], //Remove this property if the rule has no options
        recommendation: '[true, 1, ["_"]],',
        typescriptOnly: false,
        issueClass: 'Non-SDL', // one of: 'SDL' | 'Non-SDL' | 'Ignored'
        issueType: 'Warning', // one of: 'Error' | 'Warning'
        severity: 'Moderate', // one of: 'Critical' | 'Important' | 'Moderate' | 'Low'
        level: 'Opportunity for Excellence', // one of 'Mandatory' | 'Opportunity for Excellence'
        group: 'Clarity', // one of 'Ignored' | 'Security' | 'Correctness' | 'Clarity' | 'Whitespace' | 'Configurable' | 'Deprecated'
        commonWeaknessEnumeration: '', // if possible, please map your rule to a CWE (see cwe_descriptions.json and https://cwe.mitre.org)
    };

    public static FAILURE_STRING(feature: MethodFeature): string {
        const { methodName, className, otherClassName } = feature;
        const failureMessage = `Method "${methodName}" uses "${otherClassName}" more than its own class "${className}".`;
        const recommendation = `Extract or Move Method from "${methodName}" into "${otherClassName}".`;
        return `${failureMessage} ${recommendation}`;
    }

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoFeatureEnvyRuleWalker(sourceFile, this.getOptions()));
    }
}

class NoFeatureEnvyRuleWalker extends ErrorTolerantWalker {
    private threshold: number = 0;
    private exclude: string[] = [];

    constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
        super(sourceFile, options);
        this.parseOptions();
    }

    protected visitClassDeclaration(node: ts.ClassDeclaration): void {
        this.checkAndReport(node);
        super.visitClassDeclaration(node);
    }

    private checkAndReport(node: ts.ClassDeclaration): void {
        this.getFeatureMethodsForClass(node).forEach(feature => {
            const failureMessage = Rule.FAILURE_STRING(feature);
            this.addFailureAtNode(feature.methodNode, failureMessage);
        });
    }

    private getFeatureMethodsForClass(classNode: ts.ClassDeclaration): MethodFeature[] {
        const methods = this.methodsForClass(classNode);
        return <any[]>methods
            .map(method => {
                const walker = new ClassMethodWalker(classNode, method);
                return walker.features();
            })
            .map(features => this.getTopFeature(features))
            .filter(feature => feature !== undefined);
    }

    private getTopFeature(features: MethodFeature[]): MethodFeature | void {
        const filteredFeatures = this.filterFeatures(features);
        return filteredFeatures.reduce((best, current) => {
            if (!best) {
                return current;
            }
            if (current.featureEnvy() > best.featureEnvy()) {
                return current;
            }
            return best;
        }, undefined);
    }

    private filterFeatures(features: MethodFeature[]): MethodFeature[] {
        return features.filter(feature => {
            const isExcluded = this.exclude.indexOf(feature.otherClassName) !== -1;
            if (isExcluded) {
                return false;
            }
            return feature.featureEnvy() > this.threshold;
        });
    }

    protected methodsForClass(classNode: ts.ClassDeclaration): ts.MethodDeclaration[] {
        return <ts.MethodDeclaration[]>classNode.members.filter(
            (classElement: ts.ClassElement): boolean => {
                switch (classElement.kind) {
                    case ts.SyntaxKind.MethodDeclaration:
                    case ts.SyntaxKind.GetAccessor:
                    case ts.SyntaxKind.SetAccessor:
                        return !AstUtils.isStatic(classElement);
                    default:
                        return false;
                }
            }
        );
    }

    private parseOptions(): void {
        this.getOptions().forEach((opt: any) => {
            if (typeof opt === 'boolean') {
                return;
            }
            if (typeof opt === 'number') {
                this.threshold = opt;
                return;
            }
            if (Array.isArray(opt)) {
                this.exclude = opt;
                return;
            }
        });
    }
}

class ClassMethodWalker extends Lint.SyntaxWalker {
    private featureEnvyMap: EnvyMap = {};

    constructor(private classNode: ts.ClassDeclaration, private methodNode: ts.MethodDeclaration) {
        super();
        this.walk(this.methodNode);
    }

    public features(): MethodFeature[] {
        const thisClassAccesses = this.getCountForClass('this');
        return this.classesUsed.map(className => {
            const otherClassAccesses = this.getCountForClass(className);
            return new MethodFeature({
                classNode: this.classNode,
                methodNode: this.methodNode,
                otherClassName: className,
                thisClassAccesses,
                otherClassAccesses,
            });
        });
    }

    private getCountForClass(className: string): number {
        return this.featureEnvyMap[className] || 0;
    }

    private get classesUsed(): string[] {
        return Object.keys(this.featureEnvyMap).filter(className => className !== 'this');
    }

    protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
        if (this.isTopPropertyAccess(node)) {
            const className = this.classNameForPropertyAccess(node);
            this.incrementCountForClass(className);
        }
        super.visitPropertyAccessExpression(node);
    }

    private incrementCountForClass(className: string): void {
        if (this.featureEnvyMap[className] !== undefined) {
            this.featureEnvyMap[className] += 1;
        } else {
            this.featureEnvyMap[className] = 1;
        }
    }

    private isTopPropertyAccess(node: ts.PropertyAccessExpression): boolean {
        switch (node.expression.kind) {
            case ts.SyntaxKind.Identifier:
            case ts.SyntaxKind.ThisKeyword:
            case ts.SyntaxKind.SuperKeyword:
                return true;
        }
        return false;
    }

    private classNameForPropertyAccess(node: ts.PropertyAccessExpression): string {
        const { expression } = node;
        if (ts.isThisTypeNode(node)) {
            return 'this';
        }
        if (expression.kind === ts.SyntaxKind.SuperKeyword) {
            return 'this';
        }
        if (this.classNode.name.getText() === expression.getText()) {
            return 'this';
        }
        return expression.getText();
    }
}

export class MethodFeature {
    constructor(
        private data: {
            classNode: ts.ClassDeclaration;
            methodNode: ts.MethodDeclaration;
            otherClassName: string;
            thisClassAccesses: number;
            otherClassAccesses: number;
        }
    ) {}

    public get className(): string {
        return this.classNode.name.text;
    }
    public get classNode(): ts.ClassDeclaration {
        return this.data.classNode;
    }

    public get methodName(): string {
        return this.methodNode.name.getText();
    }
    public get methodNode(): ts.MethodDeclaration {
        return this.data.methodNode;
    }

    public featureEnvy(): number {
        const { thisClassAccesses, otherClassAccesses } = this.data;
        return otherClassAccesses - thisClassAccesses;
    }

    public get otherClassName(): string {
        return this.data.otherClassName;
    }
}

interface EnvyMap {
    [className: string]: number;
}
