---
name: linting-formatting
category: development-workflow/testing-quality
version: 1.0.0
description: Code linting and formatting standards for consistent, maintainable codebases
author: blackbox5/core
verified: true
tags: [linting, formatting, style, eslint, prettier]
---

```xml
<skill>
  <metadata>
    <title>Code Linting and Formatting Standards</title>
    <category>Development Workflow / Testing & Quality</category>
    <difficulty>intermediate</difficulty>
    <time_to_learn>2-3 hours</time_to_learn>
    <prerequisites>
      <prerequisite>Basic understanding of code quality concepts</prerequisite>
      <prerequisite>Familiarity with package managers (npm/yarn/pnpm)</prerequisite>
      <prerequisite>Knowledge of build tools and CI/CD pipelines</prerequisite>
    </prerequisites>
  </metadata>

  <context>
    <section title="Why Linting and Formatting Matter">
      <subsection title="Code Quality">
        <p>
          Linting and formatting are essential practices for maintaining code quality, consistency,
          and readability across a codebase. They automate the enforcement of coding standards,
          reduce cognitive load, and catch potential bugs before they reach production.
        </p>
      </subsection>

      <subsection title="Team Collaboration">
        <p>
          Consistent code style reduces friction in code reviews, minimizes merge conflicts,
          and makes onboarding new developers faster. When everyone follows the same standards,
          code becomes easier to understand, modify, and maintain.
        </p>
      </subsection>

      <subsection title="Automated Enforcement">
        <p>
          Linters analyze code for potential errors, bugs, and stylistic issues without executing it.
          Formatters automatically adjust code structure to conform to specified style guidelines.
          Together, they provide a safety net that catches common mistakes and ensures consistency.
        </p>
      </subsection>

      <subsection title="Key Benefits">
        <ul>
          <li><strong>Catch Errors Early:</strong> Identify bugs and anti-patterns before runtime</li>
          <li><strong>Consistent Style:</strong> Uniform formatting across all team members' code</li>
          <li><strong>Faster Reviews:</strong> Reviewers focus on logic, not style preferences</li>
          <li><strong>Better Maintainability:</strong> Predictable code structure is easier to navigate</li>
          <li><strong>Automated Standards:</strong> Enforce best practices without manual oversight</li>
          <li><strong>Reduced Technical Debt:</strong> Prevent accumulation of style inconsistencies</li>
        </ul>
      </subsection>
    </section>
  </context>

  <instructions>
    <section title="Setting Up Linting and Formatting">
      <subsection title="1. Choose Your Tools">
        <step title="Select Language-Appropriate Tools">
          <item>JavaScript/TypeScript: ESLint + Prettier</item>
          <item>Python: Ruff (fast) or Flake8 + Black</item>
          <item>Go: gofmt (built-in) + golangci-lint</item>
          <item>Rust: rustfmt (built-in) + Clippy</item>
          <item>Java: Checkstyle + Google Java Format</item>
          <item>C#/.NET: Roslyn Analyzers + dotnet format</item>
        </step>

        <step title="Install Core Dependencies">
          <code_block language="bash">
# TypeScript/JavaScript project
npm install --save-dev eslint prettier eslint-config-prettier

# TypeScript-specific rules
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin

# React/JSX support
npm install --save-dev eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y

# For Airbnb or Standard style guides
npm install --save-dev eslint-config-airbnb eslint-config-standard
          </code_block>
        </step>
      </subsection>

      <subsection title="2. Configure ESLint">
        <step title="Create ESLint Configuration">
          <code_block language="javascript">
// .eslintrc.js or eslint.config.js (new flat config)
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier', // Must be last to override other configs
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
  ],
  rules: {
    // Custom rules override
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Using TypeScript for props validation
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {},
    },
  },
  ignorePatterns: [
    'dist',
    'build',
    'node_modules',
    '*.config.js',
    '.eslintrc.js',
  ],
};
          </code_block>
        </step>
      </subsection>

      <subsection title="3. Configure Prettier">
        <step title="Create Prettier Configuration">
          <code_block language="json">
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "jsxBracketSameLine": false
}
          </code_block>
        </step>

        <step title="Create Prettier Ignore File">
          <code_block language="text">
# .prettierignore
node_modules
dist
build
coverage
.next
.nuxt
.cache
package-lock.json
pnpm-lock.yaml
yarn.lock
*.min.js
*.min.css
CHANGELOG.md
          </code_block>
        </step>
      </subsection>

      <subsection title="4. Add npm Scripts">
        <step title="Configure Package.json Scripts">
          <code_block language="json">
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,css,scss}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,css,scss}\"",
    "type-check": "tsc --noEmit",
    "pre-commit": "npm run lint && npm run format:check && npm run type-check"
  }
}
          </code_block>
        </step>
      </subsection>
    </section>
  </instructions>

  <rules>
    <section title="Configuration Standards">
      <subsection title="File Organization">
        <rule id="config-location" priority="high">
          <title>Configuration File Location</title>
          <description>
            Place all linting and formatting configuration files at the project root.
            Use consistent naming conventions with proper extensions.
          </description>
          <enforcement>Automated check in CI pipeline</enforcement>
        </rule>

        <rule id="config-versioning" priority="medium">
          <title>Version Control</title>
          <description>
            Commit all configuration files to version control. Never commit generated
            lock files or IDE-specific configurations that may cause conflicts.
          </description>
        </rule>
      </subsection>

      <subsection title="Rule Customization">
        <rule id="rule-consistency" priority="high">
          <title>Consistent Rule Sets</title>
          <description>
            Use established style guides (Airbnb, Standard, Google) as a base.
            Customize rules minimally and document deviations with clear rationale.
          </description>
          <example>
            <p>Enable stricter rules for new code, use warnings for legacy code</p>
          </example>
        </rule>

        <rule id="severity-levels" priority="medium">
          <title>Error vs Warning</title>
          <description>
            Use 'error' for issues that could cause bugs or significantly impact
            readability. Use 'warn' for stylistic preferences that should be
            fixed but don't block commits.
          </description>
          <example>
            <p>'no-unused-vars': 'error', 'max-len': 'warn'</p>
          </example>
        </rule>
      </subsection>

      <subsection title="CI/CD Integration">
        <rule id="ci-blocking" priority="high">
          <title>Block on Linter Failures</title>
          <description>
            Configure CI pipelines to fail builds on linting errors. Use
            --max-warnings 0 to treat warnings as failures in CI.
          </description>
          <enforcement>CI configuration checks</enforcement>
        </rule>

        <rule id="pr-checks" priority="high">
          <title>Pre-commit and PR Checks</title>
          <description>
            Require linting checks to pass before allowing PR merges. Use
            GitHub Actions, GitLab CI, or similar for automated checks.
          </description>
        </rule>
      </subsection>

      <subsection title="Team Adoption">
        <rule id="onboarding" priority="medium">
          <title>Developer Onboarding</title>
          <description>
            Include linting setup in onboarding documentation. Provide IDE
            configuration snippets and troubleshooting guides.
          </description>
        </rule>

        <rule id="evolution" priority="low">
          <title>Gradual Evolution</title>
          <description>
            When introducing stricter rules to existing codebases, use warnings
            first, then convert to errors after a transition period.
          </description>
        </rule>
      </subsection>
    </section>
  </rules>

  <workflow>
    <phase id="tool-selection" title="1. Tool Selection">
      <steps>
        <step>Evaluate project requirements and tech stack</step>
        <step>Research language-specific linting tools</step>
        <step>Choose primary linter and formatter</step>
        <step>Identify necessary plugins and extensions</step>
        <step>Consider team size and workflow needs</step>
      </steps>
      <output>Selected tools with installation commands</output>
    </phase>

    <phase id="configuration" title="2. Configuration">
      <steps>
        <step>Initialize configuration files</step>
        <step>Choose base rule set (Airbnb, Standard, etc.)</step>
        <step>Customize rules for project needs</step>
        <step>Configure ignore patterns</step>
        <step>Test configuration on sample code</step>
      </steps>
      <output>Working configuration files</output>
    </phase>

    <phase id="integration" title="3. Integration">
      <steps>
        <step>Add npm scripts for linting and formatting</step>
        <step>Configure IDE extensions (VS Code, WebStorm)</step>
        <step>Set up format-on-save in editor settings</step>
        <step>Create editorconfig for cross-editor consistency</step>
        <step>Test local development workflow</step>
      </steps>
      <output>Fully configured local development environment</output>
    </phase>

    <phase id="automation" title="4. Automation">
      <steps>
        <step>Install Husky for git hooks</step>
        <step>Configure lint-staged for pre-commit checks</step>
        <step>Set up commit-msg linting (commitlint)</step>
        <step>Configure pre-push hooks for full checks</step>
        <step>Test git hook workflow</step>
      </steps>
      <output>Automated quality checks on git operations</output>
    </phase>

    <phase id="enforcement" title="5. Enforcement">
      <steps>
        <step>Create CI pipeline configuration (GitHub Actions, etc.)</step>
        <step>Set linting as required check for PRs</step>
        <step>Configure branch protection rules</step>
        <step>Add linting status badges to README</step>
        <step>Document team workflow and expectations</step>
      </steps>
      <output>CI-integrated quality enforcement</output>
    </phase>

    <phase id="maintenance" title="6. Maintenance">
      <steps>
        <step>Regular tool and dependency updates</step>
        <step>Review and adjust rules quarterly</step>
        <step>Address team feedback and pain points</step>
        <step>Monitor CI performance and optimize</step>
        <step>Document rule changes and rationale</step>
      </steps>
      <output>Evolved configuration matching team needs</output>
    </phase>
  </workflow>

  <best_practices>
    <section title="Configuration Organization">
      <subsection title="Separate Concerns">
        <practice>
          <title>ESLint for Quality, Prettier for Style</title>
          <description>
            Use eslint-config-prettier to disable all ESLint formatting rules that
            conflict with Prettier. Let each tool do what it does best.
          </description>
        </practice>

        <practice>
          <title>Monorepo Configuration</title>
          <description>
            For monorepos, use ESLint's extends feature to create a base config
            package that can be shared across all packages.
          </description>
          <example>
            <code_block language="javascript">
// In shared config package
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    // Shared rules
  },
};

// In individual package
module.exports = {
  root: true,
  extends: ['@company/eslint-config'],
  // Package-specific overrides
};
            </code_block>
          </example>
        </practice>
      </subsection>

      <section title="Rule Customization">
        <subsection title="Be Opinionated">
          <practice>
            <title>Default to Strict</title>
            <description>
              Start with strict rules and relax them only with documented justification.
              It's easier to loosen rules than to tighten them later.
            </description>
          </practice>

          <practice>
            <title>Disable with Comments Sparingly</title>
            <description>
              Only disable rules inline when absolutely necessary. Always include
              explanation comments for why the rule is being disabled.
            </description>
            <example>
              <code_block language="typescript">
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required by external API
const data: any = externalApi.getResponse();
              </code_block>
            </example>
          </practice>
        </subsection>
      </section>

      <section title="Pre-commit Hooks">
        <subsection title="Husky + lint-staged">
          <practice>
            <title>Run on Staged Files Only</title>
            <description>
              Configure lint-staged to only run linters on files that are part
              of the current commit. This significantly improves performance.
            </description>
            <example>
              <code_block language="json">
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css,scss}": [
      "prettier --write"
    ]
  }
}
              </code_block>
            </example>
          </practice>

          <practice>
            <title>Separate Pre-commit and Pre-push</title>
            <description>
              Use pre-commit for quick checks (linting, formatting on changed files).
              Use pre-push for slower checks (full test suite, type checking).
            </description>
          </practice>
        </subsection>
      </section>

      <section title="Performance">
        <subsection title="Optimize for Speed">
          <practice>
            <title>Cache Linter Results</title>
            <description>
              Enable ESLint caching with --cache flag. Subsequent runs will only
              lint changed files.
            </description>
            <example>
              <code_block language="json">
{
  "scripts": {
    "lint": "eslint . --cache --max-warnings 0"
  }
}
              </code_block>
            </example>
          </practice>

          <practice>
            <title>Parallel Processing</title>
            <description>
              For large codebases, use tools like eslint-parallel or run linting
              on separate directories in parallel.
            </description>
          </practice>
        </subsection>
      </section>
    </section>
  </best_practices>

  <anti_patterns>
    <pattern id="ignoring-errors" severity="critical">
      <title>Ignoring Linter Errors</title>
      <description>
        Committing code with known linting errors, or using --max-warnings
        without fixing the underlying issues.
      </description>
      <consequence>
        Technical debt accumulation, inconsistent code quality, potential bugs.
      </consequence>
      <solution>
        Always address linting errors before committing. Use --fix for auto-fixable
        issues, or create dedicated tickets for non-trivial fixes.
      </solution>
    </pattern>

    <pattern id="inconsistent-config" severity="high">
      <title>Inconsistent Configuration</title>
      <description>
        Having different linting rules across different parts of the codebase,
        or developers using local overrides.
      </description>
      <consequence>
        Team confusion, merge conflicts, unreliable linting results.
      </consequence>
      <solution>
        Maintain a single source of truth for configuration. Use ESLint overrides
        sparingly and only for legitimate reasons (test files, legacy code).
      </solution>
    </pattern>

    <pattern id="over-disable" severity="high">
      <title>Overusing eslint-disable</title>
      <description>
        Disabling rules globally or for entire files instead of addressing
        the specific issues or disabling for individual lines.
      </description>
      <consequence>
        Missed bugs, inconsistent code quality, disabled protections.
      </consequence>
      <solution>
        Disable rules at the smallest possible scope (line, statement). Always
        include explanatory comments. Consider refactoring code to comply.
      </solution>
    </pattern>

    <pattern id="tool-conflict" severity="medium">
      <title>Tool Conflicts</title>
      <description>
        Running ESLint and Prettier without eslint-config-prettier, causing
        conflicting formatting rules and inconsistent output.
      </description>
      <consequence>
        Files that can't be formatted consistently, confusing developer experience.
      </consequence>
      <solution>
        Always include eslint-config-prettier as the last item in extends array
        to disable conflicting ESLint rules.
      </solution>
    </pattern>

    <pattern id="slow-ci" severity="medium">
      <title>Slow CI Checks</title>
      <description>
        Running full linting checks on entire codebase for every PR, causing
        long wait times and developer frustration.
      </description>
      <consequence>
        Slower development cycle, reduced productivity, skipped checks.
      </consequence>
      <solution>
        Use lint-staged, enable caching, lint only changed files in CI, or use
        incremental linting services.
      </solution>
    </pattern>

    <pattern id="no-automation" severity="low">
      <title>Lack of Automation</title>
      <description>
        Relying on manual linting instead of setting up pre-commit hooks and
        CI checks.
      </description>
      <consequence>
        Inconsistent enforcement, missed issues, code review friction.
      </consequence>
      <solution>
        Set up Husky and lint-staged for local automation, integrate with CI for
        PR enforcement.
      </solution>
    </pattern>
  </anti_patterns>

  <examples>
    <section title="TypeScript/JavaScript">
      <example id="eslint-typescript">
        <title>Complete ESLint Configuration for TypeScript + React</title>
        <code_block language="javascript">
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.*.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-key': ['error', { checkFragmentShorthand: true }],

    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Import
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/no-duplicates': 'error',

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
  },
  ignorePatterns: [
    'dist',
    'build',
    'coverage',
    'node_modules',
    '*.config.js',
    '*.config.ts',
    '.eslintrc.js',
  ],
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: { jest: true },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
};
        </code_block>
      </example>

      <example id="prettier-config">
        <title>Prettier Configuration with Overrides</title>
        <code_block language="json">
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "jsxBracketSameLine": false,
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "proseWrap": "preserve",
        "printWidth": 80
      }
    },
    {
      "files": ["*.json", "*.yml"],
      "options": {
        "tabWidth": 2
      }
    },
    {
      "files": "*.css",
      "options": {
        "singleQuote": false
      }
    }
  ]
}
        </code_block>
      </example>

      <example id="husky-setup">
        <title>Git Hooks Setup with Husky and lint-staged</title>
        <code_block language="bash">
# Install dependencies
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky-init

# Create pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# Create commit-msg hook for conventional commits
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
        </code_block>
      </example>

      <example id="lint-staged-config">
        <title>lint-staged Configuration</title>
        <code_block language="json">
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{ts,tsx}": [
      "bash -c 'tsc --noEmit --pretty || (echo \"Type check failed\"; exit 1)'"
    ]
  }
}
        </code_block>
      </example>
    </section>

    <section title="Python">
      <example id="python-ruff">
        <title>Python Linting with Ruff (Modern, Fast)</title>
        <code_block language="toml">
# pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py311"
select = [
  "E",   # pycodestyle errors
  "W",   # pycodestyle warnings
  "F",   # Pyflakes
  "I",   # isort
  "B",   # flake8-bugbear
  "C4",  # flake8-comprehensions
  "UP",  # pyupgrade
  "ARG", # flake8-unused-arguments
  "SIM", # flake8-simplify
]
ignore = [
  "E501",  # line too long (handled by formatter)
  "B008",  # do not perform function calls in argument defaults
  "C901",  # too complex
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]  # unused imports
"tests/*" = ["ARG"]       # unused arguments in tests

[tool.ruff.isort]
known-first-party = ["myapp"]
        </code_block>
      </example>

      <example id="python-black">
        <title>Python Formatting with Black</title>
        <code_block language="toml">
# pyproject.toml
[tool.black]
line-length = 100
target-version = ["py311"]
include = '\.pyi?$'
exclude = '''
/(
    \.git
  | \.mypy_cache
  | \.ruff_cache
  | \.venv
  | build
  | dist
)/
'''
        </code_block>
      </example>
    </section>

    <section title="Go">
      <example id="go-golangci-lint">
        <title>Go Linting with golangci-lint</title>
        <code_block language="yaml">
# .golangci.yml
run:
  timeout: 5m
  tests: true
  modules-download-mode: readonly

linters:
  disable-all: true
  enable:
    - gofmt
    - govet
    - errcheck
    - staticcheck
    - unused
    - gosimple
    - ineffassign
    - typecheck
    - goimports
    - misspell
    - gocritic
    - gosec
    - revive
    - stylecheck
    - unconvert
    - unparam
    - nakedret
    - prealloc
    - exportloopref

linters-settings:
  govet:
    enable-all: true
  errcheck:
    check-type-assertions: true
    check-blank: true
  gocritic:
    enabled-tags:
      - performance
      - diagnostic
      - style
  revive:
    confidence: 0.8
    rules:
      - name: exported
        severity: warning
      - name: var-naming
        severity: warning

issues:
  exclude-use-default: false
  max-issues-per-linter: 0
  max-same-issues: 0
        </code_block>
      </example>
    </section>
  </examples>

  <integration_notes>
    <section title="IDE Integration">
      <subsection title="VS Code">
        <integration>
          <title>Recommended Extensions</title>
          <extensions>
            <extension>dbaeumer.vscode-eslint - ESLint integration</extension>
            <extension>esbenp.prettier-vscode - Prettier formatter</extension>
            <extension>EditorConfig.EditorConfig - EditorConfig support</extension>
          </extensions>
        </integration>

        <integration>
          <title>Workspace Settings</title>
          <code_block language="json">
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.workingDirectories": [
    { "directory": ".", "changeProcessCWD": true }
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
          </code_block>
        </integration>
      </subsection>

      <subsection title="WebStorm / IntelliJ IDEA">
        <integration>
          <title>Configuration Steps</title>
          <steps>
            <step>Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint</step>
            <step>Enable "Automatic ESLint configuration"</step>
            <step>Settings → Languages & Frameworks → JavaScript → Prettier</step>
            <step>Enable "On save" and "On code reformat"</step>
            <step>Set "Run for files" to match your project</step>
          </steps>
        </integration>
      </subsection>

      <subsection title="Neovim / Vim">
        <integration>
          <title>Nvim-lspconfig Setup</title>
          <code_block language="lua">
-- init.lua
local lspconfig = require('lspconfig')

lspconfig.eslint.setup({
  settings = {
    codeActionOnSave = {
      enable = true,
      mode = "all"
    },
    format = true
  },
  on_attach = function(client)
    client.resolved_capabilities.document_formatting = true
    vim.api.nvim_create_autocmd("BufWritePre", {
      buffer = bufnr,
      command = "EslintFixAll"
    })
  end
})

-- Null-ls for Prettier
local null_ls = require("null-ls")
null_ls.setup({
  sources = {
    null_ls.builtins.formatting.prettier,
  }
})
          </code_block>
        </integration>
      </subsection>
    </section>

    <section title="CI/CD Pipelines">
      <subsection title="GitHub Actions">
        <integration>
          <title>Linting Workflow</title>
          <code_block language="yaml">
# .github/workflows/lint.yml
name: Lint

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

      - name: TypeScript type check
        run: npm run type-check

      - name: Annotate lint failures
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            // Custom annotation logic
          </code_block>
        </integration>
      </subsection>

      <subsection title="GitLab CI">
        <integration>
          <title>Linting Stage</title>
          <code_block language="yaml">
# .gitlab-ci.yml
stages:
  - lint

lint:
  stage: lint
  image: node:20
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run lint
    - npm run format:check
  artifacts:
    reports:
      junit: lint-report.xml
  only:
    - merge_requests
    - main
    - develop
          </code_block>
        </integration>
      </subsection>

      <subsection title="Pre-commit.ci">
        <integration>
          <title>Cloud-based Pre-commit Hooks</title>
          <description>
            Pre-commit.ci runs your pre-commit hooks in CI and automatically
            pushes fixes back to your PR. Free for public repositories.
          </description>
          <configuration>
            <code_block language="yaml">
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.3
    hooks:
      - id: prettier
        types_or: [javascript, jsx, ts, tsx, json, yaml]

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.50.0
    hooks:
      - id: eslint
        files: \.(ts|tsx|js|jsx)$
        additional_dependencies:
          - eslint
          - typescript
          - @typescript-eslint/parser
          - @typescript-eslint/eslint-plugin

ci:
  autofix_prs: true
  autofix_commit_msg: 'style: auto-fix linting issues'
  skip: []
  submodules: false
            </code_block>
          </configuration>
        </integration>
      </subsection>
    </section>
  </integration_notes>

  <error_handling>
    <section title="Common Linter Errors">
      <subsection title="Parsing Errors">
        <error id="parse-error">
          <title>Syntax Parsing Error</title>
          <description>
            Linter cannot parse the file due to syntax errors or unsupported
            language features.
          </description>
          <solution>
            <steps>
              <step>Check for syntax errors in the file</step>
              <step>Verify parser configuration matches your language version</step>
              <step>Ensure required plugins are installed</step>
              <step>Check for special characters or encoding issues</step>
            </steps>
          </solution>
        </error>
      </subsection>

      <subsection title="Module Resolution">
        <error id="module-not-found">
          <title>Module Not Found</title>
          <description>
            Linter cannot resolve import paths, especially in TypeScript projects
            with path mapping.
          </description>
          <solution>
            <steps>
              <step>Configure import/resolver in ESLint settings</step>
              <step>Ensure tsconfig.json paths are correctly set</step>
              <step>Verify baseUrl and paths in tsconfig</step>
              <step>Check for case sensitivity in imports</step>
            </steps>
          </solution>
          <example>
            <code_block language="javascript">
// .eslintrc.js
settings: {
  'import/resolver': {
    typescript: {
      alwaysTryTypes: true,
      project: './tsconfig.json',
    },
  },
}
            </code_block>
          </example>
        </error>
      </subsection>

      <subsection title="TypeScript Errors">
        <error id="type-aware-rules">
          <title>Type-Aware Rules Not Working</title>
          <description>
            TypeScript-specific rules require additional configuration and
          significantly slower performance.
          </description>
          <solution>
            <steps>
              <step>Set parserOptions.project to point to tsconfig.json</step>
              <step>Ensure tsconfig.json includes all files</step>
              <step>Use tsconfigRootDir for monorepos</step>
              <step>Consider using type-aware rules only in CI</step>
            </steps>
          </solution>
        </error>
      </subsection>

      <subsection title="Performance Issues">
        <error id="slow-linting">
          <title>Linting is Too Slow</title>
          <description>
            Linter takes excessive time, especially in large codebases.
          </description>
          <solution>
            <steps>
              <step>Enable ESLint caching with --cache flag</step>
              <step>Disable type-aware rules for local development</step>
              <step>Use lint-staged to only check changed files</step>
              <step>Consider using eslint-parallel or similar tools</step>
              <step>Profile and identify slow rules</step>
            </steps>
          </solution>
        </error>
      </subsection>
    </section>

    <section title="Warning Management">
      <subsection title="Gradual Enforcement">
        <strategy>
          <title>Warnings Before Errors</title>
          <description>
            When introducing new rules to existing codebases, start with
          warnings and convert to errors after a transition period.
          </description>
          <implementation>
            <code_block language="javascript">
rules: {
  // New rule - start as warning
  'no-prototype-builtins': 'warn',

  // After team adjusts (1-2 sprints), upgrade to error
  // 'no-prototype-builtins': 'error',
}
            </code_block>
          </implementation>
        </strategy>
      </subsection>

      <subsection title="Override Patterns">
        <strategy>
          <title>Targeted Overrides</title>
          <description>
            Use ESLint overrides for specific files or directories that need
          different rules (tests, legacy code, generated files).
          </description>
          <implementation>
            <code_block language="javascript">
overrides: [
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    env: { jest: true },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['legacy/**/*'],
    rules: {
      'no-var': 'off',
      'prefer-const': 'off',
    },
  },
]
            </code_block>
          </implementation>
        </strategy>
      </subsection>
    </section>
  </error_handling>

  <output_format>
    <section title="Report Formats">
      <subsection title="Console Output">
        <format>
          <title>Human-Readable Console</title>
          <description>
            Default ESLint output with color-coded severity levels and file
            locations. Suitable for local development.
          </description>
          <options>
            <option>--format stylish (default)</option>
            <option>--format compact (one line per issue)</option>
            <option>--format unix (machine-parseable)</option>
          </options>
        </format>
      </subsection>

      <subsection title="File Reports">
        <format>
          <title>JSON Report</title>
          <description>
            Machine-readable output for integration with other tools or
            custom processing.
          </description>
          <command>eslint . --format json --output-file eslint-report.json</command>
          <example>
            <code_block language="json">
{
  "filePath": "src/app.ts",
  "messages": [
    {
      "ruleId": "semi",
      "severity": 2,
      "message": "Missing semicolon.",
      "line": 10,
      "column": 15
    }
  ],
  "errorCount": 1,
  "warningCount": 0,
  "fatalErrorCount": 0
}
            </code_block>
          </example>
        </format>

        <format>
          <title>JUnit XML</title>
          <description>
            XML format compatible with CI/CD tools and test reporting systems.
          </description>
          <command>eslint . --format junit --output-file eslint-report.xml</command>
          <use_case>GitLab CI test reports, Jenkins test results</use_case>
        </format>

        <format>
          <title>HTML Report</title>
          <description>
            Visual HTML report for comprehensive code quality reviews.
          </description>
          <installation>npm install --save-dev eslint-formatter-html</installation>
          <command>eslint . --format html --output-file eslint-report.html</command>
        </format>
      </subsection>

      <subsection title="Visual Summary">
        <format>
          <title>Summary Dashboard</title>
          <description>
            Generate visual dashboard of linting results over time.
          </description>
          <tools>
            <tool>eslint-dashboard - Web-based visualization</tool>
            <tool>eslint-visualizer - Dependency graph visualization</tool>
            <tool>Custom dashboards with JSON output</tool>
          </tools>
        </format>
      </subsection>
    </section>

    <section title="Metrics to Track">
      <metrics>
        <metric>
          <title>Error/Warning Count</title>
          <description>Total number of issues per build</description>
          <target>Trend downward over time</target>
        </metric>
        <metric>
          <title>Fix Rate</title>
          <description>Percentage of auto-fixable issues</description>
          <target>Increase through better rule configuration</target>
        </metric>
        <metric>
          <title>Lint Time</title>
          <description>Time to complete linting checks</description>
          <target>Decrease through caching and optimization</target>
        </metric>
        <metric>
          <title>Rule Violations by Type</title>
          <description>Breakdown of issues by rule/category</description>
          <target>Identify problematic patterns for training</target>
        </metric>
      </metrics>
    </section>
  </output_format>

  <related_skills>
    <skill category="development-workflow">
      <name>ci-cd-pipelines</name>
      <description>Integrating linting into automated build and deployment pipelines</description>
    </skill>
    <skill category="development-workflow">
      <name>code-review</name>
      <description>Using linting results to inform code review process</description>
    </skill>
    <skill category="testing-quality">
      <name>testing-frameworks</name>
      <description>Complementing linting with comprehensive test coverage</description>
    </skill>
    <skill category="development-workflow">
      <name>pre-commit-hooks</name>
      <description>Automating quality checks before commits</description>
    </skill>
  </related_skills>

  <see_also>
    <reference>
      <title>Official Documentation</title>
      <links>
        <link>https://eslint.org/docs/latest/ - ESLint Documentation</link>
        <link>https://prettier.io/docs/en/ - Prettier Documentation</link>
        <link>https://github.com/prettier/eslint-config-prettier - ESLint + Prettier Integration</link>
        <link>https://github.com/okonet/lint-staged - lint-staged Documentation</link>
        <link>https://typicode.github.io/husky/ - Husky Git Hooks</link>
      </links>
    </reference>

    <reference>
      <title>Style Guides</title>
      <links>
        <link>https://github.com/airbnb/javascript - Airbnb JavaScript Style Guide</link>
        <link>https://standardjs.com/ - JavaScript Standard Style</link>
        <link>https://google.github.io/styleguide/ - Google Style Guides</link>
        <link>https://github.com/rust-lang/rustfmt - Rust Formatting</link>
        <link>https://golang.org/doc/effective_go.html - Go Effective Style</link>
      </links>
    </reference>

    <reference>
      <title>Tool-Specific Resources</title>
      <links>
        <link>https://astropy.readthedocs.io/en/latest/linting.html - Python Linting Guide</link>
        <link>https://golangci-lint.run/ - golangci-lint Documentation</link>
        <link>https://docs.astral.sh/ruff/ - Ruff Python Linter</link>
        <link>https://marketplace.visualstudio.com/ - VS Code Extensions Marketplace</link>
        <link>https://plugins.jetbrains.com/ - JetBrains Plugins Repository</link>
      </links>
    </reference>

    <reference>
      <title>Blog Posts & Articles</title>
      <links>
        <link>https://eslint.org/docs/latest/use/configure/configuration-files-new - New ESLint Config Format</link>
        <link>https://prettier.io/docs/en/option-rationale.html - Prettier Options Rationale</link>
        <link>https://www.robertcooper.me/using-eslint-and-prettier-in-a-typescript-project - ESLint + Prettier + TypeScript</link>
      </links>
    </reference>
  </see_also>

  <changelog>
    <entry version="1.0.0" date="2024-01-18">
      <changes>
        <change>Initial skill creation</change>
        <change>Comprehensive ESLint and Prettier configuration examples</change>
        <change>Multi-language support (JavaScript, Python, Go, Rust)</change>
        <change>CI/CD integration patterns</change>
        <change>IDE setup for VS Code, WebStorm, Neovim</change>
        <change>Best practices and anti-patterns documentation</change>
        <change>Performance optimization strategies</change>
      </changes>
    </entry>
  </changelog>
</skill>
```
