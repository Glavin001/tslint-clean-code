import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { AstUtils } from './utils/AstUtils';
import { Utils } from './utils/Utils';
import { ExtendedMetadata } from './utils/ExtendedMetadata';
import { DirectedAcyclicGraph } from './utils/DirectedAcyclicGraph';
import * as Memoize from 'memoize-decorator';

export const FAILURE_CLASS_STRING: string = 'The class does not read like a Newspaper. Reorder the methods of the class: ';
export const FAILURE_FILE_STRING: string = 'The functions in the file do not read like a Newspaper. Reorder the functions in the file: ';
export const FAILURE_BLOCK_STRING: string = 'The functions in the block do not read like a Newspaper. Reorder the functions in the block: ';

/**
 * Implementation of the newspaper-order rule.
 */
export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: ExtendedMetadata = {
        ruleName: 'newspaper-order',
        type: 'maintainability',
        description:
            'We would like a source file to be like a newspaper article. ' +
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
        recommendation: 'true,',
        commonWeaknessEnumeration: '',
    };

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NewspaperOrderRuleWalker(sourceFile, this.getOptions()));
    }
}

class NewspaperOrderRuleWalker extends ErrorTolerantWalker {
    protected visitBlock(node: ts.Block): void {
        const blockNode = new BlockHelper(node);
        this.checkAndReportFailure(blockNode, FAILURE_BLOCK_STRING);
        super.visitBlock(node);
    }

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
        const help: string =
            '\n\nMethods order:\n' +
            completeOrderedMethodNames
                .map((method, index) => {
                    const isCorrect = methodNames[index] === method;
                    const status = isCorrect ? correctSymbol : incorrectSymbol;
                    return `${index + 1}. ${status} ${method}`;
                })
                .join('\n');
        return failureString + nodeName + help;
    }

    private readsLikeNewspaper(nodeHelper: NewspaperHelper): boolean {
        return nodeHelper.readsLikeNewspaper;
    }
}

abstract class NewspaperHelper {
    constructor(protected node: ts.Node) {}

    @Memoize
    public get readsLikeNewspaper(): boolean {
        // console.log('====================='); // tslint:disable-line no-console
        // console.log('Node: ', nodeName); // tslint:disable-line no-console
        const { methodNames, completeOrderedMethodNames, ignoredMethods } = this;
        const ignoringAllMethods: boolean = ignoredMethods.length === methodNames.length;
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
            return orderedMethodNames.indexOf(methodName) === -1;
        });
    }

    @Memoize
    private get orderedMethodNames(): string[] {
        const { methodGraph, methodNames } = this;
        try {
            const top = new TopologicalSortUtil(methodGraph);
            return top.closestList(methodNames);
        } catch (error) {
            return [];
        }
    }

    @Memoize
    private get methodGraph(): DependencyGraph {
        const { methodDependencies } = this;
        // console.log('methodDependencies:', methodDependencies); // tslint:disable-line no-console
        return Object.keys(methodDependencies)
            .sort()
            .reduce(
                (graph: DependencyGraph, methodName: string) => {
                    const deps = Object.keys(methodDependencies[methodName]).sort();
                    deps.forEach(depName => {
                        const shouldIgnore: boolean = !methodDependencies.hasOwnProperty(depName) || methodName === depName;
                        // console.log('shouldIgnore:', shouldIgnore, methodName, depName); // tslint:disable-line no-console
                        if (shouldIgnore) {
                            return;
                        }
                        const edge = [methodName, depName];
                        graph.push(edge);
                    });
                    // console.log('graph:', graph); // tslint:disable-line no-console
                    return graph;
                },
                <DependencyGraph>[]
            );
    }

    @Memoize
    private get methodDependencies(): MethodDependenciesMap {
        return this.methods.reduce(
            (result, method) => {
                result[method.name.getText()] = this.dependenciesForMethod(method);
                return result;
            },
            <MethodDependenciesMap>{}
        );
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
        return <ts.MethodDeclaration[]>this.node.members.filter(
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

    @Memoize
    public get nodeName() {
        return this.node.name == null ? '<unknown>' : this.node.name.text;
    }
}

abstract class BlockLikeHelper extends NewspaperHelper {
    constructor(protected node: ts.BlockLike) {
        super(node);
    }

    @Memoize
    protected get methods(): ts.FunctionDeclaration[] {
        const functionDeclarations = <ts.FunctionDeclaration[]>(
            this.node.statements.filter((node: ts.Statement): boolean => ts.isFunctionDeclaration(node))
        );
        const variableStatements = <ts.VariableStatement[]>(
            this.node.statements.filter((node: ts.Statement): boolean => ts.isVariableStatement(node))
        );
        const variableFunctionDeclarations: ts.FunctionDeclaration[] = variableStatements
            .map(node => node.declarationList.declarations)
            .map(declarations => declarations.map(this.createFuncDeclarFromVarDeclar).filter(node => node))
            .reduce((result, item) => [...result, ...item], []);
        return [...functionDeclarations, ...variableFunctionDeclarations];
    }

    private createFuncDeclarFromVarDeclar(declaration: ts.VariableDeclaration): ts.FunctionDeclaration | null {
        const { name, initializer } = declaration;
        if (ts.isIdentifier(name) && ts.isFunctionExpression(initializer)) {
            const node = ts.createFunctionDeclaration([], [], undefined, name, [], [], undefined, initializer.body);
            node.pos = declaration.pos;
            node.end = declaration.end;
            return node;
        }
        return null;
    }

    protected dependenciesForMethod(method: ts.FunctionDeclaration): MethodDependencies {
        const walker = new FunctionWalker();
        walker.walk(method);
        return walker.dependencies;
    }
}

class SourceFileHelper extends BlockLikeHelper {
    constructor(protected node: ts.SourceFile) {
        super(node);
    }

    @Memoize
    public get nodeName() {
        return this.node.fileName == null ? '<unknown>' : this.node.fileName;
    }
}

class BlockHelper extends BlockLikeHelper {
    constructor(protected node: ts.Block) {
        super(node);
    }

    @Memoize
    public get nodeName() {
        const { node } = this;
        if (node.parent) {
            if (node.parent.kind === ts.SyntaxKind.FunctionDeclaration) {
                return (<ts.FunctionDeclaration>node.parent).name.getText() || '<anonymous>';
            }
        }
        return '<anonymous>';
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
        if (node.expression.kind === ts.SyntaxKind.Identifier) {
            const field = node.expression.getText();
            this.dependencies[field] = true;
        }
        if (Array.isArray(node.arguments)) {
            node.arguments.forEach(arg => {
                if (arg.kind === ts.SyntaxKind.Identifier) {
                    this.dependencies[arg.getText()] = true;
                }
            });
        }
        super.visitCallExpression(node);
    }
}

interface MethodDependenciesMap {
    [methodName: string]: MethodDependencies;
}

interface MethodDependencies {
    [dependencyMethodName: string]: true;
}

type DependencyGraph = string[][];

class TopologicalSortUtil {
    constructor(private graph: DependencyGraph) {}

    public closestList(currentList: string[]): string[] {
        if (currentList.length === 0) {
            return [];
        }
        const { allLists } = this;
        if (allLists.length === 0) {
            return [];
        }
        let bestList: string[] = [];
        let bestDistance: number = Infinity;
        allLists.forEach(list => {
            const dist = this.distanceBetweenLists(currentList, list);
            if (dist < bestDistance) {
                bestDistance = dist;
                bestList = list;
            }
        });
        // console.log('closestList', bestList, bestDistance, currentList, allLists, this.graph); // tslint:disable-line no-console
        return bestList;
    }

    private distanceBetweenLists(srcList: string[], destList: string[]): number {
        const positionMap = destList.reduce((result, key, index) => {
            result[key] = index;
            return result;
        }, {});
        return srcList.reduce((total, key, index) => {
            const destIndex: number | undefined = positionMap[key];
            if (destIndex) {
                return total + Math.abs(destIndex - index);
            }
            return total;
        }, 0);
    }

    @Memoize
    private get allLists(): string[][] {
        const { dag, list } = this;
        // console.log('list', list); // tslint:disable-line no-console
        const indexMap: { [index: number]: string } = list.reduce((result, key, index) => {
            result[index] = key;
            return result;
        }, {});
        return dag.alltopologicalSort().map(currList => {
            return currList.map(index => indexMap[index]);
        });
    }

    @Memoize
    private get dag(): DirectedAcyclicGraph {
        const { graph, list } = this;
        const positionMap = list.reduce((result, key, index) => {
            result[key] = index;
            return result;
        }, {});
        const dag: DirectedAcyclicGraph = new DirectedAcyclicGraph(list.length);
        graph.forEach(([from, to]) => {
            const ai = positionMap[from];
            const bi = positionMap[to];
            dag.addEdge(ai, bi);
        });
        return dag;
    }

    @Memoize
    private get list() {
        const { graph } = this;
        const index: { [key: string]: true } = {};
        graph.forEach(([from, to]) => {
            index[from] = true;
            index[to] = true;
        });
        return Object.keys(index);
    }
}
