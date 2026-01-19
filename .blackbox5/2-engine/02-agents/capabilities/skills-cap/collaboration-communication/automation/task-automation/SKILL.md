---
name: task-automation
category: collaboration-communication/automation
version: 1.0.0
description: Task automation patterns and workflows for repetitive development tasks
author: blackbox5/core
verified: true
tags: [automation, tasks, workflows, scripts, productivity]
---

# Task Automation Patterns

## Overview

This skill provides comprehensive patterns and workflows for automating repetitive development tasks, increasing productivity, and reducing human error in software development workflows.

```xml
<context>
  <fundamentals>
    <definition>
      Task automation is the practice of using scripts, tools, and workflows to execute repetitive tasks
      automatically, reducing manual effort and minimizing human error.
    </definition>
    <benefits>
      <benefit priority="1">
        <name>Consistency</name>
        <description>Automated tasks produce identical results every time</description>
        <impact>Eliminates variation and "works on my machine" issues</impact>
      </benefit>
      <benefit priority="2">
        <name>Time Savings</name>
        <description>Reduces manual execution time from minutes/hours to seconds</description>
        <impact>Frees up developer time for high-value work</impact>
      </benefit>
      <benefit priority="3">
        <name>Error Reduction</name>
        <description>Eliminates manual errors from fatigue or distraction</description>
        <impact>Improves reliability and reduces debugging time</impact>
      </benefit>
      <benefit priority="4">
        <name>Documentation</name>
        <description>Scripts serve as executable documentation</description>
        <impact>Makes processes discoverable and teachable</impact>
      </benefit>
      <benefit priority="5">
        <name>Scalability</name>
        <description>Automated processes scale without additional effort</description>
        <impact>Handles increased workload linearly</impact>
      </benefit>
    </benefits>
    <automation_types>
      <type>
        <category>Build Automation</category>
        <examples>Compilation, bundling, optimization, asset generation</examples>
        <tools>webpack, vite, esbuild, rollup</tools>
      </type>
      <type>
        <category>Task Runners</category>
        <examples>File operations, testing, linting, formatting</examples>
        <tools>npm scripts, make, grunt, gulp</tools>
      </type>
      <type>
        <category>CI/CD Automation</category>
        <examples>Testing, deployment, releases, notifications</examples>
        <tools>GitHub Actions, GitLab CI, Jenkins, CircleCI</tools>
      </type>
      <type>
        <category>Git Automation</category>
        <examples>Commit hooks, branch management, changelog generation</examples>
        <tools>husky, lint-staged, semantic-release</tools>
      </type>
      <type>
        <category>Development Workflow</category>
        <examples>Database migrations, seeding, environment setup</examples>
        <tools>custom scripts, docker-compose, Makefiles</tools>
      </type>
    </automation_types>
  </fundamentals>

  <productivity_metrics>
    <metric>
      <name>Task Frequency</name>
      <threshold>Daily or weekly execution</threshold>
      <guideline>Automate tasks performed 3+ times per week</guideline>
    </metric>
    <metric>
      <name>Task Duration</name>
      <threshold>5+ minutes per execution</threshold>
      <guideline>Automate tasks that consume significant time</guideline>
    </metric>
    <metric>
      <name>Error Rate</name>
      <threshold>Any manual errors in execution</threshold>
      <guideline>Automate error-prone tasks immediately</guideline>
    </metric>
    <metric>
      <name>Team Impact</name>
      <threshold>Multiple team members perform task</threshold>
      <guideline>Automate shared tasks for consistency</guideline>
    </metric>
  </productivity_metrics>
</context>

<instructions>
  <task_identification>
    <step order="1">
      <name>Audit Current Workflow</name>
      <action>
        Track all repetitive tasks for one week using a simple log:
        - Task name
        - Frequency
        - Duration
        - Pain points/errors
        - Dependencies
      </action>
      <tools>Time tracking apps, notebook, git history</tools>
    </step>
    <step order="2">
      <name>Prioritize Automation Candidates</name>
      <action>
        Score tasks using the Automation Priority Formula:
        Score = (Frequency × Duration × Team Size) / Implementation Effort

        Prioritize tasks with scores > 10
      </action>
    </step>
    <step order="3">
      <name>Analyze Task Requirements</name>
      <action>
        Document:
        - Input parameters and data sources
        - Expected outputs and side effects
        - Failure modes and edge cases
        - Integration points with other systems
        - Security considerations (credentials, secrets)
      </action>
    </step>
    <step order="4">
      <name>Choose Automation Approach</name>
      <action>
        Select based on complexity and requirements:
        - Simple: Shell script or npm script
        - Medium: Makefile or task runner (gulp/grunt)
        - Complex: Custom Node.js/Python script
        - Team-shared: CI/CD workflow or GitHub Action
      </action>
    </step>
  </task_identification>

  <implementation_guide>
    <phase name="Design">
      <practice>
        <name>Define Clear Contract</name>
        <implementation>
          - Specify exact input/output format
          - Document all parameters and defaults
          - Define exit codes and error conditions
          - Specify environment variable requirements
        </implementation>
      </practice>
      <practice>
        <name>Plan for Failures</name>
        <implementation>
          - Identify all possible failure points
          - Design error handling for each case
          - Plan rollback mechanisms
          - Define logging requirements
        </implementation>
      </practice>
    </phase>

    <phase name="Development">
      <practice>
        <name>Start Simple</name>
        <implementation>
          - Begin with basic happy path
          - Add error handling incrementally
          - Test manually at each step
          - Add complexity only when needed
        </implementation>
      </practice>
      <practice>
        <name>Use Idempotent Operations</name>
        <implementation>
          - Scripts should be safe to run multiple times
          - Check for existing state before creating
          - Use "create or update" patterns
          - Clean up partial state on failure
        </implementation>
      </practice>
      <practice>
        <name>Provide User Feedback</name>
        <implementation>
          - Print clear progress messages
          - Use colors/emojis for readability
          - Show duration and summary statistics
          - Provide next steps or suggestions
        </implementation>
      </practice>
    </phase>

    <phase name="Testing">
      <practice>
        <name>Test Edge Cases</name>
        <implementation>
          - Empty inputs
          - Missing dependencies
          - Permission errors
          - Network failures
          - Existing state
        </implementation>
      </practice>
      <practice>
        <name>Validate Outputs</name>
        <implementation>
          - Check return codes
          - Verify generated files
          - Validate against expected schema
          - Test integration points
        </implementation>
      </practice>
    </phase>

    <phase name="Documentation">
      <practice>
        <name>Document Usage</name>
        <implementation>
          - Provide clear examples
          - Document all parameters
          - Include troubleshooting section
          - Add common use cases
        </implementation>
      </practice>
    </phase>
  </implementation_guide>
</instructions>

<rules>
  <error_handling>
    <rule priority="critical">
      <name>Always Use Set -e (Bash)</name>
      <rationale>
        Exit immediately if any command fails. This prevents cascading errors
        and makes failures obvious rather than silently continuing.
      </rationale>
      <implementation>
        #!/bin/bash
        set -e  # Exit on error
        set -u  # Exit on undefined variable
        set -o pipefail  # Exit on pipe failure
      </implementation>
    </rule>

    <rule priority="critical">
      <name>Validate Inputs Early</name>
      <rationale>
        Fail fast with clear error messages rather than executing with invalid data.
      </rationale>
      <implementation>
        # Check required arguments
        if [ -z "$1" ]; then
          echo "Error: Missing required argument"
          echo "Usage: $0 <environment>"
          exit 1
        fi

        # Validate argument values
        if [[ ! "$1" =~ ^(dev|staging|prod)$ ]]; then
          echo "Error: Environment must be dev, staging, or prod"
          exit 1
        fi
      </implementation>
    </rule>

    <rule priority="high">
      <name>Provide Meaningful Error Messages</name>
      <rationale>
        Clear error messages reduce debugging time and improve user experience.
      </rationale>
      <implementation>
        # Bad
        echo "Failed"

        # Good
        echo "Error: Failed to connect to database at $DB_HOST"
        echo "  - Host: $DB_HOST"
        echo "  - Port: $DB_PORT"
        echo "  - Check credentials and network connectivity"
        exit 1
      </implementation>
    </rule>

    <rule priority="high">
      <name>Use Exit Codes Consistently</name>
      <rationale>
        Standard exit codes enable scripting and CI/CD integration.
      </rationale>
      <implementation>
        # Standard exit codes
        EXIT_SUCCESS=0
        EXIT_ERROR=1
        EXIT_INVALID_ARGS=2
        EXIT_MISSING_DEPS=3
        EXIT_PERMISSION_DENIED=4

        # Usage
        exit $EXIT_SUCCESS
      </implementation>
    </rule>
  </error_handling>

  <idempotency>
    <rule priority="high">
      <name>Check Before Creating</name>
      <implementation>
        # Directory creation
        if [ ! -d "$DIR" ]; then
          mkdir -p "$DIR"
          echo "Created directory: $DIR"
        else
          echo "Directory exists: $DIR"
        fi

        # File creation
        if [ ! -f "$FILE" ]; then
          touch "$FILE"
          echo "Created file: $FILE"
        fi
      </implementation>
    </rule>

    <rule priority="high">
      <name>Clean Up on Failure</name>
      <implementation>
        #!/bin/bash
        set -e
        trap cleanup EXIT

        cleanup() {
          if [ $? -ne 0 ]; then
            echo "Cleaning up partial state..."
            rm -rf /tmp/temp-build
          fi
        }

        # Work with temporary directory
        mkdir -p /tmp/temp-build
        # ... build steps ...
      </implementation>
    </rule>
  </idempotency>

  <logging>
    <rule priority="medium">
      <name>Log With Context</name>
      <implementation>
        # Use timestamps
        log() {
          echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
        }

        # Use log levels
        log_info() { echo "[INFO] $*"; }
        log_warn() { echo "[WARN] $*" >&2; }
        log_error() { echo "[ERROR] $*" >&2; }

        # Usage
        log_info "Starting build"
        log_warn "Deprecated flag used"
        log_error "Build failed"
      </implementation>
    </rule>

    <rule priority="medium">
      <name>Make Logs Machine-Readable</name>
      <implementation>
        # Include structured data
        echo '{"level":"info","message":"Build complete","duration":"45s"}'

        # Or use grep-friendly format
        echo "BUILD_COMPLETE | duration=45s | status=success"
      </implementation>
    </rule>
  </logging>

  <security>
    <rule priority="critical">
      <name>Never Hardcode Secrets</name>
      <implementation>
        # Bad
        API_KEY="sk_live_12345"

        # Good
        API_KEY="${API_KEY:-$(grep API_KEY .env | cut -d= -f2)}"

        # Better - use environment
        API_KEY="${API_KEY:?Error: API_KEY not set}"
      </implementation>
    </rule>

    <rule priority="high">
      <name>Validate File Paths</name>
      <implementation>
        # Prevent path traversal
        sanitize_path() {
          local path="$1"
          # Remove .. and absolute paths
          path=$(echo "$path" | sed 's/\.\.//g' | sed 's|^/||')
          echo "$path"
        }

        FILE=$(sanitize_path "$USER_INPUT")
      </implementation>
    </rule>
  </security>
</rules>

<workflow>
  <phase name="Task Identification">
    <steps>
      <step order="1">
        <name>Monitor and Log</name>
        <duration>1 week</duration>
        <actions>
          - Track manual tasks performed
          - Record time spent on each
          - Note pain points and errors
          - Identify repetitive patterns
        </actions>
        <output>Task inventory document</output>
      </step>
      <step order="2">
        <name>Calculate ROI</name>
        <actions>
          - Estimate automation time investment
          - Calculate time saved per execution
          - Multiply by frequency
          - Prioritize high-ROI tasks
        </actions>
        <output>Prioritized automation backlog</output>
      </step>
    </steps>
  </phase>

  <phase name="Solution Design">
    <steps>
      <step order="1">
        <name>Define Requirements</name>
        <actions>
          - Document input specification
          - Define expected outputs
          - Identify dependencies
          - Specify success criteria
        </actions>
        <output>Requirements document</output>
      </step>
      <step order="2">
        <name>Select Technology</name>
        <actions>
          - Evaluate task complexity
          - Consider team familiarity
          - Check existing tooling
          - Choose appropriate approach
        </actions>
        <output>Technology choice with rationale</output>
      </step>
      <step order="3">
        <name>Design Interface</name>
        <actions>
          - Define command syntax
          - Specify parameters
          - Plan error handling
          - Design user feedback
        </actions>
        <output>Interface specification</output>
      </step>
    </steps>
  </phase>

  <phase name="Implementation">
    <steps>
      <step order="1">
        <name>Setup Project Structure</name>
        <actions>
          - Create script directory
          - Setup configuration files
          - Initialize dependencies
          - Create entry point
        </actions>
      </step>
      <step order="2">
        <name>Implement Core Logic</name>
        <actions>
          - Write primary functionality
          - Add input validation
          - Implement main workflow
          - Add progress reporting
        </actions>
      </step>
      <step order="3">
        <name>Add Error Handling</name>
        <actions>
          - Wrap operations in error handlers
          - Add validation checks
          - Implement cleanup logic
          - Add helpful error messages
        </actions>
      </step>
      <step order="4">
        <name>Add Logging</name>
        <actions>
          - Log key operations
          - Track execution time
          - Record results
          - Enable debug mode
        </actions>
      </step>
    </steps>
  </phase>

  <phase name="Testing">
    <steps>
      <step order="1">
        <name>Unit Testing</name>
        <actions>
          - Test individual functions
          - Verify error conditions
          - Check edge cases
          - Validate outputs
        </actions>
      </step>
      <step order="2">
        <name>Integration Testing</name>
        <actions>
          - Test with real data
          - Verify external integrations
          - Check side effects
          - Validate end-to-end flow
        </actions>
      </step>
      <step order="3">
        <name>Manual Testing</name>
        <actions>
          - Run locally multiple times
          - Test on different environments
          - Verify idempotency
          - Check error recovery
        </actions>
      </step>
    </steps>
  </phase>

  <phase name="Documentation">
    <steps>
      <step order="1">
        <name>Write Usage Guide</name>
        <actions>
          - Provide clear examples
          - Document all parameters
          - Include common scenarios
          - Add troubleshooting tips
        </actions>
      </step>
      <step order="2">
        <name>Create Reference Docs</name>
        <actions>
          - Document configuration options
          - Explain error codes
          - Provide API reference
          - Include development guide
        </actions>
      </step>
      <step order="3">
        <name>Add Inline Documentation</name>
        <actions>
          - Comment complex logic
          - Explain design decisions
          - Document edge cases
          - Add usage examples
        </actions>
      </step>
    </steps>
  </phase>

  <phase name="Deployment">
    <steps>
      <step order="1">
        <name>Team Rollout</name>
        <actions>
          - Announce new automation
          - Provide training/demo
          - Share documentation
          - Gather feedback
        </actions>
      </step>
      <step order="2">
        <name>Monitor Usage</name>
        <actions>
          - Track execution frequency
          - Monitor error rates
          - Collect user feedback
          - Identify improvements
        </actions>
      </step>
      <step order="3">
        <name>Iterate</name>
        <actions>
          - Address feedback
          - Fix issues
          - Add features
          - Improve documentation
        </actions>
      </step>
    </steps>
  </phase>
</workflow>

<best_practices>
  <organization>
    <practice>
      <name>Centralize Scripts</name>
      <description>
        Keep all automation scripts in a dedicated directory with clear structure.
      </description>
      <example>
        /scripts
          /build       # Build-related scripts
          /deploy      # Deployment scripts
          /db          # Database operations
          /dev         # Development utilities
          /tools       # Helper tools
      </example>
    </practice>

    <practice>
      <name>Use Descriptive Names</name>
      <description>
        Script names should clearly indicate what they do.
      </description>
      <example>
        # Bad
        run.sh
        do-it.sh
        script.sh

        # Good
        build-production.sh
        migrate-database.sh
        deploy-to-staging.sh
        generate-api-keys.sh
      </example>
    </practice>

    <practice>
      <name>Make Scripts Executable</name>
      <description>
        Set executable permissions and add shebang.
      </description>
      <example>
        #!/bin/bash
        # Set executable
        chmod +x scripts/build.sh

        # Now can run directly
        ./scripts/build.sh
      </example>
    </practice>
  </organization>

  <configuration>
    <practice>
      <name>Externalize Configuration</name>
      <description>
        Store configuration in separate files, not hardcoded in scripts.
      </description>
      <example>
        # .env file
        NODE_ENV=production
        API_URL=https://api.example.com
        TIMEOUT=30000

        # Script reads from .env
        source .env
        curl -s "$API_URL" --max-time "$TIMEOUT"
      </example>
    </practice>

    <practice>
      <name>Use Environment Variables</name>
      <description>
        Support environment-specific configuration through variables.
      </description>
      <example>
        # Provide defaults
        ENVIRONMENT="${ENVIRONMENT:-development}"
        PORT="${PORT:-3000}"
        DEBUG="${DEBUG:-false}"

        # Validate required vars
        : "${DATABASE_URL:?DATABASE_URL not set}"
      </example>
    </practice>

    <practice>
      <name>Support Configuration Files</name>
      <description>
        Allow complex configuration through JSON/YAML files.
      </description>
      <example>
        # config.json
        {
          "database": {
            "host": "localhost",
            "port": 5432
          },
          "features": {
            "enableCache": true
          }
        }

        # Script reads config
        CONFIG=$(cat config.json)
        DB_HOST=$(echo "$CONFIG" | jq -r '.database.host')
      </example>
    </practice>
  </configuration>

  <error_handling>
    <practice>
      <name>Fail Fast and Clearly</name>
      <description>
        Detect errors early and provide actionable error messages.
      </description>
      <example>
        # Check prerequisites
        check_requirements() {
          command -v node >/dev/null 2>&1 || {
            echo "Error: Node.js is required but not installed"
            echo "Install from https://nodejs.org/"
            exit 1
          }

          [ -f ".env" ] || {
            echo "Error: .env file not found"
            echo "Copy .env.example to .env and configure"
            exit 1
          }
        }

        check_requirements
      </example>
    </practice>

    <practice>
      <name>Use Trap for Cleanup</name>
      <description>
        Ensure cleanup happens even on failure.
      </description>
      <example>
        #!/bin/bash
        trap cleanup EXIT INT TERM

        cleanup() {
          echo "Cleaning up..."
          rm -rf /tmp/workdir
          docker-compose down
        }

        # Setup
        mkdir -p /tmp/workdir
        docker-compose up -d

        # Work
        # ... even if this fails, cleanup runs
      </example>
    </practice>
  </error_handling>

  <documentation>
    <practice>
      <name>Add Help Messages</name>
      <description>
        Include built-in documentation accessible via --help flag.
      </description>
      <example>
        #!/bin/bash

        show_help() {
          cat << EOF
        Usage: $0 [OPTIONS] COMMAND

        Commands:
          build      Build the project
          test       Run tests
          deploy     Deploy to environment

        Options:
          -e, --env ENV     Environment (dev|staging|prod)
          -v, --verbose     Enable verbose output
          -h, --help        Show this help message

        Examples:
          $0 build
          $0 -e prod deploy
        EOF
        }

        # Parse arguments
        while [[ $# -gt 0 ]]; do
          case $1 in
            -h|--help)
              show_help
              exit 0
              ;;
            # ... other cases
          esac
        done
      </example>
    </practice>

    <practice>
      <name>Include Usage Examples</name>
      <description>
        Provide real examples in script comments or help text.
      </description>
      <example>
        #!/bin/bash
        #
        # Database Migration Script
        #
        # Usage:
        #   ./migrate.sh                    # Run all pending migrations
        #   ./migrate.sh status             # Show migration status
        #   ./migrate.sh create add_users   # Create new migration
        #   ./migrate.sh rollback           # Rollback last migration
        #
        # Environment variables:
        #   DATABASE_URL    Connection string (required)
        #   MIGRATIONS_DIR  Migration files location (default: ./migrations)
      </example>
    </practice>
  </documentation>
</best_practices>

<anti_patterns>
  <anti_pattern severity="critical">
    <name>Silent Failures</name>
    <description>
      Scripts that continue execution after errors or hide failures.
    </description>
    <example>
      # BAD - Continues on error
      rm -rf /tmp/build
      tar -xzf build.tar.gz  # May fail, script continues
      npm install             # May fail, script continues

      # GOOD - Exits on first error
      set -e
      rm -rf /tmp/build
      tar -xzf build.tar.gz
      npm install
    </example>
    <consequences>
      - Corrupted build state
      - Hard-to-debug issues
      - False success reports
    </consequences>
    <solution>
      Always use `set -e` in bash scripts and check return codes.
    </solution>
  </anti_pattern>

  <anti_pattern severity="high">
    <name>Hardcoded Paths</name>
    <description>
      Scripts with absolute paths that break in different environments.
    </description>
    <example>
      # BAD
      cd /Users/john/projects/my-app
      node /Users/john/projects/my-app/scripts/build.js

      # GOOD
      SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
      PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
      cd "$PROJECT_ROOT"
      node "$SCRIPT_DIR/build.js"
    </example>
    <consequences>
      - Only works on original developer's machine
      - Fails in CI/CD
      - Breaks team onboarding
    </consequences>
    <solution>
      Use relative paths and script directory detection.
    </solution>
  </anti_pattern>

  <anti_pattern severity="high">
    <name>No Input Validation</name>
    <description>
      Scripts that don't validate arguments or environment.
    </description>
    <example>
      # BAD - No validation
      environment=$1
      aws cloudformation create-stack \
        --stack-name "myapp-$environment"

      # GOOD - Validate input
      environment=$1
      if [[ ! "$environment" =~ ^(dev|staging|prod)$ ]]; then
        echo "Error: Invalid environment: $environment"
        echo "Must be: dev, staging, or prod"
        exit 1
      fi
      aws cloudformation create-stack \
        --stack-name "myapp-$environment"
    </example>
    <consequences>
      - Destructive operations on wrong environment
      - Cryptic error messages
      - Wasted resources
    </consequences>
    <solution>
      Always validate inputs against expected patterns.
    </solution>
  </anti_pattern>

  <anti_pattern severity="medium">
    <name>Assuming Dependencies</name>
      <description>
        Scripts that assume required tools are installed.
      </description>
    <example>
      # BAD - Assumes Docker exists
      docker-compose up -d

      # GOOD - Check for Docker
      if ! command -v docker &> /dev/null; then
        echo "Error: Docker is not installed"
        echo "Install from https://docker.com"
        exit 1
      fi
      docker-compose up -d
    </example>
    <consequences>
      - Cryptic errors
      - Poor developer experience
      - Wasted debugging time
    </consequences>
    <solution>
      Check for required dependencies and provide helpful install instructions.
    </solution>
  </anti_pattern>

  <anti_pattern severity="medium">
    <name>Monolithic Scripts</name>
    <description>
      Single large scripts that do too many things.
    </description>
    <example>
      # BAD - 500-line script that does everything
      #!/bin/bash
      # ... 100 lines of setup ...
      # ... 200 lines of build logic ...
      # ... 100 lines of deploy logic ...
      # ... 100 lines of notification logic ...

      # GOOD - Modular approach
      #!/bin/bash
      source ./scripts/lib/setup.sh
      source ./scripts/lib/build.sh
      source ./scripts/lib/deploy.sh

      setup
      build
      deploy
    </example>
    <consequences>
      - Hard to maintain
      - Difficult to test
      - Impossible to reuse
    </consequences>
    <solution>
      Break scripts into reusable functions and modules.
    </solution>
  </anti_pattern>

  <anti_pattern severity="low">
    <name>No Verbose Mode</name>
    <description>
      Scripts that can't show detailed execution information.
    </description>
    <example>
      # BAD - No way to debug
      npm install
      npm run build

      # GOOD - Support verbose output
      VERBOSE="${VERBOSE:-false}"
      if [ "$VERBOSE" = "true" ]; then
        npm install --verbose
        npm run build -- --verbose
      else
        npm install --silent
        npm run build --silent
      fi
    </example>
    <consequences>
      - Can't debug failures
      - Hard to understand what's happening
    </consequences>
    <solution>
      Support verbose/debug modes for troubleshooting.
    </solution>
  </anti_pattern>
</anti_patterns>

<examples>
  <example category="npm-scripts">
    <name>Package.json Scripts</name>
    <description>
      Common automation patterns using npm scripts.
    </description>
    <code>
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css}\"",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist node_modules/.cache",
    "rebuild": "npm run clean && npm run build",
    "precommit": "npm run lint:fix && npm run format && npm run type-check",
    "prepare": "husky install"
  },
  "devDependencies": {
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
    </code>
  </example>

  <example category="github-actions">
    <name>CI/CD Workflow</name>
    <description>
      Automated testing and deployment workflow.
    </description>
    <code>
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test & Lint
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

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: test

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

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: build
          path: dist/

      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
    </code>
  </example>

  <example category="shell-script">
    <name>Database Migration Script</name>
    <description>
      Automated database migration with rollback support.
    </description>
    <code>
#!/bin/bash
#
# Database Migration Script
# Usage: ./migrate.sh [command] [options]
#

set -e
set -u
set -o pipefail

# Configuration
MIGRATIONS_DIR="${MIGRATIONS_DIR:-./migrations}"
DATABASE_URL="${DATABASE_URL:?Error: DATABASE_URL not set}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# Check prerequisites
check_requirements() {
  if ! command -v psql &> /dev/null; then
    log_error "psql is required but not installed"
    exit 1
  fi

  if [ ! -d "$MIGRATIONS_DIR" ]; then
    log_error "Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
  fi
}

# Run migration
run_migration() {
  local migration_file=$1

  log_info "Running migration: $migration_file"

  psql "$DATABASE_URL" -f "$migration_file"

  if [ $? -eq 0 ]; then
    log_info "Migration successful: $migration_file"
  else
    log_error "Migration failed: $migration_file"
    exit 1
  fi
}

# List pending migrations
list_pending() {
  log_info "Pending migrations:"

  for migration in "$MIGRATIONS_DIR"/*.sql; do
    local name=$(basename "$migration" .sql)
    echo "  - $name"
  done
}

# Run all pending migrations
migrate() {
  log_info "Starting database migration..."

  check_requirements

  # Create migrations table if not exists
  psql "$DATABASE_URL" -c "
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT NOW()
    );
  "

  # Run each unapplied migration
  for migration in "$MIGRATIONS_DIR"/*.sql; do
    local name=$(basename "$migration" .sql)

    # Check if already applied
    local applied=$(psql "$DATABASE_URL" -tAc "
      SELECT COUNT(*) FROM schema_migrations WHERE name = '$name'
    ")

    if [ "$applied" -eq 0 ]; then
      run_migration "$migration"

      # Record migration
      psql "$DATABASE_URL" -c "
        INSERT INTO schema_migrations (name) VALUES ('$name')
      "
    else
      log_info "Skipping applied migration: $name"
    fi
  done

  log_info "Migration complete"
}

# Rollback last migration
rollback() {
  log_warn "Rolling back last migration..."

  local last_migration=$(psql "$DATABASE_URL" -tAc "
    SELECT name FROM schema_migrations
    ORDER BY applied_at DESC
    LIMIT 1
  ")

  if [ -z "$last_migration" ]; then
    log_error "No migration to rollback"
    exit 1
  fi

  local rollback_file="$MIGRATIONS_DIR/${last_migration}.down.sql"

  if [ ! -f "$rollback_file" ]; then
    log_error "Rollback file not found: $rollback_file"
    exit 1
  fi

  log_info "Running rollback: $rollback_file"
  psql "$DATABASE_URL" -f "$rollback_file"

  psql "$DATABASE_URL" -c "
    DELETE FROM schema_migrations WHERE name = '$last_migration'
  "

  log_info "Rollback complete"
}

# Show help
show_help() {
  cat << EOF
Usage: $0 [COMMAND]

Commands:
  migrate      Run pending migrations
  rollback     Rollback last migration
  status       Show migration status
  help         Show this help

Environment Variables:
  DATABASE_URL      Database connection string (required)
  MIGRATIONS_DIR    Migration files directory (default: ./migrations)

Examples:
  $0 migrate
  DATABASE_URL="postgres://localhost/mydb" $0 migrate
  $0 rollback
EOF
}

# Main
case "${1:-}" in
  migrate)
    migrate
    ;;
  rollback)
    rollback
    ;;
  status)
    list_pending
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    log_error "Unknown command: ${1:-}"
    show_help
    exit 1
    ;;
esac
    </code>
  </example>

  <example category="makefile">
    <name>Makefile for Development Tasks</name>
    <description>
      Common development tasks using make.
    </description>
    <code>
# Makefile
.PHONY: help install build test lint clean dev deploy

# Default target
.DEFAULT_GOAL := help

# Variables
NODE_BIN := node_modules/.bin
SRC := src
DIST := dist

# Colors for help output
BLUE := \033[0;34m
NC := \033[0m

help: ## Show this help message
	@echo "$$(tput bold)Available commands:$$(tput sgr0)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${BLUE}%-20s${NC} %s\n", $$1, $$2}'

install: ## Install dependencies
	npm ci
	@echo "✓ Dependencies installed"

build: ## Build for production
	@echo "Building..."
	npm run build
	@echo "✓ Build complete"

dev: ## Start development server
	npm run dev

test: ## Run tests
	$(NODE_BIN)/vitest run

test:watch: ## Run tests in watch mode
	$(NODE_BIN)/vitest

test:coverage: ## Run tests with coverage
	$(NODE_BIN)/vitest run --coverage

lint: ## Run linter
	$(NODE_BIN)/eslint . --ext .ts,.tsx

lint:fix: ## Fix linting issues
	$(NODE_BIN)/eslint . --ext .ts,.tsx --fix

format: ## Format code
	$(NODE_BIN)/prettier --write "src/**/*.{ts,tsx,json,css}"

format:check: ## Check code formatting
	$(NODE_BIN)/prettier --check "src/**/*.{ts,tsx,json,css}"

type-check: ## Run TypeScript type checking
	npm run type-check

clean: ## Clean build artifacts
	rm -rf $(DIST)
	rm -rf node_modules/.cache
	@echo "✓ Clean complete"

rebuild: clean build ## Clean and rebuild

dev:docker: ## Start development environment with Docker
	docker-compose up -d
	docker-compose logs -f

test:integration: ## Run integration tests
	docker-compose -f docker-compose.test.yml up --abort-on-container-exit

deploy:staging: ## Deploy to staging
	npm run deploy -- --env staging

deploy:prod: ## Deploy to production
	npm run deploy -- --env production

db:migrate: ## Run database migrations
	./scripts/migrate.sh migrate

db:rollback: ## Rollback last migration
	./scripts/migrate.sh rollback

db:seed: ## Seed database with test data
	./scripts/seed.sh
    </code>
  </example>
</examples>

<integration_notes>
  <integration tool="npm">
    <usage>
      Use package.json "scripts" section for project-specific automation.
    </usage>
    <benefits>
      - Built into Node.js projects
      - Cross-platform compatibility
      - Easy to share with team
      - Integrates with lifecycle hooks
    </benefits>
    <examples>
      <example>npm run build</example>
      <example>npm run test:watch</example>
      <example>npm run lint:fix</example>
    </examples>
  </integration>

  <integration tool="make">
    <usage>
      Use Makefiles for complex multi-step workflows and project automation.
    </usage>
    <benefits>
      - Powerful dependency management
      - Excellent for build pipelines
      - Self-documenting with make help
      - Widely available on Unix systems
    </benefits>
    <examples>
      <example>make install</example>
      <example>make build</example>
      <example>make test:coverage</example>
    </examples>
  </integration>

  <integration tool="github-actions">
    <usage>
      Use GitHub Actions for CI/CD and automation on GitHub events.
    </usage>
    <benefits>
      - Free for public repositories
      - Integrated with GitHub
      - Rich marketplace of actions
      - Easy matrix testing
    </benefits>
    <triggers>
      <trigger>Push to branches</trigger>
      <trigger>Pull requests</trigger>
      <trigger>Scheduled (cron)</trigger>
      <trigger>Manual workflow dispatch</trigger>
      <trigger>Repository events (releases, issues)</trigger>
    </triggers>
  </integration>

  <integration tool="husky">
    <usage>
      Use Husky for Git hooks automation (pre-commit, pre-push, etc.).
    </usage>
    <benefits>
      - Enforce code quality
      - Run tests before commits
      - Prevent bad commits
      - Automate changelog generation
    </benefits>
    <examples>
      <example>
        # package.json
        "husky": {
          "hooks": {
            "pre-commit": "lint-staged",
            "pre-push": "npm test"
          }
        }
      </example>
    </examples>
  </integration>

  <integration tool="lint-staged">
    <usage>
      Run commands on staged files before commit.
    </usage>
    <benefits>
      - Faster than running on all files
      - Automatic formatting
      - Consistent code quality
      - Easy to configure
    </benefits>
    <configuration>
      {
        "lint-staged": {
          "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
          "*.{json,css,md}": ["prettier --write"]
        }
      }
    </configuration>
  </integration>
</integration_notes>

<error_handling>
  <error_type name="Script Failure">
    <description>Script exits with non-zero code</description>
    <handling>
      <step>Check exit code with echo $?</step>
      <step>Review error message for context</step>
      <step>Run with verbose/debug flag for details</step>
      <step>Check logs in configured log directory</step>
      <step>Verify prerequisites and environment</step>
    </handling>
  </error_type>

  <error_type name="Validation Error">
    <description>Input or state validation failed</description>
    <handling>
      <step>Review validation error message</step>
      <step>Check input format and values</step>
      <step>Verify environment variables</step>
      <step>Consult script documentation for requirements</step>
      <step>Run with --help to see valid inputs</step>
    </handling>
  </error_type>

  <error_type name="Permission Error">
    <description>Insufficient permissions for operation</description>
    <handling>
      <step>Check file/directory permissions</step>
      <step>Verify user has required access</step>
      <step>Check sudo requirements</step>
      <step>Review security policies</step>
      <step>Contact admin if needed</step>
    </handling>
  </error_type>

  <error_type name="Dependency Error">
    <description>Required tool or library missing</description>
    <handling>
      <step>Check error message for missing dependency</step>
      <step>Install missing tool</step>
      <step>Verify correct version</step>
      <step>Check PATH configuration</step>
      <step>Re-run installation scripts</step>
    </handling>
  </error_type>

  <error_type name="Network Error">
    <description>Network operation failed</description>
    <handling>
      <step>Check internet connection</step>
      <step>Verify service availability</step>
      <step>Check firewall/proxy settings</step>
      <step>Review authentication credentials</step>
      <step>Check rate limiting</step>
    </handling>
  </error_type>
</error_handling>

<output_format>
  <structure>
    <component>
      <name>Shebang</name>
      <description>Interpreter directive</description>
      <required>true</required>
      <example>#!/bin/bash</example>
    </component>
    <component>
      <name>Description</name>
      <description>Purpose and usage</description>
      <required>true</required>
      <example># Database migration script</example>
    </component>
    <component>
      <name>Documentation</name>
      <description>Detailed usage and examples</description>
      <required>true</required>
      <example>
        # Usage: ./script.sh [options]
        # Options:
        #   -e, --env ENV     Environment (dev|staging|prod)
        #   -v, --verbose     Enable verbose output
        #   -h, --help        Show help message
      </example>
    </component>
    <component>
      <name>Error Handling</name>
      <description>Strict mode and error trapping</description>
      <required>true</required>
      <example>set -euo pipefail</example>
    </component>
    <component>
      <name>Configuration</name>
      <description>Variables and constants</description>
      <required>true</required>
      <example>
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
      </example>
    </component>
    <component>
      <name>Functions</name>
      <description>Modular logic</description>
      <required>true</required>
      <example>
        log_info() {
          echo "[INFO] $*"
        }
      </example>
    </component>
    <component>
      <name>Main Logic</name>
      <description>Primary execution flow</description>
      <required>true</required>
     example>
        main() {
          check_prerequisites
          build
          deploy
        }
        main
      </example>
    </component>
  </structure>

  <documentation_requirements>
    <requirement>
      <name>Purpose</name>
      <description>Clear description of what script does</description>
    </requirement>
    <requirement>
      <name>Usage</name>
      <description>Command syntax and parameters</description>
    </requirement>
    <requirement>
      <name>Examples</name>
      <description>Common usage scenarios</description>
    </requirement>
    <requirement>
      <name>Dependencies</name>
      <description>Required tools and versions</description>
    </requirement>
    <requirement>
      <name>Environment</name>
      <description>Required variables and configuration</description>
    </requirement>
    <requirement>
      <name>Exit Codes</name>
      <description>Meaning of different return codes</description>
    </requirement>
  </documentation_requirements>
</output_format>

<related_skills>
  <skill name="batch-operations">
    <description>Executing operations on multiple items efficiently</description>
    <relation>Complementary</relation>
  </skill>
  <skill name="ci-cd">
    <description>Continuous integration and deployment patterns</description>
    <relation>Complementary</relation>
  </skill>
  <skill name="git-workflows">
    <description>Git automation and workflow patterns</description>
    <relation>Related</relation>
  </skill>
  <skill name="testing">
    <description>Automated testing strategies and frameworks</description>
    <relation>Complementary</relation>
  </skill>
</related_skills>

<see_also>
  <resource type="guide">
    <title>Google Shell Style Guide</title>
    <url>https://google.github.io/styleguide/shellguide.html</url>
  </resource>
  <resource type="tool">
    <title>npm-run-all</title>
    <url>https://www.npmjs.com/package/npm-run-all</url>
    <description>Run multiple npm scripts sequentially or in parallel</description>
  </resource>
  <resource type="tool">
    <title>GitHub Actions Documentation</title>
    <url>https://docs.github.com/en/actions</url>
    <description>Comprehensive CI/CD automation platform</description>
  </resource>
  <resource type="guide">
    <title>Bash Guide for Beginners</title>
    <url>https://tldp.org/LDP/Bash-Beginners-Guide/html/</url>
  </resource>
  <resource type="pattern">
    <title>The Twelve-Factor App</title>
    <url>https://12factor.net/</url>
    <description>Best practices for automation and configuration</description>
  </resource>
</see_also>
```

## Quick Reference

### Common Automation Tasks

```bash
# File operations
find . -name "*.log" -mtime +7 -delete                    # Delete old logs
find src -name "*.ts" -exec prettier --write {} \;       # Format files

# Process management
pkill -f "node server.js"                                # Kill process by name
nohup npm run dev > dev.log 2>&1 &                       # Run in background

# Docker automation
docker-compose up -d && docker-compose logs -f           # Start and follow logs
docker exec -it container-name bash                       # Enter container

# Git automation
git log --oneline --author="$USER" --since="1 week ago"  # Recent commits
git diff --stat main..feature-branch                      # Branch diff

# Network operations
curl -s -o /dev/null -w "%{http_code}" https://api.example.com/health  # Health check
```

### Script Template

```bash
#!/bin/bash
#
# [Script Description]
#
# Usage: ./script.sh [options]
#

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Logging
log_info() { echo "[INFO] $*"; }
log_error() { echo "[ERROR] $*" >&2; }

# Main function
main() {
  log_info "Starting..."
  # Your logic here
  log_info "Complete"
}

# Run main
main "$@"
```
