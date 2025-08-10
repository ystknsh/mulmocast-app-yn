import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import checkFile from "eslint-plugin-check-file";
import sonarjs from "eslint-plugin-sonarjs";

// Common base rules configuration
const baseRules = {
  "prettier/prettier": "error",
  "no-redeclare": "off",
  "@typescript-eslint/no-redeclare": "error",
  indent: ["error", 2],
  "@typescript-eslint/no-explicit-any": "error",
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
  "check-file/filename-naming-convention": [
    "error",
    {
      "src/**/*.{js,ts,vue}": "SNAKE_CASE",
    },
    {
      ignoreMiddleExtensions: true,
    },
  ],
};

const basePlugins = {
  "@typescript-eslint": typescript,
  import: importPlugin,
  prettier,
  "check-file": checkFile,
};

const baseLanguageOptions = {
  parser: typescriptParser,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
};

const sonarjsRules = {
  "sonarjs/no-commented-code": "off",
  "sonarjs/todo-tag": "off",
  "sonarjs/cognitive-complexity": "off",
  "sonarjs/no-nested-conditional": "off",
  "sonarjs/use-type-alias": "warn",
  "sonarjs/no-unused-vars": "warn",
  "sonarjs/no-ignored-exceptions": "warn",
  "sonarjs/no-os-command-from-path": "warn",
  "sonarjs/no-nested-functions": "warn",
  "sonarjs/no-small-switch": "warn",
  "sonarjs/slow-regex": "warn",
  "sonarjs/no-nested-template-literals": "warn"
};

export default [
  js.configs.recommended,
  sonarjs.configs.recommended,
  {
    ignores: [
      "node_modules/**",
      ".vite/**",
      "dist/**",
      "build/**",
      "out/**",
      "*.min.js",
      "coverage/**",
      "src/renderer/components/ui/**",
    ],
  },
  // Node.js environment configuration (Main & Preload)
  {
    files: ["src/main/**/*.{js,ts}", "src/preload/**/*.{js,ts}", "src/shared/**/*.{js,ts}"],
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
      ...basePlugins,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...baseRules,
      ...sonarjsRules,
    },
    settings: {
      "import/resolver": {
        typescript: true,
      },
    },
  },
  // Vue configuration (Renderer process)
  {
    files: ["src/renderer/**/*.vue"],
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
        Buffer: 'readonly',
      },
    },
    plugins: {
      ...basePlugins,
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
      ...sonarjsRules,
    },
    settings: {
      "import/resolver": {
        typescript: true,
      },
    },
  },
  // TypeScript files in Renderer process
  {
    files: ["src/renderer/**/*.{js,ts}", "src/types/**/*.{js,ts}"],
    languageOptions: {
      ...baseLanguageOptions,
      globals: {
        ...globals.browser,
        Buffer: 'readonly',
      },
    },
    plugins: {
      ...basePlugins,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...baseRules,
      ...sonarjsRules,
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
      ...basePlugins,
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
  // Test files configuration (Node.js + Browser globals for Playwright)
  {
    files: ["test/**/*.{js,ts}"],
    languageOptions: {
      ...baseLanguageOptions,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      ...basePlugins,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...baseRules,
      ...sonarjsRules,
    },
    settings: {
      "import/resolver": {
        typescript: true,
      },
    },
  },
  prettierConfig,
];
