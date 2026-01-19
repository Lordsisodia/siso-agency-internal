---
name: linting-formatting
category: development-workflow/testing-quality
title: Code Linting and Formatting Standards
description: Comprehensive guide to code linting, formatting, and maintaining consistent code quality with ESLint, Prettier, and other tools
version: 1.0.0
last_updated: 2026-01-18
tags: [linting, formatting, eslint, prettier, code-quality, style-guide]
dependencies: []
related_skills: [unit-testing, test-driven-development, systematic-debugging]
---

<context>
Consistent code style and quality are essential for maintainable software. This skill provides comprehensive patterns for setting up and using linting and formatting tools to enforce code standards, catch bugs early, and maintain a consistent codebase across teams. You'll learn to configure ESLint, Prettier, and other tools to automate code quality enforcement.

This skill covers:
- ESLint configuration for JavaScript/TypeScript
- Prettier for code formatting
- Combining ESLint and Prettier
- Custom linting rules
- Pre-commit hooks with Husky
- CI/CD integration
- IDE integration
- Team workflow and standards

Whether you're working solo or in a team, these patterns will help maintain code quality and consistency across your projects.
</context>

<instructions>
When setting up linting and formatting:

1. **Configure ESLint for your project**
   - Choose appropriate preset (Airbnb, Standard, Google)
   - Configure rules based on team preferences
   - Add TypeScript support if needed
   - Set up environment-specific configs

2. **Configure Prettier for formatting**
   - Create .prettierrc with team standards
   - Disable conflicting ESLint formatting rules
   - Configure file patterns to include/exclude
   - Set up consistent formatting across file types

3. **Integrate tools into development workflow**
   - Set up pre-commit hooks with Husky and lint-staged
   - Configure IDE to format on save
   - Add scripts to package.json
   - Set up CI/CD checks

4. **Maintain consistency**
   - Document coding standards
   - Use editorconfig for cross-editor consistency
   - Keep dependencies updated
   - Review and adjust rules as needed

5. **Handle legacy code**
   - Use --fix flag to auto-fix issues
   - Disable rules selectively with comments
   - Gradually improve code quality
   - Document technical debt

6. **Team collaboration**
   - Share configuration files
   - Use consistent versions across team
   - Document rule choices
   - Review linting in code reviews
</instructions>

<rules>
- MUST run linter before committing code
- MUST use Prettier for formatting (disable ESLint formatting rules)
- MUST fix all linting errors before merging
- MUST NOT commit with linting exceptions unless absolutely necessary
- MUST use .editorconfig for cross-editor consistency
- MUST keep linting dependencies updated
- MUST document custom linting rules
- MUST use consistent indentation (2 spaces for JavaScript/TypeScript)
- MUST use consistent quote style (single quotes preferred)
- MUST use consistent semicolon usage
- MUST add max line length comments for justified violations
- MUST use pre-commit hooks to enforce standards
</rules>

<workflow>
1. **Setup Phase**
   - Install ESLint and Prettier
   - Install project-specific plugins
   - Create configuration files
   - Set up IDE integration

2. **Configuration Phase**
   - Choose base configuration preset
   - Customize rules for project needs
   - Configure Prettier settings
   - Set up lint-staged and Husky

3. **Integration Phase**
   - Add npm scripts
   - Configure pre-commit hooks
   - Set up CI/CD checks
   - Document standards

4. **Maintenance Phase**
   - Run linter regularly
   - Fix issues as they appear
   - Review and update rules
   - Keep dependencies updated
</workflow>

<best_practices>
- Use Prettier for formatting, ESLint for code quality
- Run Prettier before ESLint (Prettier handles formatting)
- Use lint-staged to only lint changed files
- Set up automatic fixing on save in IDE
- Use Husky for pre-commit hooks
- Add ESLint plugins for frameworks (React, Vue, etc.)
- Use TypeScript-specific rules for TS projects
- Configure environment-specific rules
- Document team coding standards
- Use editorconfig for basic settings
- Keep configuration in version control
- Use consistent versions across team
- Review linting errors in code reviews
- Fix auto-fixable issues automatically
- Use --max-warnings=0 in CI to fail on warnings
- Configure ignored files and patterns appropriately
</best_practices>

<anti_patterns>
- ❌ Committing code with linting errors
- ❌ Using ESLint and Prettier for formatting (conflicts)
- ❌ Ignoring linting errors without justification
- ❌ Using inconsistent formatting across files
- ❌ Not using pre-commit hooks
- ❌ Mixing spaces and tabs
- ❌ Inconsistent quote styles
- ❌ Not documenting custom rules
- ❌ Disabling linter globally
- ❌ Outdated linting dependencies
- ❌ Not running linter in CI/CD
- ❌ Using different settings per developer
- ❌ Commenting out large blocks of linter rules
- ❌ Not fixing auto-fixable issues
- ❌ Ignoring linting in code reviews
</anti_patterns>

<examples>
Example 1: ESLint Configuration (JavaScript)
```json
// .eslintrc.json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "import",
    "jsx-a11y",
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-debugger": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always",
      "alphabetize": {
        "order": "asc",
        "caseInsensitive": true
      }
    }],
    "import/no-unresolved": "error",
    "import/no-cycle": "warn",
    "no-restricted-imports": ["error", {
      "patterns": ["@/*/../"]
    }],
    "max-len": ["warn", {
      "code": 100,
      "ignoreUrls": true,
      "ignoreStrings": true,
      "ignoreTemplateLiterals": true,
      "ignoreRegExpLiterals": true
    }]
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "typescript": {},
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  },
  "ignorePatterns": [
    "node_modules/",
    "build/",
    "dist/",
    "coverage/",
    "*.config.js",
    "*.config.ts"
  ]
}
```

Example 2: Prettier Configuration
```json
// .prettierrc.json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "endOfLine": "lf",
  "proseWrap": "preserve",
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "jsxBracketSameLine": false
}
```

```
# .prettierignore
node_modules/
build/
dist/
coverage/
.next/
.nuxt/
.cache/
.vscode/
.idea/
*.min.js
*.min.css
package-lock.json
pnpm-lock.yaml
yarn.lock
package.json
tsconfig.json
.eslintrc.json
.prettierignore
```

Example 3: Package.json Scripts
```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx --max-warnings=0",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md,mdx,css,scss,yml,yaml}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md,mdx,css,scss,yml,yaml}\"",
    "type-check": "tsc --noEmit",
    "validate": "npm run lint && npm run format:check && npm run type-check",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.50.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-import": "^2.28.0",
    "eslint-plugin-jsx-a11y": "^6.7.0",
    "eslint-plugin-prettier": "^5.0.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "husky": "^8.0.0",
    "lint-staged": "^14.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.2.0"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,mdx,css,scss,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

Example 4: Husky Pre-commit Hooks
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run lint-staged on staged files
npx lint-staged

# Optionally run type check (can be slow)
# npm run type-check

# Check for console.log statements (optional)
# if git diff --cached --name-only | grep -E '\.(js|jsx|ts|tsx)$'; then
#   if git diff --cached --name-only | xargs grep -l 'console\.log'; then
#     echo "\n⚠️  Warning: console.log found in staged files"
#     echo "Please remove console.log statements before committing\n"
#     exit 1
#   fi
# fi
```

```
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npx lint-staged
```

```
# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Enforce commit message format
npx commitlint --edit $1
```

Example 5: EditorConfig
```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx,vue}]
indent_style = space
indent_size = 2

[*.{html,css,scss,less,json,yml,yaml}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab

[*.{bat,cmd}]
end_of_line = crlf
```

Example 6: VS Code Settings
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

Example 7: ESLint Plugin for Custom Rules
```javascript
// eslint-plugin-custom-rules/index.js
const { ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/eslint-rules/${name}`
);

module.exports = {
  rules: {
    'no-class-component': createRule({
      name: 'no-class-component',
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Disallow class components in favor of function components',
          recommended: 'error',
        },
        schema: [],
        messages: {
          noClassComponent: 'Use function components instead of class components',
        },
      },
      defaultOptions: [],
      create(context) {
        return {
          ClassDeclaration(node) {
            if (
              node.superClass &&
              (node.superClass.name === 'Component' ||
                node.superClass.name === 'PureComponent')
            ) {
              context.report({
                node,
                messageId: 'noClassComponent',
              });
            }
          },
        };
      },
    }),

    'prefer-custom-hook': createRule({
      name: 'prefer-custom-hook',
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Prefer using custom hooks for complex logic',
          recommended: 'warn',
        },
        schema: [
          {
            type: 'object',
            properties: {
              maxHooks: {
                type: 'number',
                default: 5,
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          extractToHook: 'Extract this logic to a custom hook',
        },
      },
      defaultOptions: [{ maxHooks: 5 }],
      create(context, [{ maxHooks }]) {
        return {
          FunctionDeclaration(node) {
            // Count React hooks in function component
            let hookCount = 0;

            const { sourceCode } = context;
            const tokens = sourceCode.getTokens(node);

            for (const token of tokens) {
              if (
                token.type === 'Identifier' &&
                token.value.startsWith('use') &&
                token.value !== 'use'
              ) {
                hookCount++;
              }
            }

            if (hookCount > maxHooks) {
              context.report({
                node,
                messageId: 'extractToHook',
                data: { hookCount, maxHooks },
              });
            }
          },
        };
      },
    }),
  },
};
```

Example 8: CI/CD Integration (GitHub Actions)
```yaml
# .github/workflows/lint.yml
name: Lint and Format Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint and Type Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: Run TypeScript check
        run: npm run type-check

      - name: Annotate lint errors
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const output = fs.readFileSync('eslint-report.json', 'utf8');
            const results = JSON.parse(output);

            for (const result of results) {
              for (const message of result.messages) {
                github.rest.issues.createComment({
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  issue_number: context.issue.number,
                  body: `❌ **${message.ruleId}** in \`${result.filePath}\`\n\n${message.message}`
                });
              }
            }
```

Example 9: Handling Legacy Code
```javascript
// Disable specific rule for a line
const legacyData = data; // eslint-disable-line @typescript-eslint/no-explicit-any

// Disable rule for a block
/* eslint-disable @typescript-eslint/no-explicit-any */
function legacyFunction(data: any) {
  // Legacy code that uses 'any' type
  return data.map((item: any) => item.value);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Disable rule for the entire file (last resort)
/* eslint-disable @typescript-eslint/no-explicit-any */

// Temporarily disable all rules
/* eslint-disable */

// Re-enable specific rules
/* eslint-enable no-console, no-debugger */

// Justify why a rule is being disabled
const result = fetch(url) // eslint-disable-line @typescript-eslint/no-unsafe-argument -- Legacy API, migration planned for Q2 2024

// Use a better approach: Type assertion instead of 'any'
interface LegacyData {
  id: string;
  value: number;
}

const data = fetchData() as LegacyData; // Better than 'any'
```

Example 10: Python Linting with Ruff (Alternative to Black + Flake8)
```toml
# pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py38"
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "UP",  # pyupgrade
    "ARG", # flake8-unused-arguments
    "SIM", # flake8-simplify
]
ignore = [
    "E501",   # line too long (handled by formatter)
    "B008",   # do not perform function calls in argument defaults
    "C901",   # too complex
]
exclude = [
    ".bzr",
    ".direnv",
    ".eggs",
    ".git",
    ".hg",
    ".mypy_cache",
    ".nox",
    ".pants.d",
    ".ruff_cache",
    ".svn",
    ".tox",
    ".venv",
    "__pypackages__",
    "_build",
    "buck-out",
    "build",
    "dist",
    "node_modules",
    "venv",
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]  # unused imports
"tests/*" = ["ARG"]        # unused arguments in tests

[tool.ruff.isort]
known-first-party = ["myapp"]

[tool.black]
line-length = 100
target-version = ["py38"]
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''
```

Example 11: Custom ESLint Rule Configuration
```javascript
// .eslintrc.js
module.exports = {
  // ... other config
  rules: {
    // Custom rule configurations
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: true,
        },
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
        custom: {
          regex: '^T[A-Z]',
          match: true,
        },
      },
      {
        selector: 'enum',
        format: ['PascalCase'],
        custom: {
          regex: '^E[A-Z]',
          match: true,
        },
      },
    ],

    // Enforce sorted imports
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true, // Use import/order instead
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],

    // Prevent unused variables with underscore prefix
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // Enforce consistent return types
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowDirectConstAssertionInArrowFunctions: true,
      },
    ],

    // Prevent console in production
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

    // Complex components should be split
    'complexity': ['warn', 10],

    // Enforce maximum file lines
    'max-lines': ['warn', {
      max: 300,
      skipBlankLines: true,
      skipComments: true,
    }],

    // Enforce maximum params
    'max-params': ['warn', 4],

    // Prevent deeply nested code
    'max-depth': ['warn', 4],
  },
};
```

Example 12: Formatting Before and After
```javascript
// Before: Poor formatting
const  user={name:"John",age:30,email:"john@example.com"};
function getUserData(id){return users.find(u=>u.id===id)}
const result=getUserData(123)??'unknown';

// After: Proper formatting
const user = {
  name: 'John',
  age: 30,
  email: 'john@example.com',
};

function getUserData(id) {
  return users.find((u) => u.id === id);
}

const result = getUserData(123) ?? 'unknown';
```

```javascript
// Before: Inconsistent imports
import React from 'react';
import { useState } from 'react';
import Button from './Button';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

// After: Organized imports
import axios from 'axios';
import { useState } from 'react';

import { format } from 'date-fns';

import Button from './Button';
import { useAuth } from '../hooks/useAuth';
```
</examples>

<integration_notes>
This skill integrates with:

- **unit-testing**: Linting test files for consistency
- **test-driven-development**: Code quality in TDD workflow
- **systematic-debugging**: Linting errors as bugs
- **collaboration/requesting-code-review**: Linting in code reviews

When to use this skill:
- Setting up a new project
- Improving code quality in existing projects
- Standardizing team coding practices
- Automating code quality checks
- Reducing code review friction

Common pitfalls:
- Not running linter before committing
- Ignoring linting errors
- Conflicting ESLint and Prettier rules
- Not using pre-commit hooks
- Inconsistent settings across team
</integration_notes>

<error_handling>
Common linting errors and solutions:

**Module Resolution Errors**
- Cannot find module: Check import paths and tsconfig
- Use proper import aliases
- Configure import/resolver in ESLint

**TypeScript Errors**
- Type errors: Add proper types, avoid 'any'
- Use type assertions when appropriate
- Configure TypeScript rules appropriately

**Formatting Conflicts**
- ESLint vs Prettier: Use eslint-config-prettier
- Disable ESLint formatting rules
- Run Prettier before ESLint

**Performance Issues**
- Slow linting: Use lint-staged for changed files only
- Large codebase: Split into multiple lint jobs
- CI timeout: Cache node_modules, use faster runners

**Rule Conflicts**
- Conflicting rules: Review and disable conflicting rules
- Team disagreement: Document decisions, use preset configs
- Legacy code: Use eslint-disable with comments
</error_handling>

<output_format>
Code should be formatted with:
- 2 spaces for indentation (JavaScript/TypeScript)
- Single quotes for strings
- Semicolons at end of statements
- Trailing commas in multi-line objects/arrays
- Max line length of 100 characters
- Space after keywords and before braces
- Consistent spacing around operators

Example:
```javascript
const user = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
};

async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```
</output_format>

<related_skills>
- unit-testing: Testing with consistent code style
- test-driven-development: Code quality in TDD
- systematic-debugging: Fixing linting errors
- collaboration/requesting-code-review: Linting in reviews
</related_skills>

<see_also>
- ESLint Documentation: https://eslint.org/
- Prettier Documentation: https://prettier.io/
- Husky Documentation: https://typicode.github.io/husky/
- lint-staged Documentation: https://github.com/okonet/lint-staged
- Airbnb Style Guide: https://github.com/airbnb/javascript
</see_also>
