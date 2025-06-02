import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
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
  // Vue configuration
  {
    files: ["src/client/**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      vue,
      "@typescript-eslint": typescript,
      import: importPlugin,
      prettier,
    },
    rules: {
      ...vue.configs["flat/recommended"].rules,
      ...typescript.configs.recommended.rules,
      ...baseRules,
      "vue/multi-word-component-names": "off",
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "never",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],
    },
    settings: {
      "import/resolver": {
        typescript: true,
      },
    },
  },
  // TypeScript files in Vue client
  {
    files: ["src/client/**/*.{js,ts}"],
    languageOptions: {
      ...baseLanguageOptions,
      globals: {
        ...globals.browser,
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
  // Build configuration files
  {
    files: ["*.config.{js,ts,mjs}", "forge.config.ts"],
    languageOptions: {
      ...baseLanguageOptions,
      globals: {
        ...globals.node,
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
  prettierConfig,
];
