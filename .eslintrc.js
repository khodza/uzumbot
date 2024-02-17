module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
        "prettier",
        "eslint-plugin-import",
        "no-relative-import-paths"
    ],
    extends: [
        "eslint:recommended",
        "prettier",
        "plugin:@typescript-eslint/recommended"
    ],
    rules: {
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/ban-ts-comment": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/explicit-member-accessibility": [
            "error",
            {
                accessibility: "explicit",
                overrides: {
                    accessors: "explicit",
                    constructors: "no-public",
                    methods: "explicit",
                    properties: "explicit",
                    parameterProperties: "explicit"
                }
            }
        ],

        "no-console": "error",
        "no-relative-import-paths/no-relative-import-paths": [
            "warn",
            { allowSameFolder: true, rootDir: "lib" }
        ],
        "no-restricted-imports": [
            "error",
            {
                patterns: ["..*"]
            }
        ],

        "import/no-relative-parent-imports": "error",
        "import/no-absolute-path": "error",
        "import/no-relative-packages": "error",
        "import/no-self-import": "error",
        "import/no-deprecated": "error",
        "import/first": "error",
        "import/exports-last": "error",
        "import/newline-after-import": "error",

        curly: "error",
        "newline-before-return": "error",
        semi: ["error", "always"]
    }
};