const { peerDependencies } = require("./package.json");

module.exports = {
  env: {
    /* (i) An environment provides predefined global variables */
    browser: true, // Browser global variables
    node: true, // Node.js global variables and Node.js scoping
    es2021: true, // Adds all ECMAScript 2021 globals and automatically sets the ecmaVersion parser option to 12
  },
  parserOptions: {
    ecmaVersion: 2021, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allow imports of code placed in ECMAScript modules
    ecmaFeatures: {
      /* (i) Which additional language features you'd like to use */
      jsx: true, // Enable JSX
    },
  },
  plugins: [
    /* (i) Place to define plugins, normally there is no need for this as "extends" will automatically import the plugin */
  ],
  extends: [
    "eslint:recommended", // Rules recommended by ESLint (eslint)
    "plugin:react/recommended", // React rules (eslint-plugin-react)
    "plugin:react-hooks/recommended", // React Hooks rules (eslint-plugin-react-hooks)
    "plugin:jsx-a11y/recommended", // Accessibility rules (eslint-plugin-jsx-a11y)
    "plugin:import/errors", // Recommended errors for import (eslint-plugin-import)
    "plugin:import/warnings", // Recommended warnings for import (eslint-plugin-import)
    "plugin:import/typescript", // Typescript support for the import rules (eslint-plugin-import)
    "plugin:promise/recommended", // Enforce best practices for JavaScript promises (eslint-plugin-promise)
    "plugin:prettier/recommended", // This will display Prettier errors as ESLint errors. (!) Make sure this is always the last configuration in the extends array. (eslint-plugin-prettier & eslint-config-prettier)
  ],
  /* (i) Apply TypeScript rules just to TypeScript files */
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser", // Specifies the ESLint parser
      parserOptions: {
        tsconfigRootDir: __dirname, // Required by `@typescript-eslint/recommended-requiring-type-checking`
        project: ["./tsconfig.eslint.json"], // Required by `@typescript-eslint/recommended-requiring-type-checking`
      },
      extends: [
        "plugin:@typescript-eslint/recommended", // TypeScript rules (@typescript-eslint/eslint-plugin)
        "plugin:@typescript-eslint/recommended-requiring-type-checking", // Linting with Type Information. More info: https://git.io/JEDmJ (@typescript-eslint/eslint-plugin)
      ],
    },
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  rules: {
    /* (i) Place to specify ESLint rules. Can be used to overwrite rules specified by the extended configs */

    // Define extensions that shouldn't be specified on import
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        ts: "never",
        tsx: "never",
      },
    ],

    // Enforce a convention in module import order
    "import/order": [
      "error",
      {
        alphabetize: {
          order: "asc",
        },
        // this is the default order except for added `internal` in the middle
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "never",
      },
    ],

    "no-console": "warn", // Warning for console logging
    "arrow-body-style": ["error", "as-needed"], // Disallow the use of braces around arrow function body when is not needed
    "prefer-arrow-callback": "error", // Produce error anywhere an arrow function can be used instead of a function expression

    // React rules
    "react/prop-types": 0, // Disable the requirement for prop types definitions, we will use TypeScript's types for component props instead
    "react/jsx-filename-extension": [2, { extensions: [".tsx"] }], // Allow JSX only in `.tsx` files
    "react/react-in-jsx-scope": 0, // `React` doesn't need to be imported in React 17
    "react/destructuring-assignment": 2, // Always destructure component `props`

    // React Hooks rules
    "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "warn", // Checks hook dependencies

    // Disable the `import/no-unresolved` rule for peer dependencies
    // This is useful when you develop a React library and `react` it's not present in `dependencies`
    // nor in `devDependencies` but it is specified in the `peerDependencies`
    // More info: https://github.com/import-js/eslint-plugin-import/issues/825#issuecomment-542618188
    "import/no-unresolved": [
      "error",
      { ignore: Object.keys(peerDependencies) },
    ],
  },
  settings: {
    react: {
      version: "detect", // Tells `eslint-plugin-react` to automatically detect the version of React to use
    },
  },
};
