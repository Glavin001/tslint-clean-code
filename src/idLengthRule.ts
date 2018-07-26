import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { ExtendedMetadata } from './utils/ExtendedMetadata';

export const FAILURE_MIN_STRING: string = 'Too short; difficult to understand its purpose without context';
export const FAILURE_MAX_STRING: string = 'Too long; difficult to read and potentially less maintainable';

const OPTION_MIN_STRING: string = 'min';
const OPTION_MAX_STRING: string = 'max';
const OPTION_EXCEPTIONS_STRING: string = 'exceptions';

/**
 * Implementation of the id-length rule.
 */
export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: ExtendedMetadata = {
        ruleName: 'id-length',
        type: 'maintainability',
        description: 'This rule enforces a minimum and/or maximum identifier length convention.',
        options: {
            definitions: {
                'minimum-length': {
                    type: 'integer',
                    minimum: 1,
                    default: 2,
                },
                'maximum-length': {
                    type: 'integer',
                    minimum: 1,
                },
                exceptions: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    minLength: 0,
                    uniqueItems: true,
                },
            },
            type: 'array',
            items: {
                type: 'array',
                items: {
                    oneOf: [
                        {
                            title: 'Only the minimum length',
                            $ref: '#/definitions/minimum-length',
                        },
                        {
                            title: 'Only the exceptions array',
                            $ref: '#/definitions/exceptions',
                        },
                        {
                            title: 'Configuration object',
                            type: 'object',
                            properties: {
                                min: { $ref: '#/definitions/minimum-length' },
                                max: { $ref: '#/definitions/maximum-length' },
                                exceptions: { $ref: '#/definitions/exceptions' },
                            },
                            additionalProperties: false,
                            minProperties: 1,
                        },
                    ],
                },
                minItems: 1,
                maxItems: 1,
            },
        },
        optionsDescription: `
            One of the following combinations can be provided:
            * Minimum desired length.
            * An array of exceptions.
            * Minimum desired length and an exceptions array.
            * A configuration object containing at least one of the following properties:
                * \`"${OPTION_MIN_STRING}"\`
                * \`"${OPTION_MAX_STRING}"\`
                * \`"${OPTION_EXCEPTIONS_STRING}"\`
        `,
        optionExamples: <any>[
            [true],
            [true, 2],
            [true, ['x', 'y', 'f', 'c']],
            [true, 2, ['x', 'y', 'f', 'c']],
            [
                true,
                {
                    min: 2,
                    max: 10,
                    exceptions: ['x', 'y', 'f', 'c'],
                },
            ],
        ],
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
        return this.applyWithWalker(new IdLengthRuleWalker(sourceFile, this.getOptions()));
    }
}

class IdLengthRuleWalker extends ErrorTolerantWalker {
    private min: number = 2;
    private max: number = Infinity;
    private exceptions: string[] = [];

    constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
        super(sourceFile, options);
        this.parseOptions();
    }

    protected visitIdentifier(node: ts.Identifier): void {
        this.checkAndReport(node);
        super.visitIdentifier(node);
    }

    private checkAndReport(node: ts.Identifier): void {
        const { text } = node;
        if (this.exceptions.indexOf(text) === -1) {
            if (text.length < this.min) {
                return this.addFailureAt(node.getStart(), node.getWidth(), FAILURE_MIN_STRING + ': ' + text);
            }
            if (text.length > this.max) {
                return this.addFailureAt(node.getStart(), node.getWidth(), FAILURE_MAX_STRING + ': ' + text);
            }
        }
    }

    private parseOptions(): void {
        this.getOptions().forEach((opt: any) => {
            if (typeof opt === 'boolean') {
                return;
            }
            if (typeof opt === 'number') {
                this.min = opt;
                return;
            }
            if (Array.isArray(opt)) {
                this.exceptions = opt;
                return;
            }
            if (typeof opt === 'object') {
                this.min = typeof opt[OPTION_MIN_STRING] === 'number' ? opt[OPTION_MIN_STRING] : this.min;
                this.max = typeof opt[OPTION_MAX_STRING] === 'number' ? opt[OPTION_MAX_STRING] : this.max;
                this.exceptions = opt[OPTION_EXCEPTIONS_STRING] || this.exceptions;
                return;
            }
        });
    }
}
