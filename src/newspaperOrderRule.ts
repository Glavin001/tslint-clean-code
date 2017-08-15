import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { AstUtils } from './utils/AstUtils';
import { Utils } from './utils/Utils';
import { ExtendedMetadata } from './utils/ExtendedMetadata';
import * as toposort from 'toposort';
import * as Memoize from 'memoize-decorator';

export const FAILURE_CLASS_STRING: string = 'The class does not read like a Newspaper. Reorder the methods of the class: ';
export const FAILURE_FILE_STRING: string = 'The functions of the file do not read like a Newspaper. Reorder the functions in the file: ';

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
        this.checkAndReportFailure(classNode, FAILURE_CLASS_STRING);
        super.visitClassDeclaration(node);
    }

    protected visitSourceFile(node: ts.SourceFile): void {
        const sourceNode = new SourceFileHelper(node);
        this.checkAndReportFailure(sourceNode, FAILURE_FILE_STRING);
        super.visitSourceFile(node);
    }

    private checkAndReportFailure(nodeHelper: NewspaperHelper, failureString: string) {
        if (!this.readsLikeNewspaper(nodeHelper)) {
            const failureMessage = this.makeClassFailureMessage(nodeHelper, failureString);
            this.addFailureAt(nodeHelper.start, nodeHelper.width, failureMessage);
        }
    }

    private makeClassFailureMessage(nodeHelper: NewspaperHelper, failureString: string): string {
        const { nodeName, completeOrderedMethodNames, methodNames } = nodeHelper;
        const correctSymbol = '✓';
        const incorrectSymbol = 'x';
        const help: string = '\n\nMethods order:\n' +
            completeOrderedMethodNames.map((method, index) => {
                const isCorrect = methodNames[index] === method;
                const status = isCorrect ? correctSymbol : incorrectSymbol;
                return `${index + 1}. ${status} ${method}`;
            }).join('\n');
        return failureString + nodeName + help;
    }

    private readsLikeNewspaper(nodeHelper: NewspaperHelper): boolean {
        return nodeHelper.readsLikeNewspaper;
    }

}

abstract class NewspaperHelper {
    constructor(protected node: ts.Node) {
    }

    @Memoize
    public get readsLikeNewspaper(): boolean {
        // console.log('====================='); // tslint:disable-line no-console
        // console.log('Node: ', nodeName); // tslint:disable-line no-console
        const { methodNames, completeOrderedMethodNames, ignoredMethods } = this;
        const ignoringAllMethods: boolean = (ignoredMethods.length === methodNames.length);
        const hasNoDeps: boolean = completeOrderedMethodNames.length === 0;
        // console.log('ignoredMethods:', ignoredMethods); // tslint:disable-line no-console
        // console.log('methodNames:', methodNames); // tslint:disable-line no-console
        // console.log('orderedMethodNames:', completeOrderedMethodNames); // tslint:disable-line no-console
        if (ignoringAllMethods || hasNoDeps) {
            return true;
        }
        return Utils.arraysShallowEqual(methodNames, completeOrderedMethodNames);
    }

    public get width(): number {
        return this.end - this.start;
    }

    @Memoize
    private get end(): number {
        const len = this.incorrectMethodNames.length;
        const lastIncorrectFunctionName: string | undefined = len > 0 ? this.incorrectMethodNames[len - 1] : undefined;
        if (lastIncorrectFunctionName) {
            const lastIncorrectFunction = this.methodForName(lastIncorrectFunctionName);
            return lastIncorrectFunction.getEnd();
        }
        return this.node.getEnd();
    }

    @Memoize
    public get start(): number {
        const firstIncorrectFunctionName: string | undefined = this.incorrectMethodNames[0];
        if (firstIncorrectFunctionName) {
            const firstIncorrectFunction = this.methodForName(firstIncorrectFunctionName);
            return firstIncorrectFunction.getStart();
        }
        return this.node.getStart();
    }

    @Memoize
    protected get incorrectMethodNames(): string[] {
        const { completeOrderedMethodNames, methodNames } = this;
        return methodNames.filter((methodName, index) => {
            return methodName !== completeOrderedMethodNames[index];
        });
    }

    @Memoize
    public get completeOrderedMethodNames(): string[] {
        const { orderedMethodNames, ignoredMethods } = this;
        return orderedMethodNames.concat(ignoredMethods);
    }

    @Memoize
    protected get ignoredMethods(): string[] {
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

    protected abstract dependenciesForMethod(method: ts.FunctionLikeDeclaration): MethodDependencies;

    @Memoize
    public get methodNames(): string[] {
        return this.methods.map(method => method.name.getText());
    }

    protected methodForName(methodName: string): ts.FunctionLikeDeclaration {
        return this.methodsIndex[methodName];
    }

    @Memoize
    protected get methodsIndex(): { [methodName: string]: ts.FunctionLikeDeclaration } {
        return this.methods.reduce((index, method) => {
            const name = method.name.getText();
            index[name] = method;
            return index;
        }, {});
    }

    protected abstract get methods(): ts.FunctionLikeDeclaration[];

    abstract get nodeName(): string;

}

class ClassDeclarationHelper extends NewspaperHelper {
    constructor(protected node: ts.ClassDeclaration) {
        super(node);
    }

    protected dependenciesForMethod(method: ts.MethodDeclaration): MethodDependencies {
        const walker = new ClassMethodWalker();
        walker.walk(method);
        return walker.dependencies;
    }

    @Memoize
    protected get methods(): ts.MethodDeclaration[] {
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
    public get nodeName() {
        return this.node.name == null ? '<unknown>' : this.node.name.text;
    }

}

class SourceFileHelper extends NewspaperHelper {
    constructor(protected node: ts.SourceFile) {
        super(node);
    }

    protected dependenciesForMethod(method: ts.FunctionDeclaration): MethodDependencies {
        const walker = new FunctionWalker();
        walker.walk(method);
        return walker.dependencies;
    }

    @Memoize
    protected get methods(): ts.FunctionDeclaration[] {
        return <ts.FunctionDeclaration[]>this.node.statements.filter((node: ts.FunctionDeclaration): boolean => {
            switch (node.kind) {
                case ts.SyntaxKind.FunctionDeclaration:
                    return true;
                default:
                    return false;
            }
        });
    }

    @Memoize
    public get nodeName() {
        return this.node.fileName == null ? '<unknown>' : this.node.fileName;
    }

}

class ClassMethodWalker extends Lint.SyntaxWalker {

    public dependencies: MethodDependencies = {};

    protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
        const isOnThis = node.expression.kind === ts.SyntaxKind.ThisKeyword;
        if (isOnThis) {
            const field = node.name.text;
            this.dependencies[field] = true;
        }
        super.visitPropertyAccessExpression(node);
    }

    protected visitBindingElement(node: ts.BindingElement): void {
        const isOnThis = node.parent.parent.initializer.kind === ts.SyntaxKind.ThisKeyword;
        if (isOnThis) {
            const field = node.name.getText();
            this.dependencies[field] = true;
        }
        super.visitBindingElement(node);
    }

}

class FunctionWalker extends Lint.SyntaxWalker {

    public dependencies: MethodDependencies = {};

    protected visitCallExpression(node: ts.CallExpression): void {
        const field = node.expression.getText();
        this.dependencies[field] = true;
        super.visitCallExpression(node);
    }

}

interface MethodDependenciesMap {
    [methodName: string]: MethodDependencies;
}

interface MethodDependencies {
    [dependencyMethodName: string]: true;
}

type ToposortGraph = string[][];
