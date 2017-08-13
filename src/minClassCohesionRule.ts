import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { AstUtils } from './utils/AstUtils';
import { ExtendedMetadata } from './utils/ExtendedMetadata';

const FAILURE_STRING: string = 'The cohesion of the class is too low. This indicates a failure in the object model: ';

/**
 * Implementation of the min-class-cohesion rule.
 */
export class Rule extends Lint.Rules.AbstractRule {

    public static metadata: ExtendedMetadata = {
        ruleName: 'min-class-cohesion',
        type: 'maintainability',
        description: 'High cohesion means the methods and variables of the class are co-dependent and hang together as a logical whole.',
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
        return this.applyWithWalker(new MinClassCohesionRuleWalker(sourceFile, this.getOptions()));
    }
}

class MinClassCohesionRuleWalker extends ErrorTolerantWalker {
    private minClassCohesion: number = 0.5;

    constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
        super(sourceFile, options);
        this.parseOptions();
    }

    protected visitClassDeclaration(node: ts.ClassDeclaration): void {
        if (!this.isClassCohesive(node)) {
            const className: string = node.name == null ? '<unknown>' : node.name.text;
            this.addFailureAt(node.getStart(), node.getWidth(), FAILURE_STRING + className);
        }
        super.visitClassDeclaration(node);
    }

    private isClassCohesive(node: ts.ClassDeclaration): boolean {
        const classNode = new ClassDeclarationHelper(node);
        const { cohesionScore } = classNode;
        console.log('Cohesion:', cohesionScore); // tslint:disable-line no-console
        return (cohesionScore >= this.minClassCohesion);
    }

    private parseOptions(): void {
        this.getOptions().forEach((opt: any) => {
            if (typeof (opt) === 'boolean') {
                return;
            }
            if (typeof (opt) === 'number') {
                this.minClassCohesion = opt;
                return;
            }
            throw new Error(`Rule min-class-cohesion only supports option of type number, not ${typeof opt}.`);
        });
    }

}

class ClassDeclarationHelper {
    constructor(private node: ts.ClassDeclaration) {
    }

    private get name() {
        return this.node.name == null ? '<unknown>' : this.node.name.text;
    }

    public get cohesionScore(): number {
        const { fieldNames, methods } = this;
        console.log('Class:', this.name); // tslint:disable-line no-console
        console.log('Field names:', fieldNames); // tslint:disable-line no-console
        // console.log('Methods:', methods); // tslint:disable-line no-console
        if (methods.length === 0) {
            return 1.0;
        }
        const numFields = fieldNames.length;
        if (numFields === 0) {
            return 0.0;
        }
        const methodScores = methods.map(method => {
            const used = this.numberOfFieldsUsedByMethod(method);
            return used / numFields;
        });
        const sumScores = methodScores.reduce((a, b) => a + b, 0);
        const avgScore = sumScores / methodScores.length;
        console.log('Average score:', avgScore); // tslint:disable-line no-console
        return avgScore;
    }

    private get fieldNames(): string[] {
        const parameterNames: string[] = this.constructorParameterNames;
        const instanceFields: string[] = this.instanceFieldNames;
        return [...parameterNames, ...instanceFields];
    }

    private get constructorParameterNames(): string[] {
        return this.constructorParameters.map(param => param.name.getText());
    }

    private get constructorDeclaration(): ts.ConstructorDeclaration | undefined {
        return <ts.ConstructorDeclaration>this.node.members.find((element: ts.ClassElement): boolean =>
            (element.kind === ts.SyntaxKind.Constructor)
        );
    }

    private get constructorParameters(): ts.ParameterDeclaration[] {
        const ctor: ts.ConstructorDeclaration = this.constructorDeclaration;
        if (ctor) {
            return ctor.parameters.filter((param: ts.ParameterDeclaration): boolean => {
                return AstUtils.hasModifier(param.modifiers, ts.SyntaxKind.PublicKeyword)
                    || AstUtils.hasModifier(param.modifiers, ts.SyntaxKind.PrivateKeyword)
                    || AstUtils.hasModifier(param.modifiers, ts.SyntaxKind.ProtectedKeyword)
                    || AstUtils.hasModifier(param.modifiers, ts.SyntaxKind.ReadonlyKeyword);
            });
        }
        return [];
    }

    private get instanceFieldNames(): string[] {
        return this.instanceFields.map(param => param.name.getText());
    }

    private get instanceFields(): ts.PropertyDeclaration[] {
        return <ts.PropertyDeclaration[]>this.node.members.filter((classElement: ts.ClassElement): boolean =>
            (classElement.kind === ts.SyntaxKind.PropertyDeclaration)
        );
    }

    private get methods(): ts.MethodDeclaration[] {
        return <ts.MethodDeclaration[]>this.node.members.filter((classElement: ts.ClassElement): boolean =>
            (classElement.kind === ts.SyntaxKind.MethodDeclaration)
        );
    }

    private numberOfFieldsUsedByMethod(method: ts.MethodDeclaration): number {
        const fields = this.fieldsUsedByMethod(method);
        return Object.keys(fields).length;
    }

    private fieldsUsedByMethod(method: ts.MethodDeclaration): FieldsUsageMap {
        const walker = new ClassMethodWalker();
        walker.walk(method);
        return walker.fieldsUsed;
    }

}

class ClassMethodWalker extends Lint.SyntaxWalker {

    public fieldsUsed: FieldsUsageMap = {};

    protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
        const isOnThis = node.expression.kind === ts.SyntaxKind.ThisKeyword;
        if (isOnThis) {
            const field = node.name.text;
            // console.log('visitPropertyAccessExpression:', field, node.expression); // tslint:disable-line no-console
            this.fieldsUsed[field] = true;
        }
        super.visitPropertyAccessExpression(node);
    }

}

interface FieldsUsageMap {
    [field: string]: boolean;
}