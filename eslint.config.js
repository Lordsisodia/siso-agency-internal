import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { 
    ignores: [
      "dist",
      "node_modules",
      ".vite/**/*",
      ".vite-cache",
      "dev-dist/**/*",
      "build",
      "coverage",
      "*.config.js",
      "vite.config.ts",
      ".SISO-APP-FACTORY/**/*",
      ".archive/**/*",
      ".archive-backups/**/*",
      ".archive-src/**/*",
      ".ai-first-backup*/**/*",
      "archive/**/*",
      "archived-directories/**/*",
      "backup-*/**/*",
      "backups/**/*",
      "archives/**/*",
      "**/before-*/**/*",
      "ai-first/**/*",
      "tests/**/*",
      "scripts/**/*",
      ".codex/**/*",
      ".serena/**/*",
      "**/*.template.tsx",
      "**/*.template.ts",
      "**/*.backup",
      "**/*.bak",
      "**/*-backup.*"
    ] 
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // 🛡️ React Dependency Safety Rules
      "@typescript-eslint/no-use-before-define": "off", // Temporarily disabled for development
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",

      // 🔍 Additional Safety Rules
      "prefer-const": "off",
      "no-case-declarations": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off", // Temporarily disabled for development
      "no-console": "off", // Temporarily disabled for development
    },
  }
);
