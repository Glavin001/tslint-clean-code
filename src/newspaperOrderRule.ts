import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { AstUtils } from './utils/AstUtils';
import { Utils } from './utils/Utils';
import { ExtendedMetadata } from './utils/ExtendedMetadata';
import * as toposort from 'toposort';
import * as Memoize from 'memoize-decorator';

export const FAILURE_STRING: string = 'The class does not read like a Newpaper. Please reorder the methods of the class: ';

/**
 * Implementation of the newspaper-order rule.
 */
export class Rule extends Lint.Rules.AbstractRule {

    public static metadata: ExtendedMetadata = {
        ruleName: 'newspaper-order',
        type: 'maintainability',
        description: 'We would like a source file to be like a newspaper article. ' +
        'Detail should increase as we move downward, ' +
        'until at the end we find the lowest level functions and details in the source file.',
        options: null,
        optionsDescription: '',
        typescriptOnly: true,
        issueClass: 'Non-SDL',
        issueType: 'Warning',
        severity: 'Important',
        level: 'Opportunity for Excellence',
        group: 'Correctness',
        recommendation: '[true, 0.5],',
        commonWeaknessEnumeration: '398, 710'
    };

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NewspaperOrderRuleWalker(sourceFile, this.getOptions()));
    }
}

class NewspaperOrderRuleWalker extends ErrorTolerantWalker {

    protected visitClassDeclaration(node: ts.ClassDeclaration): void {
        const classNode = new ClassDeclarationHelper(node);
        if (!this.readsLikeNewspaper(classNode)) {
            const failureMessage = this.makeFailureMessage(classNode);
            this.addFailureAt(node.getStart(), node.getWidth(), failureMessage);
        }
        super.visitClassDeclaration(node);
    }

    private makeFailureMessage(classNode: ClassDeclarationHelper): string {
        const { name, completeOrderedMethodNames, methodNames } = classNode;
        const correctSymbol = '✓';
        const incorrectSymbol = 'x';
        const help: string = '\n\nMethods order:\n' +
            completeOrderedMethodNames.map((method, index) => {
                const isCorrect = methodNames[index] === method;
                const status = isCorrect ? correctSymbol : incorrectSymbol;
                return `${index + 1}. ${status} ${method}`;
            }).join('\n');
        return FAILURE_STRING + name + help;
    }

    private readsLikeNewspaper(classNode: ClassDeclarationHelper): boolean {
        return classNode.readsLikeNewspaper;
    }

}

class ClassDeclarationHelper {
    constructor(private node: ts.ClassDeclaration) {
    }

    @Memoize
    public get readsLikeNewspaper(): boolean {
        // console.log('====================='); // tslint:disable-line no-console
        // console.log('Class: ', this.name); // tslint:disable-line no-console
        const { methodNames, completeOrderedMethodNames, ignoredMethods } = this;
        const ignoringAllMethods: boolean = (ignoredMethods.length === methodNames.length);
        const hasNoDeps: boolean = completeOrderedMethodNames.length === 0;
        // console.log('ignoredMethods:', ignoredMethods); // tslint:disable-line no-console
        if (ignoringAllMethods || hasNoDeps) {
            return true;
        }
        // console.log('methodNames:', methodNames); // tslint:disable-line no-console
        // console.log('orderedMethodNames:', completeOrderedMethodNames); // tslint:disable-line no-console
        return Utils.arraysShallowEqual(methodNames, completeOrderedMethodNames);
    }

    @Memoize
    public get completeOrderedMethodNames(): string[] {
        const { orderedMethodNames, ignoredMethods } = this;
        return orderedMethodNames.concat(ignoredMethods);
    }

    @Memoize
    private get ignoredMethods(): string[] {
        const { methodNames, orderedMethodNames } = this;
        return methodNames.filter(methodName => {
            return !Utils.contains(orderedMethodNames, methodName);
        }).sort();
    }

    @Memoize
    private get orderedMethodNames(): string[] {
        const { methodGraph } = this;
        try {
            return toposort(methodGraph);
        } catch (error) {
            return [];
        }
    }

    @Memoize
    private get methodGraph(): ToposortGraph {
        const { methodDependencies } = this;
        // console.log('methodDependencies:', methodDependencies); // tslint:disable-line no-console
        return Object.keys(methodDependencies).sort().reduce((graph: ToposortGraph, methodName: string) => {
            const deps = Object.keys(methodDependencies[methodName]).sort();
            deps.forEach(depName => {
                const shouldIgnore: boolean = !methodDependencies.hasOwnProperty(depName) || (methodName === depName);
                // console.log('shouldIgnore:', shouldIgnore, methodName, depName); // tslint:disable-line no-console
                if (shouldIgnore) {
                    return;
                }
                const edge = [methodName, depName];
                graph.push(edge);
            });
            // console.log('graph:', graph); // tslint:disable-line no-console
            return graph;
        }, <ToposortGraph>[]);
    }

    @Memoize
    private get methodDependencies(): MethodDependenciesMap {
        return this.methods.reduce((result, method) => {
            result[method.name.getText()] = this.dependenciesForMethod(method);
            return result;
        }, <MethodDependenciesMap>{});
    }

    private dependenciesForMethod(method: ts.MethodDeclaration): MethodDependencies {
        const walker = new ClassMethodWalker();
        walker.walk(method);
        return walker.dependencies;
    }

    @Memoize
    public get methodNames(): string[] {
        return this.methods.map(method => method.name.getText());
    }

    @Memoize
    private get methods(): ts.MethodDeclaration[] {
        return <ts.MethodDeclaration[]>this.node.members.filter((classElement: ts.ClassElement): boolean => {
            switch (classElement.kind) {
                case ts.SyntaxKind.MethodDeclaration:
                case ts.SyntaxKind.GetAccessor:
                case ts.SyntaxKind.SetAccessor:
                    return !AstUtils.isStatic(classElement);
                default:
                    return false;
            }
        });
    }

    @Memoize
    public get name() {
        return this.node.name == null ? '<unknown>' : this.node.name.text;
    }

}

class ClassMethodWalker extends Lint.SyntaxWalker {

    public dependencies: MethodDependencies = {};

    protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
        const isOnThis = node.expression.kind === ts.SyntaxKind.ThisKeyword;
        if (isOnThis) {
            const field = node.name.text;
            // console.log('visitPropertyAccessExpression:', field, node.expression); // tslint:disable-line no-console
            this.dependencies[field] = true;
        }
        super.visitPropertyAccessExpression(node);
    }

    protected visitBindingElement(node: ts.BindingElement): void {
        const isOnThis = node.parent.parent.initializer.kind === ts.SyntaxKind.ThisKeyword;
        if (isOnThis) {
            const field = node.name.getText();
            // console.log('visitBindingElement:', field); // tslint:disable-line no-console
            this.dependencies[field] = true;
        }
        super.visitBindingElement(node);
    }

}

interface MethodDependenciesMap {
    [methodName: string]: MethodDependencies;
}

interface MethodDependencies {
    [dependencyMethodName: string]: true;
}

type ToposortGraph = string[][];