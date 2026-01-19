---
name: ci-cd
category: development-workflow/deployment-ops
version: 1.0.0
description: CI/CD pipeline configuration, automation workflows, and best practices for continuous integration and deployment
author: blackbox5/core
verified: true
tags: [cicd, deployment, automation, github-actions, pipeline]
---

# CI/CD Pipeline Configuration and Workflows

```xml
<skill_metadata>
  <primary_focus>Continuous Integration and Continuous Deployment automation</primary_focus>
  <secondary_focus>Pipeline orchestration and DevOps workflows</secondary_focus>
  <complexity>advanced</complexity>
  <prerequisites>
    <req>git workflow proficiency</req>
    <req>basic Docker knowledge</req>
    <req>understanding of testing concepts</req>
    <req>familiarity with cloud platforms</req>
  </prerequisites>
</skill_metadata>
```

## Context

```xml
<context>
  <overview>
    Continuous Integration and Continuous Deployment (CI/CD) is the practice of automating
    the integration, testing, and deployment of code changes. This skill encompasses the
    design, implementation, and maintenance of robust CI/CD pipelines that enable teams
    to deliver software faster, with higher quality and confidence.

    CI/CD pipelines transform manual, error-prone deployment processes into automated,
    repeatable workflows that catch issues early, reduce deployment risk, and enable
    rapid iteration and feedback.
  </overview>

  <key_concepts>
    <concept>
      <name>Continuous Integration (CI)</name>
      <description>
        The practice of merging all developers' working copies to a shared mainline
        several times a day, with automated builds and tests validating each integration.
      </description>
      <benefits>Early bug detection, reduced integration conflicts, faster feedback</benefits>
    </concept>

    <concept>
      <name>Continuous Deployment (CD)</name>
      <description>
        Automatically deploying every change that passes the CI pipeline to production,
        eliminating manual deployment steps and reducing time-to-market.
      </description>
      <benefits>Faster releases, reduced deployment risk, immediate user feedback</benefits>
    </concept>

    <concept>
      <name>Pipeline</name>
      <description>
        A sequence of automated steps that code changes must pass through before being
        deployed, including build, test, security scans, and deployment stages.
      </description>
      <benefits>Consistent process, quality gates, audit trail</benefits>
    </concept>

    <concept>
      <name>Infrastructure as Code (IaC)</name>
      <description>
        Managing infrastructure (servers, networks, databases) through code rather than
        manual configuration, enabling version control and reproducibility.
      </description>
      <benefits>Reproducibility, version control, disaster recovery</benefits>
    </concept>
  </key_concepts>

  <why_important>
    <impact>
      <category>Development Velocity</category>
      <description>Reduces time from code commit to production from days/weeks to minutes/hours</description>
    </impact>
    <impact>
      <category>Code Quality</category>
      <description>Automated testing catches bugs before they reach production, reducing defect rates by up to 70%</description>
    </impact>
    <impact>
      <category>Team Productivity</category>
      <description>Eliminates manual deployment tasks, freeing developers to focus on feature development</description>
    </impact>
    <impact>
      <category>Deployment Confidence</category>
      <description>Automated rollback procedures and testing gates reduce deployment anxiety and failures</description>
    </impact>
  </why_important>
</context>
```

## Instructions

```xml
<instructions>
  <approach>
    When designing and implementing CI/CD pipelines:

    1. **Start Simple**: Begin with basic build-test-deploy flow, then enhance incrementally
    2. **Fail Fast**: Order pipeline stages from fastest to slowest to get quick feedback
    3. **Parallelize**: Run independent tasks concurrently to reduce total pipeline time
    4. **Cache Dependencies**: Store build dependencies and artifacts between pipeline runs
    5. **Secure Secrets**: Never hardcode credentials; use platform secret management
    6. **Monitor Everything**: Log pipeline metrics and set up alerts for failures
    7. **Test in Production-like Environments**: Ensure staging mirrors production configuration
    8. **Automate Rollbacks**: Enable quick recovery from failed deployments
  </approach>

  <getting_started>
    <step order="1">
      <title>Audit Current Process</title>
      <description>Document existing build, test, and deployment procedures to understand current pain points</description>
      <actions>
        - Map manual steps and identify automation opportunities
        - Measure current deployment frequency and lead time
        - Identify common failure points and manual interventions
        - Gather team requirements and constraints
      </actions>
    </step>

    <step order="2">
      <title>Choose CI/CD Platform</title>
      <description>Select platform based on team needs, existing infrastructure, and budget</description>
      <options>
        <option name="GitHub Actions">Best for GitHub repositories, generous free tier, extensive marketplace</option>
        <option name="GitLab CI/CD">Integrated with GitLab, powerful features, self-hosting option</option>
        <option name="CircleCI">Simple configuration, excellent Docker support, good for complex workflows</option>
        <option name="Jenkins">Highly customizable, self-hosted, extensive plugin ecosystem</option>
        <option name="Azure DevOps">Best for Microsoft stack, integrated with Azure services</option>
        <option name="AWS CodePipeline">Native AWS integration, pay-per-use pricing</option>
      </options>
    </step>

    <step order="3">
      <title>Design Pipeline Architecture</title>
      <description>Define stages, jobs, and workflows based on application requirements</description>
      <considerations>
        - Application type (web, mobile, microservices, monolith)
        - Testing requirements (unit, integration, e2e, performance)
        - Deployment targets (production, staging, development)
        - Compliance and security requirements
        - Team size and workflow preferences
      </considerations>
    </step>

    <step order="4">
      <title>Implement Incrementally</title>
      <description>Start with core functionality and enhance over time</description>
      <phases>
        <phase order="1">Basic build and unit tests</phase>
        <phase order="2">Add integration tests and code quality checks</phase>
        <phase order="3">Implement automated deployment to staging</phase>
        <phase order="4">Add security scanning and compliance checks</phase>
        <phase order="5">Enable production deployment with approvals</phase>
        <phase order="6">Add monitoring, notifications, and rollback automation</phase>
      </phases>
    </step>
  </getting_started>

  <implementation_guidance>
    <topic name="Pipeline Design">
      <guidance>
        Design pipelines as directed acyclic graphs (DAGs) where each stage depends on
        the successful completion of previous stages. Use conditional logic to branch
        based on change type, branch name, or other factors.
      </guidance>
      <practices>
        - Keep pipeline definitions in version control alongside code
        - Use reusable templates for common pipeline patterns
        - Implement parallel execution for independent tasks
        - Add manual approval gates before production deployments
        - Create separate pipelines for different environments (dev, staging, prod)
      </practices>
    </topic>

    <topic name="Build Optimization">
      <guidance>
        Optimize build times through caching, dependency management, and incremental builds.
        Fast builds enable faster feedback loops and more frequent deployments.
      </guidance>
      <practices>
        - Cache node_modules, vendor directories, and build artifacts
        - Use dependency managers like npm ci, pip with requirements.txt
        - Implement incremental builds for large codebases
        - Use layer caching in Docker builds
        - Pre-build common dependencies in base Docker images
        - Parallelize builds across multiple agents/runners
      </practices>
    </topic>

    <topic name="Test Strategy">
      <guidance>
        Implement a comprehensive testing strategy that provides confidence while maintaining
        fast feedback. Balance thoroughness with execution time.
      </guidance>
      <practices>
        - Run fast unit tests in every pipeline (aim for < 5 minutes)
        - Run integration tests on pull requests and main branch
        - Execute e2e tests before production deployment
        - Use test parallelization and sharding for speed
        - Implement test flakiness detection and retry logic
        - Track test coverage trends and enforce quality gates
      </practices>
    </topic>

    <topic name="Deployment Automation">
      <guidance>
        Automate deployments with proper safeguards to enable rapid, reliable releases.
        Implement blue-green or canary deployments for zero-downtime updates.
      </guidance>
      <practices>
        - Use infrastructure as code for reproducible deployments
        - Implement health checks and automatic rollback on failure
        - Store deployment configuration in version control
        - Use feature flags to control rollout without new deployments
        - Document rollback procedures and test them regularly
        - Implement database migration automation with rollback support
      </practices>
    </topic>
  </implementation_guidance>
</instructions>
```

## Rules

```xml
<rules>
  <rule category="performance" priority="critical">
    <name>Fast Feedback Loop</name>
    <description>
      CI pipelines must provide feedback within 10 minutes for typical changes. Optimize
      builds, cache dependencies, and parallelize tests to meet this target.
    </description>
    <rationale>
      Fast feedback enables developers to fix issues while context is fresh, reducing
      context switching and improving productivity. Slow pipelines discourage frequent
      commits and delay integration benefits.
    </rationale>
    <enforcement>
      - Set timeout alerts for pipeline stages
      - Monitor and optimize slowest stages first
      - Break long-running tests into parallel suites
      - Use incremental builds and caching strategies
    </enforcement>
  </rule>

  <rule category="security" priority="critical">
    <name>Never Hardcode Secrets</name>
    <description>
      All credentials, API keys, and sensitive configuration must be stored in the
      CI/CD platform's secret management system and injected at runtime.
    </description>
    <rationale>
      Hardcoded secrets in pipeline configuration are visible to anyone with repository
      access and become part of git history, creating permanent security vulnerabilities.
    </rationale>
    <enforcement>
      - Use secret scanning tools to detect leaked credentials
      - Rotate secrets immediately if accidentally committed
      - Use environment-specific secrets for different stages
      - Implement secret audit logging
      - Use temporary credentials with minimal required permissions
    </enforcement>
  </rule>

  <rule category="quality" priority="high">
    <name>Testing Gates</name>
    <description>
      All changes must pass automated tests before merging and deploying. No exceptions
      without explicit override with documented justification.
    </description>
    <rationale>
      Testing gates prevent bugs from reaching production and maintain code quality.
      Exceptions should be rare and require leadership approval.
    </rationale>
    <enforcement>
      - Require all tests to pass before merge approval
      - Block deployments on test failures
      - Require additional approval for bypassing gates
      - Track and report gate bypass incidents
      - Regularly review and update test coverage requirements
    </enforcement>
  </rule>

  <rule category="reliability" priority="high">
    <name>Rollback Capability</name>
    <description>
      Every deployment must have a documented, tested rollback procedure that can be
      executed within 5 minutes of detecting a critical issue.
    </description>
    <rationale>
      Despite testing, production issues occur. Quick rollback capability reduces
      downtime and customer impact while teams investigate and fix problems.
    </rationale>
    <enforcement>
      - Test rollback procedures regularly (at least quarterly)
      - Automate rollback triggers based on health check failures
      - Maintain previous deployment versions for quick rollback
      - Document rollback steps in runbooks
      - Monitor deployment health and set alert thresholds
    </enforcement>
  </rule>

  <rule category="consistency" priority="medium">
    <name>Environment Parity</name>
      <description>
        Development, staging, and production environments must use identical
        configurations, versions, and infrastructure to minimize environment-specific bugs.
      </description>
    <rationale>
        "Works on my machine" bugs waste time and erode confidence. Environment parity
        ensures deployments are predictable and issues are caught early.
      </rationale>
    <enforcement>
      - Use IaC to manage all environments
      - Version all configuration and dependencies
      - Regularly sync staging with production configuration
      - Test in staging before production deployment
      - Use Docker for consistent runtime environments
    </enforcement>
  </rule>

  <rule category="maintainability" priority="medium">
    <name>Pipeline as Code</name>
    <description>
      Pipeline definitions must be stored in version control alongside application code,
      reviewed through pull requests, and follow coding standards.
    </description>
    <rationale>
      Treating pipeline configuration as code enables collaboration, audit trails,
      rollback capabilities, and ensures changes are reviewed before deployment.
    </rationale>
    <enforcement>
      - Require PR review for pipeline changes
      - Use linting and formatting for pipeline files
      - Document complex pipeline logic
      - Maintain changelog for pipeline modifications
      - Use reusable templates and shared workflows
    </enforcement>
  </rule>
</rules>
```

## Workflow

```xml
<workflow>
  <phase name="1. Pipeline Design" order="1">
    <steps>
      <step order="1">Define pipeline stages and their dependencies</step>
      <step order="2">Identify required jobs and their execution order</step>
      <step order="3">Determine parallelization opportunities</step>
      <step order="4">Plan conditional logic and branch strategies</step>
      <step order="5">Document success criteria for each stage</step>
    </steps>
    <outputs>
      - Pipeline architecture diagram
      - Stage dependency matrix
      - Configuration template
    </outputs>
  </phase>

  <phase name="2. Build" order="2">
    <steps>
      <step order="1">Checkout source code</step>
      <step order="2">Install dependencies with caching</step>
      <step order="3">Compile/build application</step>
      <step order="4">Generate build artifacts</step>
      <step order="5">Store artifacts for deployment stages</step>
    </steps>
    <outputs>
      - Compiled application bundle
      - Build artifacts
      - Dependency manifests
    </outputs>
  </phase>

  <phase name="3. Test" order="3">
    <steps>
      <step order="1">Run unit tests with coverage reporting</step>
      <step order="2">Execute integration tests</step>
      <step order="3">Perform code quality and security scans</step>
      <step order="4">Run end-to-end tests</step>
      <step order="5">Generate test reports</step>
    </steps>
    <outputs>
      - Test results and coverage reports
      - Security scan findings
      - Code quality metrics
    </outputs>
  </phase>

  <phase name="4. Deploy" order="4">
    <steps>
      <step order="1">Build container images (if applicable)</step>
      <step order="2">Push images to registry</step>
      <step order="3">Deploy to staging environment</step>
      <step order="4">Run smoke tests against staging</step>
      <step order="5">Obtain approval for production deployment</step>
      <step order="6">Deploy to production with health checks</step>
    </steps>
    <outputs>
      - Deployed application versions
      - Deployment logs
      - Health check results
    </outputs>
  </phase>

  <phase name="5. Monitor" order="5">
    <steps>
      <step order="1">Verify deployment success via health checks</step>
      <step order="2">Monitor application metrics and logs</step>
      <step order="3">Check for error rate increases</step>
      <step order="4">Validate key user journeys</step>
      <step order="5">Send deployment notifications</step>
    </steps>
    <outputs>
      - Deployment success/failure status
      - Health check results
      - Monitoring dashboard links
    </outputs>
  </phase>
</workflow>
```

## Best Practices

```xml
<best_practices>
  <category name="Pipeline Organization">
    <practice>
      <name>Logical Stage Separation</name>
      <description>
        Separate pipeline into distinct stages: build, test, deploy-pre, deploy, post-deploy.
        Each stage should have a single responsibility and clear success criteria.
      </description>
      <example>
        - Build: Compile code, generate artifacts
        - Test: Unit, integration, e2e tests
        - Security: SAST, dependency scans
        - Deploy-Staging: Deploy to staging environment
        - Smoke-Test: Validate staging deployment
        - Deploy-Production: Deploy to production
        - Monitor: Health checks and metrics
      </example>
    </practice>

    <practice>
      <name>Reusable Workflows</name>
      <description>
        Create reusable workflow templates for common patterns like language-specific
        builds, deployment strategies, and testing frameworks.
      </description>
      <example>
        - Node.js build workflow with TypeScript compilation
        - Docker build and push workflow
        - Kubernetes deployment workflow
        - Mobile app build and release workflow
      </example>
    </practice>

    <practice>
      <name>Matrix Builds</name>
      <description>
        Use matrix strategy to test against multiple versions, configurations, or platforms
        in a single pipeline run.
      </description>
      <example>
        - Test against Node.js versions: 16, 18, 20
        - Test on multiple OS: ubuntu-latest, macos-latest, windows-latest
        - Test with different database versions: PostgreSQL 12, 13, 14
      </example>
    </practice>
  </category>

  <category name="Dependency Management">
    <practice>
      <name>Aggressive Caching</name>
      <description>
        Cache dependencies between pipeline runs to avoid re-downloading and rebuild
        times. Use cache keys that invalidate appropriately.
      </description>
      <example>
        - Cache node_modules based on package-lock.json hash
        - Cache Docker layers based on Dockerfile hash
        - Cache pip packages based on requirements.txt
        - Cache build artifacts for deployment stages
      </example>
    </practice>

    <practice>
      <name>Dependency Pinning</name>
      <description>
        Pin dependency versions to ensure reproducible builds and prevent unexpected
        breakage from upstream changes.
      </description>
      <example>
        - Use package-lock.json, yarn.lock, or Poetry.lock
        - Pin Docker image versions (e.g., node:18-alpine not node:alpine)
        - Use exact versions in requirements.txt
        - Update dependencies deliberately with testing
      </example>
    </practice>

    <practice>
      <name>Security Scanning</name>
      <description>
        Automatically scan dependencies for vulnerabilities and block builds with
        critical or high-severity issues.
      </description>
      <example>
        - npm audit or Snyk for Node.js
        - bundle audit for Ruby
        - Dependabot for automated dependency updates
        - Trivy for container image scanning
      </example>
    </practice>
  </category>

  <category name="Secrets Management">
    <practice>
      <name>Environment-Specific Secrets</name>
      <description>
        Use separate secrets for different environments (dev, staging, production) and
        limit access to only required stages.
      </description>
      <example>
        - DATABASE_URL_STAGING, DATABASE_URL_PROD
        - API_KEY_DEV, API_KEY_PROD
        - Inject secrets only into jobs that need them
      </example>
    </practice>

    <practice>
      <name>Secret Rotation</name>
      <description>
        Establish procedures for rotating secrets and update CI/CD configurations
        without service disruption.
      </description>
      <example>
        - Schedule quarterly secret rotation
        - Use rotation-friendly authentication (OAuth, JWT)
        - Test secret rotation in staging first
        - Document secret update procedures
      </example>
    </practice>
  </category>

  <category name="Notification and Communication">
    <practice>
      <name>Pipeline Status Notifications</name>
      <description>
        Send notifications for important pipeline events: failures, deployments,
        security findings.
      </description>
      <example>
        - Slack notifications for failed builds
        - Email alerts for production deployments
        - PagerDuty integration for critical failures
        - GitHub commit status updates
      </example>
    </practice>

    <practice>
      <name>Deployment Visibility</name>
      <description>
        Provide clear visibility into deployment status, including who deployed,
        what changed, and current version in each environment.
      </description>
      <example>
        - Deployment dashboard showing environment versions
        - Changelog generation from commits
        - Deployer attribution in logs
        - Deployment history API
      </example>
    </practice>
  </category>

  <category name="Performance Optimization">
    <practice>
      <name>Parallel Execution</name>
      <description>
        Run independent tasks concurrently to reduce total pipeline duration.
      </description>
      <example>
        - Run test suites in parallel across multiple agents
        - Parallelize security scans with tests
        - Build multiple platform binaries simultaneously
      </example>
    </practice>

    <practice>
      <name>Incremental Builds</name>
      <description>
        Build only changed components and reuse build artifacts from previous runs.
      </description>
      <example>
        - Use build systems like Bazel, Buck, or Gradle
        - Build only modified packages in monorepo
        - Cache compilation units between builds
      </example>
    </practice>
  </category>
</best_practices>
```

## Anti-Patterns

```xml
<anti_patterns>
  <pattern severity="critical">
    <name>Slow Pipelines</name>
    <description>
      CI pipelines taking more than 30 minutes for typical changes, significantly
      slowing development velocity.
    </description>
    <consequences>
      - Reduced developer productivity
      - Context switching between tasks while waiting
      - Delayed feedback on broken builds
      - Discouragement of frequent commits
    </consequences>
    <solution>
      - Profile and optimize slowest stages
      - Implement parallel test execution
      - Use caching more aggressively
      - Move slow tests to separate scheduled pipelines
      - Consider faster alternatives (e.g., lighter linters)
    </solution>
  </pattern>

  <pattern severity="critical">
    <name>Skipping Tests for Speed</name>
    <description>
      Bypassing test stages or reducing test coverage to make pipelines faster,
      compromising code quality.
    </description>
    <consequences>
      - Increased production bugs
      - Reduced confidence in deployments
      - Technical debt accumulation
      - Regression issues
    </consequences>
    <solution>
      - Optimize tests rather than skipping them
      - Use test parallelization and sharding
      - Implement test suites (fast, medium, slow)
      - Invest in faster test infrastructure
      - Accept that some quality gates are non-negotiable
    </solution>
  </pattern>

  <pattern severity="critical">
    <name>Hardcoded Secrets</name>
    <description>
      Embedding API keys, passwords, or tokens directly in pipeline configuration
      files or code.
    </description>
    <consequences>
      - Security vulnerability
      - Secret exposure in version control
      - Compliance violations
      - Difficulty rotating credentials
    </consequences>
    <solution>
      - Use platform secret management
      - Never commit secrets to version control
      - Implement secret scanning
      - Use environment-specific secrets
      - Rotate compromised secrets immediately
    </solution>
  </pattern>

  <pattern severity="high">
    <name>Monolithic Pipeline</name>
    <description>
      Single, monolithic pipeline that attempts to handle all scenarios, leading
      to complexity and maintenance issues.
    </description>
    <consequences>
      - Difficult to understand and modify
      - Long execution times
      - Brittle configuration
      - Hard to debug failures
    </consequences>
    <solution>
      - Break into modular, reusable workflows
      - Use template inheritance
      - Create separate pipelines for different scenarios
      - Document each pipeline's purpose
    </solution>
  </pattern>

  <pattern severity="high">
    <name>Environment Drift</name>
    <description>
      Allowing staging and production environments to diverge in configuration,
      versions, or infrastructure.
    </description>
    <consequences>
      - "Works in staging" production bugs
      - Unreliable staging tests
      - Deployment surprises
      - Difficult troubleshooting
    </consequences>
    <solution>
      - Use IaC for all environments
      - Regularly audit environment parity
      - Version control all configuration
      - Test infrastructure changes
    </solution>
  </pattern>

  <pattern severity="medium">
    <name>Missing Rollback Plan</name>
    <description>
      Deploying without a tested rollback procedure, hoping everything works.
    </description>
    <consequences>
      - Extended downtime during incidents
      - Panic-induced decision making
      - Customer impact
      - Team stress during outages
    </consequences>
    <solution>
      - Document rollback procedures
      - Test rollbacks regularly
      - Automate rollback triggers
      - Maintain previous version availability
      - Include rollback in deployment planning
    </solution>
  </pattern>

  <pattern severity="medium">
    <name>Manual Deployment Steps</name>
    <description>
      Requiring manual intervention for routine deployments, increasing risk and
      reducing reliability.
    </description>
    <consequences>
      - Human error
      - Inconsistent deployments
      - Knowledge silos
      - Deployment bottlenecks
    </consequences>
    <solution>
      - Automate all deployment steps
      - Use approval gates instead of manual execution
      - Document manual steps and automate them
      - Train team on automated procedures
    </solution>
  </pattern>

  <pattern severity="medium">
    <name>Ignoring Test Flakiness</name>
    <description>
      Accepting flaky tests as normal and retrying until they pass, masking
      real issues.
    </description>
    <consequences>
      - False confidence in test results
      - Wasted time rerunning tests
      - Ignored test failures
      - Erosion of testing culture
    </consequences>
    <solution>
      - Track flaky test metrics
      - Quarantine flaky tests
      - Fix or remove flaky tests
      - Implement test reliability standards
      - Use retry logic sparingly and explicitly
    </solution>
  </pattern>
</anti_patterns>
```

## Examples

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  release:
    types: [published]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Build and Test Job
  build:
    name: Build and Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/
          retention-days: 7

  # Security Scanning Job
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=high
        continue-on-error: true

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  # Integration Tests Job
  integration-test:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: build
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: dist/

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: integration-test-results
          path: test-results/

  # Build and Push Docker Image
  docker:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [build, integration-test]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix=

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: docker
    if: github.ref == 'refs/heads/main'
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/app \
            app=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
            --namespace=staging
        env:
          KUBECONFIG: ${{ secrets.KUBE_CONFIG_STAGING }}

      - name: Wait for rollout
        run: kubectl rollout status deployment/app --namespace=staging --timeout=5m

      - name: Run smoke tests
        run: npm run test:smoke -- --env=staging

  # Deploy to Production
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.event_name == 'release'
    environment:
      name: production
      url: https://app.example.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/app \
            app=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.ref_name }} \
            --namespace=production
        env:
          KUBECONFIG: ${{ secrets.KUBE_CONFIG_PRODUCTION }}

      - name: Wait for rollout
        run: kubectl rollout status deployment/app --namespace=production --timeout=10m

      - name: Verify deployment
        run: npm run test:smoke -- --env=production

      - name: Notify team
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: ${{ job.status }}
          text: 'Production deployment: ${{ github.ref_name }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### GitLab CI/CD Pipeline

```gitlab-ci
# .gitlab-ci.yml
stages:
  - build
  - test
  - security
  - docker
  - deploy-staging
  - deploy-production

variables:
  NODE_VERSION: "18"
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  REGISTRY: registry.gitlab.com/$CI_PROJECT_PATH

# Cache configuration
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .npm/

# Build job
build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  only:
    - branches
    - tags

# Unit tests
test:unit:
  stage: test
  image: node:${NODE_VERSION}
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run test:unit -- --coverage
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - coverage/
    expire_in: 1 week
  only:
    - branches
    - merge_requests

# Integration tests
test:integration:
  stage: test
  image: node:${NODE_VERSION}
  services:
    - postgres:14
  variables:
    POSTGRES_DB: test_db
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run test:integration
  only:
    - branches
    - merge_requests

# Security scanning
security:
  stage: security
  image: node:${NODE_VERSION}
  script:
    - npm audit --audit-level=high
  allow_failure: true
  only:
    - branches
    - merge_requests

# Docker build
docker:
  stage: docker
  image: docker:24
  services:
    - docker:24-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker pull $CI_REGISTRY_IMAGE:latest || true
    - docker build
        --cache-from $CI_REGISTRY_IMAGE:latest
        --tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
        --tag $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG
        .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG
  only:
    - main
    - tags

# Deploy to staging
deploy:staging:
  stage: deploy-staging
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/app
        app=$REGISTRY:$CI_COMMIT_SHA
        --namespace=staging
    - kubectl rollout status deployment/app --namespace=staging
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - main

# Deploy to production
deploy:production:
  stage: deploy-production
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/app
        app=$REGISTRY:$CI_COMMIT_TAG
        --namespace=production
    - kubectl rollout status deployment/app --namespace=production
  environment:
    name: production
    url: https://app.example.com
  when: manual
  only:
    - tags
```

### Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        REGISTRY = 'your-registry'
        IMAGE_NAME = 'app-name'
        GIT_CREDENTIALS = credentials('git-credentials')
        DOCKER_CREDENTIALS = credentials('docker-credentials')
        KUBECONFIG = credentials('kubeconfig-staging')
    }

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/org/repo.git',
                    branch: 'main',
                    credentialsId: env.GIT_CREDENTIALS
            }
        }

        stage('Install Dependencies') {
            agent {
                docker {
                    image "node:${NODE_VERSION}"
                    reuseNode true
                }
            }
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            agent {
                docker {
                    image "node:${NODE_VERSION}"
                    reuseNode true
                }
            }
            steps {
                sh 'npm run build'
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('Test') {
            agent {
                docker {
                    image "node:${NODE_VERSION}"
                    reuseNode true
                }
            }
            steps {
                parallel(
                    "Unit Tests": {
                        sh 'npm run test:unit'
                    },
                    "Integration Tests": {
                        sh 'npm run test:integration'
                    },
                    "Linter": {
                        sh 'npm run lint'
                    }
                )
            }
            post {
                always {
                    junit 'test-results/**/*.xml'
                    publishCoverage adapters: [coberturaAdapter('coverage/cobertura-coverage.xml')]
                }
            }
        }

        stage('Security Scan') {
            steps {
                sh 'npm audit --audit-level=high'
            }
        }

        stage('Build Docker Image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry("https://${REGISTRY}", 'docker-credentials') {
                        def image = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    kubectl set image deployment/app \
                        app=${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} \
                        --namespace=staging
                    kubectl rollout status deployment/app --namespace=staging
                """
            }
        }

        stage('Smoke Tests') {
            when {
                branch 'main'
            }
            steps {
                sh 'npm run test:smoke -- --env=staging'
            }
        }
    }

    post {
        success {
            emailext(
                subject: "Pipeline Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "The pipeline completed successfully.",
                to: "team@example.com"
            )
        }
        failure {
            emailext(
                subject: "Pipeline Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "The pipeline failed. Please check the logs.",
                to: "team@example.com"
            )
        }
        always {
            cleanWs()
        }
    }
}
```

## Integration Notes

```xml
<integration_notes>
  <platform name="GitHub Actions">
    <setup>
      - Create .github/workflows directory in repository root
      - Add workflow YAML files (.yml or .yaml extension)
      - Configure secrets in repository settings (Settings > Secrets and variables > Actions)
      - Enable required permissions (Contents, Packages, etc.)
    </setup>
    <features>
      - Native GitHub integration
      - Generous free tier (2000 free minutes/month)
      - Extensive marketplace of pre-built actions
      - Matrix builds for parallel testing
      - Reusable workflows
      - Environment protection rules
    </features>
    <best_practices>
      - Use official GitHub actions over third-party alternatives
      - Pin action versions (e.g., actions/checkout@v4)
      - Use composite actions for custom reusable steps
      - Leverage workflow templates for common patterns
    </best_practices>
  </platform>

  <platform name="GitLab CI/CD">
    <setup>
      - Add .gitlab-ci.yml to repository root
      - Configure runners (shared or self-hosted)
      - Set up CI/CD variables in project settings
      - Configure protected branches and environments
    </setup>
    <features>
      - Built-in container registry
      - Auto DevOps for common workflows
      - Integrated monitoring and logging
      - Pipeline visualization
      - Environment-specific variables
      - Deployment boards
    </features>
    <best_practices>
      - Use needs keyword for job dependencies
      - Configure caching for faster builds
      - Use include for pipeline modularization
      - Leverage only/except for job execution control
    </best_practices>
  </platform>

  <platform name="CircleCI">
    <setup>
      - Add .circleci/config.yml to repository
      - Connect repository in CircleCI dashboard
      - Configure context for environment variables
      - Set up SSH keys for deployments
    </setup>
    <features>
      - Docker layer caching
      - Parallel job execution
      - Workflow orchestration
      - Built-in artifacts storage
      - Test splitting for speed
    </features>
    <best_practices>
      - Use orbs for pre-configured integrations
      - Configure workspaces for job data sharing
      - Use executors for consistent environments
      - Leverage filters for conditional execution
    </best_practices>
  </platform>
</integration_notes>
```

## Error Handling

```xml
<error_handling>
  <scenario name="Build Failures">
    <causes>
      - Compilation errors
      - Missing dependencies
      - Syntax errors
      - Type checking failures
    </causes>
    <troubleshooting>
      - Check build logs for specific error messages
      - Verify all dependencies are properly declared
      - Ensure build environment matches local development
      - Run build locally with --verbose flag for more details
    </troubleshooting>
    <prevention>
      - Run pre-commit hooks to catch errors early
      - Maintain consistent build environments
      - Pin dependency versions
      - Document build requirements
    </prevention>
  </scenario>

  <scenario name="Test Failures">
    <causes>
      - Code changes breaking tests
      - Flaky tests (intermittent failures)
      - Environment-specific issues
      - Data dependency problems
    </causes>
    <troubleshooting>
      - Review test logs and failure messages
      - Run tests locally with same configuration
      - Check for test isolation issues
      - Verify test data and fixtures
    </troubleshooting>
    <prevention>
      - Write maintainable, isolated tests
      - Use test containers for dependencies
      - Fix flaky tests immediately
      - Run tests in random order to catch dependencies
    </prevention>
  </scenario>

  <scenario name="Deployment Failures">
    <causes>
      - Configuration errors
      - Resource limitations
      - Health check failures
      - Dependency unavailability
    </causes>
    <troubleshooting>
      - Review deployment logs
      - Check application logs in target environment
      - Verify infrastructure provisioning
      - Test connectivity between services
    </troubleshooting>
    <rollback>
      - Execute automated rollback if health checks fail
      - Revert to previous deployment version
      - Verify rollback success
      - Document incident for post-mortem
    </rollback>
    <prevention>
      - Test in staging environment first
      - Implement canary deployments
      - Monitor health during rollout
      - Use blue-green deployments for zero-downtime
    </prevention>
  </scenario>

  <scenario name="Pipeline Timeout">
    <causes>
      - Slow-running tests
      - Network latency
      - Resource constraints
      - Inefficient pipeline design
    </causes>
    <troubleshooting>
      - Identify slowest stages with timing logs
      - Parallelize independent tasks
      - Increase resource allocation if needed
      - Optimize caching strategy
    </troubleshooting>
    <prevention>
      - Set appropriate timeouts for each stage
      - Monitor and optimize slow stages
      - Use incremental builds
      - Profile and optimize slow tests
    </prevention>
  </scenario>
</error_handling>
```

## Output Format

```xml
<output_format>
  <structure>
    Pipeline configurations follow platform-specific YAML syntax with common elements:

    1. **Triggers**: Events that start the pipeline (push, PR, schedule)
    2. **Variables**: Environment variables and configuration
    3. **Jobs/Stages**: Units of work with specific purposes
    4. **Steps**: Individual commands within jobs
    5. **Artifacts**: Outputs shared between jobs
    6. **Caches**: Persisted data between runs
    7. **Secrets**: Sensitive data injected at runtime
  </structure>

  <file_organization>
    .github/
      workflows/
        ci.yml                 # Continuous integration
        cd.yml                 # Continuous deployment
        security.yml           # Security scanning
        release.yml            # Release automation

    .gitlab-ci.yml            # GitLab single-file config
    Jenkinsfile               # Jenkins pipeline definition
    circleci/                 # CircleCI config directory
      config.yml
  </file_organization>

  <naming_conventions>
    - Use kebab-case for workflow files (ci-cd.yml)
    - Name jobs descriptively (build, test-unit, deploy-staging)
    - Prefix environment-specific jobs (deploy-prod, test-integration)
    - Use consistent naming across similar workflows
  </naming_conventions>

  <documentation>
    Each pipeline should include:
    - Comment header with purpose and owner
    - Inline comments for complex logic
    - Environment variable documentation
    - Secret requirements documentation
    - Output artifact documentation
  </documentation>
</output_format>
```

## Related Skills

```xml
<related_skills>
  <skill name="docker-containers">
    <relationship>prerequisite</relationship>
    <description>
      Docker knowledge is essential for containerized builds and deployments.
      Understanding multi-stage builds, image optimization, and registry
      management complements CI/CD workflows.
    </description>
  </skill>

  <skill name="kubernetes">
    <relationship>complementary</relationship>
    <description>
      Kubernetes deployment configurations integrate with CI/CD pipelines for
      automated rolling updates, canary deployments, and blue-green deployments.
    </description>
  </skill>

  <skill name="testing">
    <relationship>foundational</relationship>
    <description>
      CI/CD pipelines rely on comprehensive test suites. Understanding test
      strategies, frameworks, and coverage requirements is essential for
      effective pipeline design.
    </description>
  </skill>

  <skill name="infrastructure-as-code">
    <relationship>complementary</relationship>
    <description>
      Terraform, CloudFormation, or similar IaC tools integrate with CI/CD for
      infrastructure provisioning, environment creation, and resource management.
    </description>
  </skill>

  <skill name="git">
    <relationship>prerequisite</relationship>
    <description>
      Git workflow understanding is fundamental for CI/CD trigger configuration,
      branch strategy, and deployment automation.
    </description>
  </skill>
</related_skills>
```

## See Also

```xml
<see_also>
  <resource type="documentation">
    <name>GitHub Actions Documentation</name>
    <url>https://docs.github.com/en/actions</url>
    <description>Official GitHub Actions documentation and guides</description>
  </resource>

  <resource type="documentation">
    <name>GitLab CI/CD Documentation</name>
    <url>https://docs.gitlab.com/ee/ci/</url>
    <description>Comprehensive GitLab CI/CD reference</description>
  </resource>

  <resource type="best_practices">
    <name>Google Cloud CI/CD Best Practices</name>
    <url>https://cloud.google.com/architecture/devops/devops-best-practices-continuous-integration</url>
    <description>Industry-standard CI/CD patterns and practices</description>
  </resource>

  <resource type="tutorial">
    <name>CircleCI CI/CD Tutorial</name>
    <url>https://circleci.com/docs/getting-started/</url>
    <description>Hands-on CI/CD implementation guide</description>
  </resource>

  <resource type="reference">
    <name>Jenkins Pipeline Syntax</name>
    <url>https://www.jenkins.io/doc/book/pipeline/syntax/</url>
    <description>Complete Jenkins pipeline reference</description>
  </resource>

  <resource type="examples">
    <name>Awesome CI/CD</name>
    <url>https://github.com/cicdops/awesome-cicd</url>
    <description>Curated list of CI/CD tools, resources, and examples</description>
  </resource>
</see_also>
```

---

**Maintainer**: blackbox5/core
**Last Updated**: 2025-01-18
**Status**: Active
**Skill Level**: Advanced
