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
      ".vite-cache",
      "build",
      "coverage",
      "*.config.js",
      "vite.config.ts",
      ".SISO-APP-FACTORY/**/*",
      ".archive-backups/**/*",
      ".archive-src/**/*",
      ".ai-first-backup*/**/*",
      "archive/**/*",
      "backup-*/**/*",
      "ai-first/**/*",
      "tests/**/*",
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
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      
      // 🛡️ React Dependency Safety Rules
      "@typescript-eslint/no-use-before-define": ["error", { 
        "functions": false, 
        "classes": true, 
        "variables": true,
        "allowNamedExports": false 
      }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      
      // 🔍 Additional Safety Rules
      "prefer-const": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { "allow": ["warn", "error"] }],
    },
  }
);