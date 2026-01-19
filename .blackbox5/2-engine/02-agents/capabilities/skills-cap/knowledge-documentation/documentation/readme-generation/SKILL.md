---
name: readme-generation
category: knowledge-documentation/documentation
version: 1.0.0
description: README file generation, best practices for project documentation, and maintaining comprehensive readmes
author: blackbox5/core
verified: true
tags: [readme, documentation, markdown, projects]
---

<skill>
  <name>README Generation and Maintenance</name>
  <intent>
    Generate, maintain, and improve README files for projects following best practices
    for documentation structure, clarity, and completeness.
  </intent>

  <context>
    <why_readmes_matter>
      README files are often the first point of contact between your project and potential
      users, contributors, or stakeholders. A well-crafted README can:

      * **Instant Communication**: Convey project purpose and value in seconds
      * **Reduced Support**: Answer common questions before they're asked
      * **Increased Adoption**: Clear documentation lowers barrier to entry
      * **Better Collaboration**: Contributors understand structure and conventions quickly
      * **Professionalism**: Demonstrates attention to detail and project maturity
      * **SEO Benefits**: Proper documentation improves discoverability

      In open-source and internal projects alike, the README serves as the project's
      front door - it should welcome visitors and guide them to what they need.
    </why_readmes_matter>

    <when_to_create>
      Create or update READMEs when:

      * Initializing a new project or repository
      * Adding significant features or breaking changes
      * Onboarding new team members who need guidance
      * Preparing for public release or distribution
      * Refactoring project structure or organization
      * Documentation becomes outdated or incomplete
      * User feedback indicates confusion or missing information
      * Setting up contribution workflows
    </when_to_create>

    <audience_considerations>
      Different audiences need different information:

      * **End Users**: Focus on installation, usage, and examples
      * **Developers**: Emphasize architecture, API, and development setup
      * **Contributors**: Highlight guidelines, workflow, and standards
      * **Stakeholders**: Summarize purpose, status, and roadmap
      * **Maintainers**: Document deployment, troubleshooting, and internals

      Tailor your README to your primary audience while including sections for others.
    </audience_considerations>
  </context>

  <instructions>
    <creation_process>
      <phase_1_content_planning>
        **1. Assess Project Context**
        - Determine project type (library, application, tool, documentation)
        - Identify primary audience and use cases
        - List key features and capabilities
        - Note unique aspects or differentiators
        - Consider technical requirements and dependencies

        **2. Plan Section Structure**
        - Core sections: Title, Description, Installation, Usage
        - Optional sections: Features, API, Contributing, License
        - Supporting sections: Screenshots, Examples, Troubleshooting
        - Reference sections: Related Projects, Acknowledgments
      </phase_1_content_planning>

      <phase_2_drafting>
        **1. Write Clear, Concise Content**
        - Start with a compelling project title and tagline
        - Use simple, direct language avoiding jargon
        - Focus on benefits and outcomes, not just features
        - Include practical examples showing real usage
        - Add visual elements where helpful (screenshots, diagrams)

        **2. Structure for Scannability**
        - Use headings to create clear sections
        - Employ bullet points for lists and features
        - Include code blocks with syntax highlighting
        - Add badges for quick status information
        - Use tables for structured data like options or commands

        **3. Provide Complete Information**
        - Installation: Include all steps and prerequisites
        - Usage: Show common use cases with examples
        - Configuration: Document all options and defaults
        - API/CLI: List commands, parameters, and return values
        - Troubleshooting: Address common issues and solutions
      </phase_2_drafting>

      <phase_3_enhancement>
        **1. Add Visual Elements**
        - Screenshots of UI or output (not just code)
        - Architecture diagrams for complex systems
        - GIFs demonstrating workflows or interactions
        - Badges for build status, version, coverage, license
        - Icons or emoji for visual emphasis (use sparingly)

        **2. Improve Navigation**
        - Table of contents for long READMEs
        - Anchor links for section jumping
        - "Back to top" links in long sections
        - Clear section hierarchy with consistent heading levels

        **3. Ensure Completeness**
        - Verify all code examples are accurate and runnable
        - Check that all links work (internal and external)
        - Confirm installation instructions work on fresh systems
        - Validate configuration examples match actual behavior
        - Test troubleshooting steps against real issues
      </phase_3_enhancement>

      <phase_4_maintenance>
        **1. Establish Update Triggers**
        - Version releases (update version badges and changelinks)
        - Breaking changes (highlight prominently with migration guides)
        - New features (add to features list with examples)
        - Dependency updates (reflect new requirements)
        - Bug fixes (add to troubleshooting section if relevant)

        **2. Regular Review Schedule**
        - Monthly review for accuracy and completeness
        - Check for broken links and outdated references
        - Update examples with latest best practices
        - Refresh screenshots if UI changes significantly
        - Incorporate feedback from issues and discussions

        **3. Community Contributions**
        - Encourage PRs for documentation improvements
        - Credit contributors who enhance the README
        - Review and merge doc updates promptly
        - Use template issues for documentation gaps
      </phase_4_maintenance>
    </creation_process>

    <writing_guidelines>
      * **Be Brief but Complete**: Every sentence should add value
      * **Start with Why**: Explain purpose before details
      * **Show, Don't Just Tell**: Use examples over lengthy descriptions
      * **Assume Nothing**: Don't skip "obvious" steps
      * **Stay Current**: Keep documentation synced with code
      * **Be Consistent**: Use uniform terminology and formatting
      * **Think Globally**: Consider international audiences, avoid idioms
    </writing_guidelines>
  </instructions>

  <rules>
    <essential_sections>
      <must_have>
        For most projects, these sections are mandatory:

        1. **Project Title**: Clear, descriptive name
        2. **Short Description**: One-sentence summary (what & why)
        3. **Installation**: Step-by-step setup instructions
        4. **Basic Usage**: Simple example getting started
        5. **License**: SPDX identifier or link to license file

        Optional but highly recommended:
        * Features list
        * Screenshots or demos
        * API documentation or CLI reference
        * Contributing guidelines
        * Changelog or version history
        * Support and contact information
      </must_have>

      <section_organization>
        Organize sections in logical order:

        1. Hook (Title + Description + Badges)
        2. Quick Start (Installation + Basic Usage)
        3. Details (Features + Configuration + Examples)
        4. Development (API + Contributing + Testing)
        5. Meta (License + Credits + Links)

        This order serves users looking to use your project first,
        then those wanting to understand or extend it.
      </section_organization>
    </essential_sections>

    <clarity_principles>
      * **One Purpose Per Section**: Each section should have a single, clear focus
      * **Progressive Disclosure**: Start simple, add complexity gradually
      * **Active Voice**: "Run this command" not "This command should be run"
      * **Present Tense**: Use "includes" not "will include" for current features
      * **Specific Over Generic**: "Returns user object" not "returns data"
      * **Concrete Examples**: Real examples > abstract descriptions
    </clarity_principles>

    <badge_usage>
      Recommended badges (use selectively, don't overdo it):

      **Status Badges**:
      - Build status (CI/CD)
      - Test coverage
      - Version/release
      - License
      - Activity (commits, issues)

      **Quality Badges**:
      - Code quality (linter, formatter)
      - Dependencies (up-to-date, security)
      - Documentation coverage
      - Standard compliance

      **Community Badges**:
      - Contributor count
      - Discussion activity
      - Downloads or usage stats

      Place badges at the top after the title but before the description.
      Use badge services like Shields.io for consistency.
    </badge_usage>

    <update_requirements>
      README updates should happen when:

      * **Critical**: Breaking changes, security fixes, installation changes
      * **High**: New features, deprecated features, major version bumps
      * **Medium**: Bug fixes, dependency updates, clarification additions
      * **Low**: Typos, formatting improvements, link updates

      Establish a branch protection rule requiring README updates for
      breaking changes to prevent documentation drift.
    </update_requirements>
  </rules>

  <workflow>
    <phase name="Content Planning">
      <steps>
        1. Identify project type and primary audience
        2. List key features and differentiators
        3. Determine required sections based on project complexity
        4. Gather necessary materials (screenshots, examples, diagrams)
        5. Review similar projects' READMEs for inspiration
      </steps>
      <output>
        Content outline with section headings and bullet points for each
      </output>
    </phase>

    <phase name="Drafting">
      <steps>
        1. Write project title and compelling description
        2. Create installation instructions with prerequisites
        3. Add basic usage example (the "hello world" of your project)
        4. Document features with brief explanations
        5. Include configuration options and environment variables
      </steps>
      <output>
        First draft of README with core sections complete
      </output>
    </phase>

    <phase name="Enhancement">
      <steps>
        1. Add appropriate badges for status and quality
        2. Include screenshots, GIFs, or diagrams
        3. Create additional usage examples for common scenarios
        4. Write API documentation or CLI reference
        5. Add troubleshooting section with common issues
        6. Include contributing guidelines if open to contributions
      </steps>
      <output>
        Enhanced README with visual elements and comprehensive documentation
      </output>
    </phase>

    <phase name="Review and Refine">
      <steps>
        1. Test all installation instructions on fresh system
        2. Verify all code examples run without errors
        3. Check all internal and external links
        4. Review for clarity, completeness, and consistency
        5. Get feedback from team members or users
        6. Make final improvements based on feedback
      </steps>
      <output>
        Polished README ready for production use
      </output>
    </phase>

    <phase name="Maintenance">
      <steps>
        1. Schedule regular reviews (monthly or quarterly)
        2. Monitor issues for documentation gaps
        3. Update version badges and changelinks on releases
        4. Refresh screenshots after UI changes
        5. Incorporate community improvements via PRs
      </steps>
      <output>
        Up-to-date README that evolves with the project
      </output>
    </phase>
  </workflow>

  <best_practices>
    <structure>
      **Follow This Standard Structure**:

      ```markdown
      # Project Name
      > Tagline or brief description

      [Badges]

      ## Overview
      What it does and why it exists

      ## Installation
      Prerequisites and setup steps

      ## Quick Start
      Minimal working example

      ## Features
      Key capabilities list

      ## Usage
      Detailed examples and use cases

      ## Configuration
      Options and environment variables

      ## API / CLI Reference
      Commands, parameters, return values

      ## Development
      Setup for contributors

      ## Contributing
      Guidelines and process

      ## Changelog
      Version history

      ## License
      SPDX identifier

      ## Acknowledgments
      Credits and links
      ```

      This order prioritizes getting users started quickly while
      providing depth for those who need it.
    </structure>

    <examples>
      **Provide Practical Examples**:

      *Minimal Example*: Show the simplest possible use case
      ```typescript
      import { Library } from 'package';

      const instance = new Library();
      instance.start();
      ```

      *Real-World Example*: Demonstrate typical usage
      ```typescript
      import { Library } from 'package';

      const app = new Library({
        apiKey: process.env.API_KEY,
        timeout: 5000,
        retries: 3
      });

      await app.connect();
      const result = await app.processData(input);
      ```

      *Advanced Example*: Show complex scenario
      ```typescript
      // Custom error handling, logging, retry logic
      const app = new Library({
        ...options,
        errorHandler: (error) => logger.error(error),
        onRetry: (attempt) => metrics.increment('retry')
      });
      ```

      Examples should be:
      - Copy-paste runnable
      - Include output where relevant
      - Show error handling
      - Cover edge cases
      - Use realistic data
    </examples>

    <screenshots>
      **Effective Screenshots**:

      *What to Capture*:
      - Main interface or primary view
      - Key features in action
      - Configuration UI or output
      - Before/after comparisons for transformations
      - Error states or validation messages

      *How to Present*:
      - Use light theme screenshots (more universal)
      - Include window/frame for context
      - Ensure text is readable at full resolution
      - Add captions explaining what's shown
      - Optimize file size (use PNG for UI, JPEG for photos)

      *Organization*:
      - Place near relevant text sections
      - Use consistent sizing and alignment
      - Consider collapsible details for many screenshots
      - Include alt text for accessibility
    </screenshots>

    <contributing_guidelines>
      **Contributing Section Should Include**:

      1. **Setup Instructions**: How to run development environment
      2. **Code Standards**: Linting, formatting, testing requirements
      3. **Commit Convention**: Message format and PR title guidelines
      4. **PR Process**: How to submit, what gets reviewed
      5. **Issue Reporting**: Template for bug reports and feature requests

      Example:
      ```markdown
      ## Contributing

      We welcome contributions! Please:

      1. Check existing issues and PRs
      2. Fork the repository
      3. Create a feature branch (`git checkout -b feature/amazing-feature`)
      4. Make your changes with tests
      5. Ensure tests pass and linting succeeds
      6. Submit a pull request

      See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
      ```
    </contributing_guidelines>

    <accessibility>
      **Make READMEs Accessible**:

      *Visual Accessibility*:
      - Use proper heading hierarchy (one h1, then h2, h3...)
      - Provide alt text for images and diagrams
      - Ensure sufficient color contrast in embedded images
      - Use emojis sparingly (screen readers may not handle them well)

      *Content Accessibility*:
      - Write clear, simple language (aim for 8th grade reading level)
      - Define technical terms on first use
      - Provide examples for abstract concepts
      - Use descriptive link text (avoid "click here")

      *Structural Accessibility*:
      - Use lists instead of paragraphs when appropriate
      - Include table of contents for long documents
      - Use code blocks with language specification for syntax highlighting
      - Avoid ASCII art or complex text-based diagrams
    </accessibility>
  </best_practices>

  <anti_patterns>
    <avoid_these>
      * **Empty or Minimal READMEs**: "README.md - Setup coming soon" is useless
      * **Outdated Information**: Installation that doesn't work, deprecated API examples
      * **Missing Installation Steps**: "Just run it" without prerequisites or setup
      * **Wall of Text**: Long paragraphs without breaks, headings, or examples
      * **Assumptions**: "You know how to set up Node.js" (some don't)
      * **Broken Links**: References to non-existent files or external 404s
      * **Vague Descriptions**: "A tool for doing stuff" (what stuff? why?)
      * **No Examples**: Documentation that describes but never shows
      * **Over-Engineering**: READMEs that try to replace proper docs
      * **Stale Content**: Version badges from 3 years ago, deprecated features listed
      * **Internal Jargon**: Terms only the team understands, not users
      * **No Update History**: Users can't tell what's new or changed
      * **Missing License**: Unclear if users can actually use the code
      * **Unmaintained**: Last updated 2 years ago, project clearly changed
    </avoid_these>

    <red_flags>
      If you see these in your README, fix immediately:

      - Links to `/docs/` that return 404
      - Installation steps that fail on first attempt
      - Examples that throw errors when copied
      - Version number not matching actual release
      - Deprecated features still in primary examples
      - Screenshots of old UI versions
      - References to renamed or removed files
      - TODO section from initial commit still pending
      - Contributing guidelines that don't match actual PR process
    </red_flags>
  </anti_patterns>

  <examples>
    <library_readme>
      **Library/Package README Example**:

      ```markdown
      # dataflow
      > Stream processing library for real-time data transformation

      [![npm version](https://badge.fury.io/js/dataflow.svg)](https://www.npmjs.com/package/dataflow)
      [![Build Status](https://github.com/user/dataflow/workflows/CI/badge.svg)](https://github.com/user/dataflow/actions)
      [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

      ## Overview
      Dataflow provides a simple, chainable API for building real-time data
      processing pipelines with built-in backpressure handling and error recovery.

      ## Installation
      \`\`\`bash
      npm install dataflow
      \`\`\`

      ## Quick Start
      \`\`\`typescript
      import { pipeline } from 'dataflow';

      const result = await pipeline(source)
        .filter(x => x.active)
        .map(x => transform(x))
        .collect();

      console.log(result);
      \`\`\`

      ## Features
      - Chainable transformations (map, filter, reduce, etc.)
      - Async/await support throughout
      - Automatic backpressure handling
      - Built-in error recovery and retry logic
      - TypeScript types included

      ## Usage

      ### Creating a Pipeline
      ...

      ### Error Handling
      ...

      ### Performance Tips
      ...

      ## API Reference
      ...

      ## Contributing
      ...

      ## License
      MIT © 2024 Your Name
      \```
    </library_readme>

    <api_readme>
      **REST API README Example**:

      ```markdown
      # TaskAPI
      > REST API for task management and workflow automation

      ## Overview
      TaskAPI provides a simple REST interface for creating, managing, and
      tracking tasks with support for assignments, due dates, and dependencies.

      ## Base URL
      \`\`\`
      https://api.taskapi.io/v1
      \`\`\`

      ## Authentication
      All requests require an API key in the header:
      \`\`\`bash
      curl -H "Authorization: Bearer YOUR_API_KEY" \\
           https://api.taskapi.io/v1/tasks
      \`\`\`

      ## Endpoints

      ### List Tasks
      \`\`\`http
      GET /tasks
      \`\`\`

      **Query Parameters**:
      - `status` (optional): Filter by status (pending, in_progress, completed)
      - `assignee` (optional): Filter by user ID
      - `limit` (optional): Max results (default: 50)

      **Response**:
      \`\`\`json
      {
        "tasks": [
          {
            "id": "task_abc123",
            "title": "Fix navigation bug",
            "status": "in_progress",
            "assignee": "user_xyz789"
          }
        ],
        "total": 1
      }
      \`\`\`

      ### Create Task
      ...

      ### Update Task
      ...

      ## Error Codes
      ...

      ## Rate Limiting
      ...

      ## SDKs
      - [JavaScript](https://github.com/taskapi/js-client)
      - [Python](https://github.com/taskapi/python-client)

      ## Changelog
      ...
      \```
    </api_readme>

    <tool_readme>
      **CLI Tool README Example**:

      ```markdown
      # devtools
      > Development workflow automation CLI

      [![Version](https://img.shields.io/npm/v/devtools-cli.svg)](https://www.npmjs.com/package/devtools-cli)

      ## About
      DevTools automates common development tasks: scaffolding, building,
      testing, and deploying with a single unified CLI.

      ## Installation
      \`\`\`bash
      npm install -g devtools-cli
      \`\`\`

      ## Quick Start
      \`\`\`bash
      # Initialize a new project
      devtools init my-project

      # Add common workflows
      devtools workflow add --template react

      # Run development server
      devtools dev
      \`\`\`

      ## Commands

      ### `devtools init <name>`
      Create a new project with best-practice configuration.

      **Options**:
      - `--template, -t`: Template to use (react, vue, node)
      - `--package-manager, -p`: npm, yarn, or pnpm

      **Example**:
      \`\`\`bash
      devtools init my-app --template react --package-manager pnpm
      \`\`\`

      ### `devtools dev`
      Start development server with hot reload.

      ### `devtools build`
      Build for production.

      ### `devtools test`
      Run tests with coverage.

      ### `devtools deploy`
      Deploy to configured environment.

      ## Configuration
      DevTools reads from `devtools.config.js`:
      \`\`\`javascript
      module.exports = {
        port: 3000,
        build: {
          outDir: 'dist',
          sourcemap: true
        },
        deploy: {
          provider: 'vercel',
          project: 'my-app'
        }
      };
      \`\`\`

      ## Templates
      - **React**: Vite + React + TypeScript + Testing Library
      - **Vue**: Vite + Vue 3 + TypeScript + Vitest
      - **Node**: Express + TypeScript + Jest

      ## Troubleshooting
      **Issue**: "Command not found" after install
      **Solution**: Ensure npm global bin directory is in your PATH

      **Issue**: Build fails with module not found
      **Solution**: Run `npm install` to ensure dependencies are installed

      ## Contributing
      ...

      ## License
      MIT
      \```
    </tool_readme>
  </examples>

  <integration_notes>
    <readme_generators>
      **Automated Tools**:

      *readme-software* (https://readme.so):
      - Visual editor for README creation
      - Template-based with drag-and-drop sections
      - Exports to markdown for GitHub

      *readme-md-generator* (https://github.com/kefranabg/readme-md-generator):
      - CLI tool that generates README from interactive prompts
      - Analyzes your package.json for dependencies and scripts
      - Creates badges based on your repo

      *ReadMe.com*:
      - Full documentation platform with API docs
      - Interactive API explorer
      - Versioned documentation

      These tools can accelerate README creation but should be customized
      for your specific project needs.
    </readme_generators>

    <templates>
      **Starter Templates**:

      Create a `.github/readme-template.md` in your organization:
      ```markdown
      # {{PROJECT_NAME}}
      > {{ONE_LINE_DESCRIPTION}}

      [![Build Status]({{BUILD_BADGE_URL}})]({{BUILD_LINK}})
      [![License: {{LICENSE}}]({{LICENSE_BADGE_URL}})]({{LICENSE_FILE}})

      ## Overview
      {{PROJECT_OVERVIEW}}

      ## Installation
      ```bash
      {{INSTALL_COMMAND}}
      ```

      ## Usage
      ```typescript
      {{BASIC_USAGE_EXAMPLE}}
      ```

      ## Features
      - {{FEATURE_1}}
      - {{FEATURE_2}}
      - {{FEATURE_3}}

      ## Contributing
      {{CONTRIBUTING_GUIDELINES}}

      ## License
      {{LICENSE_TYPE}}
      ```

      Use this template across multiple projects for consistency.
    </templates>

    <related_skills>
      * **docs-routing**: Organizing multi-file documentation
      * **technical-specs**: Detailed technical documentation
      * **api-documentation**: API reference generation
      * **diagram-generation**: Creating architecture diagrams
    </related_skills>
  </integration_notes>

  <error_handling>
    <common_issues>
      **Documentation Drift**:
      - *Problem*: README describes old behavior or removed features
      - *Solution*: Link README updates to PR acceptance criteria
      - *Prevention*: Automated checks for code/doc synchronization
      - *Detection*: Regular user feedback and issue tracking

      **Installation Failures**:
      - *Problem*: Users can't replicate installation steps
      - *Solution*: Test on fresh systems, document all prerequisites
      - *Prevention*: CI/CD pipeline that tests README instructions
      - *Detection*: Monitor issues for installation-related problems

      **Example Breakage**:
      - *Problem*: Code examples don't work with current version
      - *Solution*: Test examples in CI, version them if needed
      - *Prevention*: Include examples in test suite
      - *Detection*: Automated testing of code blocks

      **Broken Links**:
      - *Problem*: Internal or external links return 404
      - *Solution*: Use link checker in CI, review regularly
      - *Prevention*: Automated link validation in documentation build
      - *Detection*: Tools like markdown-link-check

      **Outdated Versions**:
      - *Problem*: Version badges or references don't match releases
      - *Solution*: Automate badge updates with release workflow
      - *Prevention*: Include README updates in release checklist
      - *Detection*: Version discrepancy monitoring
    </common_issues>

    <maintenance_strategies>
      **Automated Validation**:
      - Test code blocks in CI/CD pipeline
      - Run link checkers on documentation
      - Validate examples against actual API
      - Check for broken images and references

      **Update Workflows**:
      - Require README changes for breaking changes
      - Use PR templates to remind about documentation
      - Schedule quarterly documentation reviews
      - Track documentation issues separately from bugs

      **Community Feedback**:
      - Add "docs" label to documentation issues
      - Encourage documentation PRs
      - Use reaction voting on docs issues
      - Survey users on documentation quality
    </maintenance_strategies>
  </error_handling>

  <output_format>
    <markdown_structure>
      README files should be valid GitHub Flavored Markdown (GFM):

      * **Headers**: Use `#` for h1, `##` for h2, etc.
      * **Emphasis**: Use `*italic*` or `**bold**`
      * **Links**: `[text](url)` or `[text][reference]`
      * **Images**: `![alt](url)` with alt text required
      * **Code**: Inline with backticks, blocks with triple backticks
      * **Lists**: Use `-` for unordered, `1.` for ordered
      * **Tables**: Use pipe-separated format
      * **Task Lists**: Use `- [ ]` and `- [x]`
      * **Blockquotes**: Use `>` for quoted text
      * **Horizontal Rules**: Use `---` for separators
    </markdown_structure>

    <file_organization>
      **Single vs Multi-file**:
      - Use single README.md for simple projects (< 300 lines)
      - Split into multiple files for complex projects
      - Link to detailed docs from README
      - Keep README as high-level overview

      **Common Additional Files**:
      - `CONTRIBUTING.md`: Detailed contribution guidelines
      - `CHANGELOG.md`: Version history and changes
      - `LICENSE`: Legal terms
      - `CODE_OF_CONDUCT.md`: Community guidelines
      - `SECURITY.md`: Security policy and disclosure
      - `docs/`: Additional documentation folder
      - `examples/`: Code examples and tutorials
    </file_organization>

    <formatting_consistency>
      * **Line Length**: Aim for 80-100 characters (hard wrap not required)
      * **Headers**: One space between `#` and header text
      * **Lists**: Blank line before and after lists
      * **Code Blocks**: Blank line before and after, specify language
      * **Links**: No spaces between brackets and parentheses
      * **Tables**: Pipe characters at column start and end
      * **Comments**: Use HTML comments `<!-- -->` for notes not displayed
    </formatting_consistency>
  </output_format>

  <related_skills>
    <skill name="docs-routing">
      Organizing multi-file documentation structures and navigation
    </skill>
    <skill name="technical-specs">
      Creating detailed technical specifications
    </skill>
    <skill name="api-documentation">
      Documenting REST APIs, GraphQL, and SDKs
    </skill>
    <skill name="diagram-generation">
      Creating architecture and flow diagrams
    </skill>
  </related_skills>

  <see_also>
    <reference>
      **Best Practices**:
      - [Awesome README](https://github.com/matiassingers/awesome-readme) - Curated list of great READMEs
      - [README Guide by Arturiano](https://github.com/arturianec/README-template) - Comprehensive template
      - [Make a README](https://www.makeareadme.com/) - Interactive README builder
      - [GitHub README Guide](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) - Official GitHub docs

      **Tools**:
      - [readme-md-generator](https://github.com/kefranabg/readme-md-generator) - CLI README generator
      - [readme.so](https://readme.so/) - Visual README editor
      - [Shields.io](https://shields.io/) - Badge generation service
      - [markdown-link-check](https://github.com/tcort/markdown-link-check) - Link validation tool

      **Examples**:
      - [Node.js README](https://github.com/nodejs/node/blob/main/README.md) - Large project README
      - [Create React App README](https://github.com/facebook/create-react-app/blob/main/README.md) - Tool README
      - [Express.js README](https://github.com/expressjs/express/blob/master/README.md) - Framework README
    </reference>
  </see_also>

  <changelog>
    <version version="1.0.0" date="2025-01-18">
      Initial release of README generation skill with comprehensive templates,
      best practices, and maintenance guidelines for project documentation.
    </version>
  </changelog>
</skill>
