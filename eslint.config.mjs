import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

// Common base rules configuration
const baseRules = {
  "prettier/prettier": "error",
  "no-redeclare": "off",
  "@typescript-eslint/no-redeclare": "error",
  indent: ["error", 2],
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^__",
      varsIgnorePattern: "^__",
      caughtErrorsIgnorePattern: "^__",
    },
  ],
  "linebreak-style": ["error", "unix"],
  quotes: "off",
  semi: ["error", "always"],
};

const baseLanguageOptions = {
  parser: typescriptParser,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
};

export default [
  js.configs.recommended,
  {
    ignores: [
      "node_modules/**",
      ".vite/**",
      "dist/**",
      "build/**",
      "out/**",
      "*.min.js",
      "coverage/**",
    ],
  },
  // Node.js environment configuration (Express & Main process)
  {
    files: ["src/express/**/*.{js,ts}", "src/main.ts", "src/preload.ts"],
    languageOptions: {
      ...baseLanguageOptions,
      globals: {
        ...globals.node,
        // Electron main process globals
        MAIN_WINDOW_VITE_DEV_SERVER_URL: "readonly",
        MAIN_WINDOW_VITE_NAME: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      import: importPlugin,
      prettier,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...baseRules,
    },
    settings: {
      "import/resolver": {
        typescript: true,
      },
    },
  },
  // Browser environment configuration (React)
  {
    files: ["src/react/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ...baseLanguageOptions,
      parserOptions: {
        ...baseLanguageOptions.parserOptions,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
      prettier,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...baseRules,
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: true,
      },
    },
  },
  prettierConfig,
];
