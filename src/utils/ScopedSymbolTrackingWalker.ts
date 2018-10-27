// tslint:disable try-catch-first
import * as ts from 'typescript';
import * as Lint from 'tslint';
import { ErrorTolerantWalker } from './ErrorTolerantWalker';
import { AstUtils } from './AstUtils';
import { Scope } from './Scope';

/**
 * This exists so that you can try to tell the types of variables
 * and identifiers in the current scope. It builds the current scope
 * from the SourceFile then -> Module -> Class -> Function
 */
export class ScopedSymbolTrackingWalker extends ErrorTolerantWalker {
    private typeChecker?: ts.TypeChecker;
    private scope: Scope;

    constructor(sourceFile: ts.SourceFile, options: Lint.IOptions, program?: ts.Program) {
        super(sourceFile, options);

        if (program) {
            this.typeChecker = program.getTypeChecker();
        }
    }

    protected isExpressionEvaluatingToFunction(expression: ts.Expression): boolean {
        if (expression.kind === ts.SyntaxKind.ArrowFunction || expression.kind === ts.SyntaxKind.FunctionExpression) {
            return true; // arrow function literals and arrow functions are definitely functions
        }

        const isString =
            expression.kind === ts.SyntaxKind.StringLiteral ||
            expression.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral ||
            expression.kind === ts.SyntaxKind.TemplateExpression ||
            expression.kind === ts.SyntaxKind.TaggedTemplateExpression;
        if (isString || expression.kind === ts.SyntaxKind.BinaryExpression) {
            return false; // strings and binary expressions are definitely not functions
        }

        // is the symbol something we are tracking in scope ourselves?
        if (this.scope.isFunctionSymbol(expression.getText())) {
            return true;
        }

        if (expression.kind === ts.SyntaxKind.Identifier && this.typeChecker) {
            const tsSymbol = this.typeChecker.getSymbolAtLocation(expression);
            if (tsSymbol && tsSymbol.flags === ts.SymbolFlags.Function) {
                return true; // variables with type function are OK to pass
            }
            return false;
        }

        if (expression.kind === ts.SyntaxKind.CallExpression) {
            // calling Function.bind is a special case that makes tslint throw an exception
            if ((<any>expression).expression.name && (<any>expression).expression.name.getText() === 'bind') {
                return true; // for now assume invoking a function named bind returns a function. Follow up with tslint.
            }

            try {
                // seems like another tslint error of some sort
                if (!this.typeChecker) {
                    return true;
                }

                const signature: ts.Signature = this.typeChecker.getResolvedSignature(<ts.CallExpression>expression);
                const expressionType: ts.Type = this.typeChecker.getReturnTypeOfSignature(signature);
                return this.isFunctionType(expressionType, this.typeChecker);
            } catch (error) {
                // this exception is only thrown in unit tests, not the node debugger :(
                return false;
            }
        }

        if (!this.typeChecker) {
            return true;
        }

        return this.isFunctionType(this.typeChecker.getTypeAtLocation(expression), this.typeChecker);
    }

    private isFunctionType(expressionType: ts.Type, typeChecker: ts.TypeChecker): boolean {
        const signatures: ts.Signature[] = typeChecker.getSignaturesOfType(expressionType, ts.SignatureKind.Call);
        if (signatures != null && signatures.length > 0) {
            const signatureDeclaration: ts.SignatureDeclaration = signatures[0].declaration;
            if (signatureDeclaration.kind === ts.SyntaxKind.FunctionType) {
                return true; // variables of type function are allowed to be passed as parameters
            }
        }
        return false;
    }

    protected visitArrowFunction(node: ts.ArrowFunction): void {
        this.scope = new Scope(this.scope);
        this.scope.addParameters(node.parameters);
        super.visitArrowFunction(node);
        this.scope = this.scope.parent;
    }

    protected visitClassDeclaration(node: ts.ClassDeclaration): void {
        this.scope = new Scope(this.scope);
        node.members.forEach(
            (element: ts.ClassElement): void => {
                const prefix: string = AstUtils.isStatic(element) ? node.name.getText() + '.' : 'this.';

                if (element.kind === ts.SyntaxKind.MethodDeclaration) {
                    // add all declared methods as valid functions
                    this.scope.addFunctionSymbol(prefix + (<ts.MethodDeclaration>element).name.getText());
                } else if (element.kind === ts.SyntaxKind.PropertyDeclaration) {
                    const prop: ts.PropertyDeclaration = <ts.PropertyDeclaration>element;
                    // add all declared function properties as valid functions
                    if (AstUtils.isDeclarationFunctionType(prop)) {
                        this.scope.addFunctionSymbol(prefix + (<ts.MethodDeclaration>element).name.getText());
                    } else {
                        this.scope.addNonFunctionSymbol(prefix + (<ts.MethodDeclaration>element).name.getText());
                    }
                }
            }
        );
        super.visitClassDeclaration(node);
        this.scope = this.scope.parent;
    }

    protected visitConstructorDeclaration(node: ts.ConstructorDeclaration): void {
        this.scope = new Scope(this.scope);
        this.scope.addParameters(node.parameters);
        super.visitConstructorDeclaration(node);
        this.scope = this.scope.parent;
    }

    protected visitFunctionDeclaration(node: ts.FunctionDeclaration): void {
        this.scope = new Scope(this.scope);
        this.scope.addParameters(node.parameters);
        super.visitFunctionDeclaration(node);
        this.scope = this.scope.parent;
    }

    protected visitFunctionExpression(node: ts.FunctionExpression): void {
        this.scope = new Scope(this.scope);
        this.scope.addParameters(node.parameters);
        super.visitFunctionExpression(node);
        this.scope = this.scope.parent;
    }

    protected visitMethodDeclaration(node: ts.MethodDeclaration): void {
        this.scope = new Scope(this.scope);
        this.scope.addParameters(node.parameters);
        super.visitMethodDeclaration(node);
        this.scope = this.scope.parent;
    }

    protected visitModuleDeclaration(node: ts.ModuleDeclaration): void {
        this.scope = new Scope(this.scope);
        this.scope.addGlobalScope(node.body, this.getSourceFile(), this.getOptions());
        super.visitModuleDeclaration(node);
        this.scope = this.scope.parent;
    }

    protected visitSetAccessor(node: ts.AccessorDeclaration): void {
        this.scope = new Scope(this.scope);
        this.scope.addParameters(node.parameters);
        super.visitSetAccessor(node);
        this.scope = this.scope.parent;
    }

    protected visitSourceFile(node: ts.SourceFile): void {
        this.scope = new Scope(null);
        this.scope.addGlobalScope(node, node, this.getOptions());
        super.visitSourceFile(node);
        this.scope = null;
    }
}
