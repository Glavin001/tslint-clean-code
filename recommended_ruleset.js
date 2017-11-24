/**
 * These rule settings are a broad, general recommendation for a good default configuration.
 * This file is exported in the npm/nuget package as ./tslint.json.
 */
module.exports = {
    "rules": {

        /**
         * Security Rules. The following rules should be turned on because they find security issues
         * or are recommended in the Microsoft Secure Development Lifecycle (SDL)
         */
        "no-eval": true,

        /**
         * Common Bugs and Correctness. The following rules should be turned on because they find
         * common bug patterns in the code or enforce type safety.
         */
        "await-promise": true,
        "forin": true,
        "id-length": true,
        "label-position": true,
        "match-default-export-name": true,
        "max-func-args": [true, 3],
        "min-class-cohesion": [true, 0.5],
        "newspaper-order": true,
        "no-any": true,
        "no-arg": true,
        "no-bitwise": true,
        "no-conditional-assignment": true,
        "no-console": [true, "debug", "info", "log", "time", "timeEnd", "trace"],
        "no-debugger": true,
        "no-duplicate-super": true,
        "no-duplicate-variable": true,
        "no-empty": true,
        "no-flag-args": true,
        "no-floating-promises": true,
        "no-for-each-push": true,
        "no-for-in-array": true,
        "no-import-side-effect": true,
        "no-invalid-template-strings": true,
        "no-invalid-this": true,
        "no-map-without-usage": true,
        "no-misused-new": true,
        "no-non-null-assertion": true,
        "no-reference-import": true,
        "no-sparse-arrays": true,
        "no-string-literal": true,
        "no-string-throw": true,
        "no-unnecessary-callback-wrapper": true,
        "no-unnecessary-initializer": true,
        "no-unsafe-any": true,
        "no-unsafe-finally": true,
        "no-unused-expression": true,
        "no-use-before-declare": true,
        "promise-function-async": true,
        "radix": true,
        "restrict-plus-operands": true, // the plus operand should really only be used for strings and numbers
        "strict-boolean-expressions": true,
        "switch-default": true,
        "triple-equals": [true, "allow-null-check"],
        "try-catch-first": true,
        "use-isnan": true,

        /**
         * Code Clarity. The following rules should be turned on because they make the code
         * generally more clear to the reader.
         */
        "adjacent-overload-signatures": true,
        "array-type": [true, "array"],
        "arrow-parens": false, // for simple functions the parens on arrow functions are not needed
        "callable-types": true,
        "class-name": true,
        "comment-format": true,
        "completed-docs": [true, "classes"],
        "interface-name": true,
        "jsdoc-format": true,
        "max-classes-per-file": [true, 3],  // we generally recommend making one public class per file 
        "max-file-line-count": true,
        "max-line-length": [true, 140],
        "member-access": true,
        "member-ordering": [true, { "order": "fields-first" }],
        "new-parens": true,
        "no-commented-out-code": true,
        "no-complex-conditionals": true,
        "no-construct": true,
        "no-default-export": true,
        "no-empty-interface": true,
        "no-feature-envy": [true, 1, ["_"]],
        "no-inferrable-types": false, // turn no-inferrable-types off in order to make the code consistent in its use of type decorations
        "no-null-keyword": false, // turn no-null-keyword off and use undefined to mean not initialized and null to mean without a value
        "no-parameter-properties": true,
        "no-require-imports": true,
        "no-shadowed-variable": true,
        "no-unnecessary-qualifier": true,
        "no-var-keyword": true,
        "no-var-requires": true,
        "no-void-expression": true,
        "object-literal-sort-keys": false, // turn object-literal-sort-keys off and sort keys in a meaningful manner
        "one-variable-per-declaration": true,
        "only-arrow-functions": false,  // there are many valid reasons to declare a function
        "ordered-imports": true,
        "prefer-const": true,
        "prefer-dry-conditionals": true,
        "prefer-for-of": true,
        "prefer-method-signature": true,
        "prefer-template": true,
        "return-undefined": false, // this actually affect the readability of the code
        "typedef": [true, "call-signature", "arrow-call-signature", "parameter", "arrow-parameter", "property-declaration", "variable-declaration", "member-variable-declaration"],
        "unified-signatures": true,
        "variable-name": true,

        /**
         * Accessibility. The following rules should be turned on to guarantee the best user
         * experience for keyboard and screen reader users.
         */


        /**
         * Whitespace related rules. The only recommended whitespace strategy is to pick a single format and
         * be consistent.
         */
        "align": [true, "parameters", "arguments", "statements"],
        "curly": true,
        "eofline": true,
        "import-spacing": true,
        "indent": [true, "spaces"],
        "linebreak-style": true,
        "newline-before-return": true,
        "no-consecutive-blank-lines": true,
        "no-trailing-whitespace": true,
        "object-literal-key-quotes": [true, "as-needed"],
        "one-line": [true, "check-open-brace", "check-catch", "check-else", "check-whitespace"],
        "quotemark": [true, "single"],
        "semicolon": [true, "always"],
        "trailing-comma": [true, {"singleline": "never", "multiline": "never"}], // forcing trailing commas for multi-line
                    // lists results in lists that are easier to reorder and version control diffs that are more clear.
                    // Many teams like to have multiline be 'always'. There is no clear consensus on this rule but the
                    // internal MS JavaScript coding standard does discourage it.
        "typedef-whitespace": false,
        "whitespace": [true, "check-branch", "check-decl", "check-operator", "check-separator", "check-type"],

        /**
         * Controversial/Configurable rules.
         */
        "ban": false,                // only enable this if you have some code pattern that you want to ban
        "ban-types": true,
        "cyclomatic-complexity": true,
        "file-header": false,  // enable this rule only if you are legally required to add a file header
        "import-blacklist": false,  // enable and configure this as you desire
        "interface-over-type-literal": false,  // there are plenty of reasons to prefer interfaces
        "no-angle-bracket-type-assertion": false,  // pick either type-cast format and use it consistently
        "no-inferred-empty-object-type": false,  // if the compiler is satisfied then this is probably not an issue
        "no-internal-module": false, // only enable this if you are not using internal modules
        "no-magic-numbers": false,  // by default it will find too many false positives
        "no-mergeable-namespace": false,  // your project may require mergeable namespaces
        "no-namespace": false,       // only enable this if you are not using modules/namespaces
        "no-reference": true,        // in general you should use a module system and not /// reference imports
        "object-literal-shorthand": false,  // object-literal-shorthand offers an abbreviation not an abstraction
        "space-before-function-paren": false,   // turn this on if this is really your coding standard

        /**
         * Deprecated rules.  The following rules are deprecated for various reasons.
         */
        "no-switch-case-fall-through": false,  // now supported by TypeScript compiler
        "typeof-compare": false,               // the valid-typeof rule is currently superior to this version
    }
};

