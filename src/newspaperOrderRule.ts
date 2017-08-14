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
        if (!this.readsLikeNewspaper(node)) {
            const className: string = node.name == null ? '<unknown>' : node.name.text;
            this.addFailureAt(node.getStart(), node.getWidth(), FAILURE_STRING + className);
        }
        super.visitClassDeclaration(node);
    }

    private readsLikeNewspaper(node: ts.ClassDeclaration): boolean {
        const classNode = new ClassDeclarationHelper(node);
        return classNode.readsLikeNewspaper;
    }

}

class ClassDeclarationHelper {
    constructor(private node: ts.ClassDeclaration) {
    }

    @Memoize
    public get readsLikeNewspaper(): boolean {
        console.log('====================='); // tslint:disable-line no-console
        console.log('Class: ', this.name); // tslint:disable-line no-console
        const { methodNames, orderedMethodNames, ignoredMethods } = this;
        const completeOrderedMethodNames = orderedMethodNames.concat(ignoredMethods);
        const ignoringAllMethods: boolean = (ignoredMethods.length === methodNames.length);
        const hasNoDeps: boolean = completeOrderedMethodNames.length === 0;
        if (ignoringAllMethods || hasNoDeps) {
            return true;
        }
        const isOrdered = Utils.arraysShallowEqual(methodNames, completeOrderedMethodNames);
        console.log('methodNames:', methodNames); // tslint:disable-line no-console
        console.log('orderedMethodNames:', completeOrderedMethodNames); // tslint:disable-line no-console
        return isOrdered;
    }

    @Memoize
    public get ignoredMethods(): string[] {
        const { methodNames, orderedMethodNames } = this;
        const ignoredMethods = methodNames.filter(methodName => {
           return !Utils.contains(orderedMethodNames, methodName);
        }).sort();
        console.log('ignoredMethods:', ignoredMethods); // tslint:disable-line no-console
        return ignoredMethods;
    }

    @Memoize
    public get methodNames(): string[] {
        return this.methods.map(method => method.name.getText());
    }

    @Memoize
    public get orderedMethodNames(): string[] {
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
        console.log('methodDependencies:', methodDependencies); // tslint:disable-line no-console
        return Object.keys(methodDependencies).sort().reduce((graph: ToposortGraph, methodName: string) => {
            const deps = Object.keys(methodDependencies[methodName]).sort();
            deps.forEach(depName => {
                const shouldIgnore: boolean = !Boolean(methodDependencies[depName]) || (methodName === depName);
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
            console.log('visitBindingElement:', field); // tslint:disable-line no-console
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