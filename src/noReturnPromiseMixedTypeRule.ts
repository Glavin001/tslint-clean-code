import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ExtendedMetadata } from './utils/ExtendedMetadata';

/**
 * Implementation of the no-return-promise-mixed-type rule.
 */
export class Rule extends Lint.Rules.TypedRule {

    public static metadata: ExtendedMetadata = {
        ruleName: 'no-return-promise-mixed-type',
        type: 'maintainability',    // one of: 'functionality' | 'maintainability' | 'style' | 'typescript'
        description: '... add a meaningful one line description',
        options: null,
        optionsDescription: '',
        optionExamples: [],         //Remove this property if the rule has no options
        typescriptOnly: true,
        issueClass: 'Non-SDL',      // one of: 'SDL' | 'Non-SDL' | 'Ignored'
        issueType: 'Warning',       // one of: 'Error' | 'Warning'
        severity: 'Low',            // one of: 'Critical' | 'Important' | 'Moderate' | 'Low'
        level: 'Opportunity for Excellence',  // one of 'Mandatory' | 'Opportunity for Excellence'
        group: 'Correctness',  // one of 'Ignored' | 'Security' | 'Correctness' | 'Clarity' | 'Whitespace' | 'Configurable' | 'Deprecated'
        commonWeaknessEnumeration: '' // if possible, please map your rule to a CWE (see cwe_descriptions.json and https://cwe.mitre.org)
    };

    public static FAILURE_STRING(): string {
        return '';
    }

    public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, (ctx: Lint.WalkContext<void>) => walk(ctx, program.getTypeChecker()));
    }
}

function walk(ctx: Lint.WalkContext<void>, tc: ts.TypeChecker) {
    const cb = (node): void => {
        const isEmptyFunction = ((node.kind === ts.SyntaxKind.FunctionDeclaration) &&
            ((<ts.FunctionLikeDeclaration>node).body === undefined));
        if (!isEmptyFunction) {
            switch (node.kind) {
                case ts.SyntaxKind.FunctionDeclaration:
                case ts.SyntaxKind.MethodDeclaration:
                case ts.SyntaxKind.FunctionExpression:
                case ts.SyntaxKind.ArrowFunction:
                    if (returnsPromise(<ts.FunctionLikeDeclaration>node, tc)) {
                        ctx.addFailure(node.getStart(ctx.sourceFile), (<ts.FunctionLikeDeclaration>node).body!.pos, Rule.FAILURE_STRING());
                    }
            }
        }
        return ts.forEachChild(node, cb);
    };
    return ts.forEachChild(ctx.sourceFile, cb);
}

// function returnsPromise(node: ts.FunctionLikeDeclaration, tc: ts.TypeChecker): boolean {
//     const returnType = tc.getReturnTypeOfSignature(tc.getTypeAtLocation(node).getCallSignatures()[0]);
//     console.log('returnType', returnType.symbol);
//     return returnType.symbol !== undefined && returnType.symbol.name === 'Promise';
// }

function returnsPromise(node: ts.FunctionLikeDeclaration, tc: ts.TypeChecker): boolean {
    // console.log('node', node.getText());
    const nodeType = tc.getTypeAtLocation(node);
    const signatures = nodeType.getCallSignatures();
    // const signatureTypes = signatures.map(signature => tc.getReturnTypeOfSignature(signature));
    const signatureTypes = signatures.map(signature => signature.getReturnType());
    // const signatureNames = signatureTypes.map(signatureType => signatureType.symbol !== undefined && signatureType.symbol.name);
    // const signatureNames = signatureTypes.map(signatureType => signatureType.getSymbol().getName());
    const signatureNames = signatureTypes.map(signatureType =>
        signatureType.symbol !== undefined && tc.symbolToString(signatureType.symbol)
    );
    // console.log('nodeType', nodeType);
    // console.log('signatures', signatures.length, signatures);
    // console.log('signatureTypes', signatureTypes.length, signatureTypes);
    console.log('signatureNames', signatureNames.length, signatureNames);
    const signatureType = tc.getReturnTypeOfSignature(signatures[0]);
    return signatureType.symbol !== undefined && signatureType.symbol.name === 'Promise';
}
