---
name: playwright
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Complete guide to using Playwright MCP server with Claude Code
author: blackbox5/mcp
verified: true
tags: [mcp, playwright, testing, browser, automation]
---

# Playwright MCP Server Skills

<context>
Complete guide to using Playwright MCP server with Claude Code. Playwright is a powerful end-to-end testing framework that enables cross-browser automation, testing, and web scraping.

**Type:** STDIO (local)
**Browsers Supported:** Chrome, Firefox, Safari, Edge
**Purpose:** E2E testing and browser automation

**Initial Setup:** Run `npx playwright install chromium` to download browser binaries on first use.
</context>

<instructions>
When working with Playwright through Claude Code, use natural language commands. Claude will convert your requests into appropriate Playwright automation commands.

For testing, always start by launching a browser and navigating to the target URL. Use explicit waits over fixed timeouts for more reliable tests.
</instructions>

<workflow>
  <phase name="Test Setup">
    <goal>Prepare browser environment for testing</goal>
    <steps>
      <step>Use `playwright_launch` to start browser (chromium/firefox/webkit)</step>
      <step>Use `playwright_navigate` to go to target URL</step>
      <step>Use `playwright_set_viewport` or `playwright_emulate_device` if testing responsive</step>
    </steps>
  </phase>

  <phase name="Page Interaction">
    <goal>Interact with page elements</goal>
    <steps>
      <step>Use `playwright_wait_for_selector` to ensure elements are ready</step>
      <step>Use `playwright_click` to click buttons/links</step>
      <step>Use `playwright_fill` or `playwright_type` to input text</step>
      <step>Use `playwright_select` for dropdowns</step>
      <step>Use `playwright_check`/`playwright_uncheck` for checkboxes</step>
    </steps>
  </phase>

  <phase name="Assertion & Verification">
    <goal>Verify expected behavior</goal>
    <steps>
      <step>Use `playwright_assert_visible` to check element visibility</step>
      <step>Use `playwright_assert_text` to verify content</step>
      <step>Use `playwright_assert_url` to verify navigation</step>
      <step>Use `playwright_assert_title` to verify page title</step>
      <step>Use `playwright_screenshot` to capture state</step>
    </steps>
  </phase>

  <phase name="Cleanup">
    <goal>Close browser and clean up resources</goal>
    <steps>
      <step>Take final screenshots if needed</step>
      <step>Use `playwright_close` to close browser</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="Browser Launch & Control">
    <skill name="playwright_launch">
      <purpose>Launch a browser instance</purpose>
      <usage>Launch Chrome browser</usage>
      <parameters>
        <param name="browser">Browser type (chromium, firefox, webkit)</param>
        <param name="headless">Run headlessly (default: true)</param>
        <param name="viewport">Viewport size {width, height}</param>
      </parameters>
    </skill>
    <skill name="playwright_navigate">
      <purpose>Navigate to a URL</purpose>
      <usage>Navigate to https://example.com</usage>
      <parameters>
        <param name="url">Target URL</param>
        <param name="wait_until">Wait condition (load, domcontentloaded, networkidle)</param>
      </parameters>
    </skill>
    <skill name="playwright_close">
      <purpose>Close the browser or page</purpose>
      <usage>Close the browser</usage>
    </skill>
  </skill_group>

  <skill_group name="Page Interaction">
    <skill name="playwright_click">
      <purpose>Click an element on the page</purpose>
      <usage>Click the login button</usage>
      <parameters>
        <param name="selector">Element selector (CSS, XPath, text)</param>
        <param name="wait_for">Wait for navigation after click</param>
      </parameters>
    </skill>
    <skill name="playwright_fill">
      <purpose>Fill form input fields</purpose>
      <usage>Fill the email input</usage>
      <parameters>
        <param name="selector">Input element selector</param>
        <param name="value">Value to enter</param>
      </parameters>
    </skill>
    <skill name="playwright_type">
      <purpose>Type text character by character</purpose>
      <usage>Type 'Hello World' in textarea</usage>
      <parameters>
        <param name="selector">Element selector</param>
        <param name="text">Text to type</param>
        <param name="delay">Delay between keystrokes (ms)</param>
      </parameters>
    </skill>
    <skill name="playwright_select">
      <purpose>Select option from dropdown</purpose>
      <usage>Select 'United States' from country dropdown</usage>
      <parameters>
        <param name="selector">Select element</param>
        <param name="value">Option value or label</param>
      </parameters>
    </skill>
    <skill name="playwright_check">
      <purpose>Check a checkbox</purpose>
      <usage>Check the 'agree' checkbox</usage>
      <parameters>
        <param name="selector">Checkbox element selector</param>
      </parameters>
    </skill>
    <skill name="playwright_uncheck">
      <purpose>Uncheck a checkbox</purpose>
      <usage>Uncheck the newsletter checkbox</usage>
      <parameters>
        <param name="selector">Checkbox element selector</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Element Inspection">
    <skill name="playwright_get_text">
      <purpose>Get text content from element(s)</purpose>
      <usage>Get text from h1</usage>
      <parameters>
        <param name="selector">Element selector</param>
      </parameters>
    </skill>
    <skill name="playwright_get_html">
      <purpose>Get HTML content of element or page</purpose>
      <usage>Get HTML of the page</usage>
      <parameters>
        <param name="selector">Element selector (optional, for element HTML)</param>
      </parameters>
    </skill>
    <skill name="playwright_get_attribute">
      <purpose>Get attribute value from element</purpose>
      <usage>Get href from all links</usage>
      <parameters>
        <param name="selector">Element selector</param>
        <param name="attribute">Attribute name</param>
      </parameters>
    </skill>
    <skill name="playwright_get_element_count">
      <purpose>Count elements matching selector</purpose>
      <usage>Count number of .item elements</usage>
      <parameters>
        <param name="selector">Element selector</param>
      </parameters>
    </skill>
    <skill name="playwright_is_visible">
      <purpose>Check if element is visible</purpose>
      <usage>Is the modal visible?</usage>
      <parameters>
        <param name="selector">Element selector</param>
      </parameters>
    </skill>
    <skill name="playwright_is_enabled">
      <purpose>Check if element is enabled</purpose>
      <usage>Is the submit button enabled?</usage>
      <parameters>
        <param name="selector">Element selector</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Waiting & Timing">
    <skill name="playwright_wait_for_selector">
      <purpose>Wait for element to appear</purpose>
      <usage>Wait for .modal to appear</usage>
      <parameters>
        <param name="selector">Element selector</param>
        <param name="timeout">Maximum wait time (default: 30000ms)</param>
      </parameters>
    </skill>
    <skill name="playwright_wait_for_navigation">
      <purpose>Wait for page navigation</purpose>
      <usage>Wait for page to load after click</usage>
    </skill>
    <skill name="playwright_wait_for_timeout">
      <purpose>Wait for specific time</purpose>
      <usage>Wait for 5 seconds</usage>
      <parameters>
        <param name="timeout">Time to wait (milliseconds)</param>
      </parameters>
    </skill>
    <skill name="playwright_wait_for_response">
      <purpose>Wait for network response</purpose>
      <usage>Wait for API response</usage>
      <parameters>
        <param name="url">URL or URL pattern</param>
        <param name="timeout">Maximum wait time</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Screenshot & PDF">
    <skill name="playwright_screenshot">
      <purpose>Take screenshot of page or element</purpose>
      <usage>Take screenshot</usage>
      <parameters>
        <param name="selector">Element to screenshot (optional)</param>
        <param name="full_page">Capture entire page (default: false)</param>
        <param name="path">Save path (optional)</param>
      </parameters>
    </skill>
    <skill name="playwright_pdf">
      <purpose>Generate PDF of current page</purpose>
      <usage>Save page as PDF</usage>
      <parameters>
        <param name="path">Save path (optional)</param>
        <param name="format">Paper format (A4, Letter)</param>
        <param name="landscape">Landscape orientation (default: false)</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="JavaScript Execution">
    <skill name="playwright_evaluate">
      <purpose>Execute JavaScript in page context</purpose>
      <usage>Run document.title</usage>
      <parameters>
        <param name="code">JavaScript code</param>
      </parameters>
    </skill>
    <skill name="playwright_evaluate_async">
      <purpose>Execute async JavaScript</purpose>
      <usage>Run await fetch('/api/data')</usage>
      <parameters>
        <param name="code">Async JavaScript code</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Form & Input">
    <skill name="playwright_upload_file">
      <purpose>Upload file through file input</purpose>
      <usage>Upload file to input</usage>
      <parameters>
        <param name="selector">File input element</param>
        <param name="file_path">Path to file</param>
      </parameters>
    </skill>
    <skill name="playwright_hover">
      <purpose>Hover over element</purpose>
      <usage>Hover over navigation menu</usage>
      <parameters>
        <param name="selector">Element selector</param>
      </parameters>
    </skill>
    <skill name="playwright_focus">
      <purpose>Focus on element</purpose>
      <usage>Focus on email input</usage>
      <parameters>
        <param name="selector">Element selector</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Browser Context">
    <skill name="playwright_set_viewport">
      <purpose>Set browser viewport size</purpose>
      <usage>Set viewport to mobile size</usage>
      <parameters>
        <param name="width">Viewport width</param>
        <param name="height">Viewport height</param>
      </parameters>
    </skill>
    <skill name="playwright_emulate_device">
      <purpose>Emulate specific device</purpose>
      <usage>Emulate iPhone 12</usage>
      <parameters>
        <param name="device">Device name (iPhone, iPad, etc.)</param>
      </parameters>
    </skill>
    <skill name="playwright_set_geolocation">
      <purpose>Set geolocation</purpose>
      <usage>Set location to New York</usage>
      <parameters>
        <param name="latitude">Latitude</param>
        <param name="longitude">Longitude</param>
      </parameters>
    </skill>
    <skill name="playwright_set_offline">
      <purpose>Set offline mode</purpose>
      <usage>Go offline</usage>
    </skill>
  </skill_group>

  <skill_group name="Testing & Assertions">
    <skill name="playwright_assert_text">
      <purpose>Assert text exists on page</purpose>
      <usage>Assert 'Welcome' is visible</usage>
      <parameters>
        <param name="text">Expected text</param>
        <param name="selector">Element selector (optional)</param>
      </parameters>
    </skill>
    <skill name="playwright_assert_visible">
      <purpose>Assert element is visible</purpose>
      <usage>Assert button is visible</usage>
      <parameters>
        <param name="selector">Element selector</param>
      </parameters>
    </skill>
    <skill name="playwright_assert_url">
      <purpose>Assert current URL</purpose>
      <usage>Assert URL is /dashboard</usage>
      <parameters>
        <param name="url">Expected URL</param>
      </parameters>
    </skill>
    <skill name="playwright_assert_title">
      <purpose>Assert page title</purpose>
      <usage>Assert title is 'Home Page'</usage>
      <parameters>
        <param name="title">Expected title</param>
      </parameters>
    </skill>
  </skill_group>
</available_skills>

<rules>
  <rule>
    <condition>When waiting for elements</condition>
    <action>Use explicit waits (wait_for_selector) over fixed timeouts (wait_for_timeout)</action>
  </rule>
  <rule>
    <condition>When selecting elements</condition>
    <action>Prefer stable selectors like data-testid, IDs, or aria labels over CSS classes</action>
  </rule>
  <rule>
    <condition>When testing</condition>
    <action>Always close browser after test completes</action>
  </rule>
  <rule>
    <condition>For cross-browser testing</condition>
    <action>Test in chromium, firefox, and webkit to ensure compatibility</action>
  </rule>
</rules>

<best_practices>
  <practice category="Selectors">
    <do>Use data-testid attributes for selectors</do>
    <do>Use specific, stable selectors</do>
    <dont>Use brittle selectors (nth-child)</dont>
    <dont>Use CSS classes that change frequently</dont>
  </practice>
  <practice category="Timing">
    <do>Wait for elements explicitly</do>
    <do>Handle async properly</do>
    <dont>Hardcode sleep times</dont>
    <dont>Assume instant load</dont>
  </practice>
  <practice category="Testing">
    <do>Test in multiple browsers</do>
    <do>Use descriptive test names</do>
    <do>Clean up after tests</do>
    <do>Use page object model</do>
    <do>Run tests in parallel</do>
    <dont>Test only in Chrome</dont>
    <dont>Skip cleanup</dont>
    <dont>Mix concerns in tests</dont>
    <dont>Duplicate test code</dont>
  </practice>
</best_practices>

<examples>
  <example scenario="E2E Testing">
    <input>Test the login flow</input>
    <workflow>
      <step>Launch browser (chromium, headless: false)</step>
      <step>Navigate to https://example.com/login</step>
      <step>Wait for selector #email</step>
      <step>Fill email input with user@example.com</step>
      <step>Fill password input with secret123</step>
      <step>Click #login-button</step>
      <step>Wait for navigation to /dashboard</step>
      <step>Assert text 'Welcome' is visible</step>
      <step>Take screenshot</step>
      <step>Close browser</step>
    </workflow>
  </example>

  <example scenario="Form Testing">
    <input>Test partner signup form validation</input>
    <workflow>
      <step>Navigate to /signup</step>
      <step>Fill name, email, password fields</step>
      <step>Click submit without accepting terms</step>
      <step>Assert error message is visible</step>
      <step>Check terms checkbox</step>
      <step>Click submit</step>
      <step>Wait for success message</step>
      <step>Verify redirect to dashboard</step>
    </workflow>
  </example>

  <example scenario="Responsive Testing">
    <input>Test mobile layout</input>
    <workflow>
      <step>Launch browser</step>
      <step>Set viewport to 375x667 (mobile)</step>
      <step>Navigate to homepage</step>
      <step>Assert hamburger menu is visible</step>
      <step>Click menu button</step>
      <step>Assert navigation appears</step>
      <step>Set viewport to 1920x1080 (desktop)</step>
      <step>Assert full navigation is visible</step>
      <step>Take screenshots for comparison</step>
    </workflow>
  </example>
</examples>

<error_handling>
  <error>
    <condition>Browser launch fails</condition>
    <solution>
      <step>Install browser binaries: npx playwright install</step>
      <step>Check system requirements</step>
      <step>Verify sufficient disk space</step>
    </solution>
  </error>
  <error>
    <condition>Element not found</condition>
    <solution>
      <step>Verify selector is correct</step>
      <step>Wait for element to load</step>
      <step>Check if element is in iframe</step>
      <step>Use browser DevTools to test selector</step>
    </solution>
  </error>
  <error>
    <condition>Test is flaky</condition>
    <solution>
      <step>Add explicit waits</step>
      <step>Use proper selectors</step>
      <step>Handle dynamic content</step>
      <step>Increase timeout if needed</step>
      <step>Check for race conditions</step>
    </solution>
  </error>
  <error>
    <condition>Screenshot fails</condition>
    <solution>
      <step>Ensure element is visible</step>
      <step>Check file path permissions</step>
      <step>Verify directory exists</step>
      <step>Wait for element to render</step>
    </solution>
  </error>
</error_handling>

<output_format>
  <format>
    <type>Element Text</type>
    <structure>String content of matched element(s)</structure>
  </format>
  <format>
    <type>Screenshot</type>
    <structure>Binary image data (PNG) or saved file path</structure>
  </format>
  <format>
    <type>Assertion Result</type>
    <structure>Boolean pass/fail with error message if failed</structure>
  </format>
</output_format>

<integration_notes>
  <note category="Setup">
    <content>First run requires: npx playwright install chromium (or firefox/webkit)</content>
  </note>
  <note category="Comparison">
    <content>Playwright vs Chrome DevTools: Playwright supports multi-browser testing, E2E framework, PDF generation, network mocking, and headless mode. Chrome DevTools is for manual debugging and live inspection.</content>
  </note>
  <note category="Best Practice">
    <content>Use data-testid attributes for test selectors to avoid coupling tests to implementation details</content>
  </note>
</integration_notes>
