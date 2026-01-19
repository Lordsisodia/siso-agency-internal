---
name: chrome-devtools
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Complete guide to using Chrome DevTools MCP server for browser automation with Claude Code
author: blackbox5/mcp
verified: true
tags: [mcp, chrome, browser, automation, debugging]
---

# Chrome DevTools MCP Server Skills

<context>
The Chrome DevTools MCP server connects Claude Code to Chrome's DevTools Protocol, enabling browser automation, debugging, and inspection capabilities.

**Type:** STDIO (local)
**Browser:** Google Chrome
**Purpose:** Browser automation and debugging

**Prerequisites:**
1. Google Chrome installed on your system
2. Chrome Path configured correctly:
   - macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
   - Linux: `/usr/bin/google-chrome`
   - Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`
3. Allow Chrome to be controlled by automation

**Protocol:** Uses Chrome DevTools Protocol (Page, Runtime, Network, DOM, CSS, Console, Performance, Debugger)
</context>

<instructions>
When working with Chrome DevTools MCP, use natural language commands to control the browser. Claude will convert your requests into appropriate Chrome DevTools Protocol calls.

Use specific selectors (ID > class > tag) for better reliability. Always wait for page loads before interacting with elements.
</instructions>

<workflow>
  <phase name="Browser Setup">
    <goal>Launch and configure browser</goal>
    <steps>
      <step>Browser launches automatically with first command</step>
      <step>Use `chrome_navigate` to open initial URL</step>
      <step>Wait for page load before interaction</step>
    </steps>
  </phase>

  <phase name="Page Interaction">
    <goal>Navigate and interact with web pages</goal>
    <steps>
      <step>Use `chrome_navigate` to go to URLs</step>
      <step>Use `chrome_fill` to fill form inputs</step>
      <step>Use `chrome_click` to click elements</step>
      <step>Use `chrome_select` for dropdowns</step>
    </steps>
  </phase>

  <phase name="Inspection & Debugging">
    <goal>Inspect and debug page content</goal>
    <steps>
      <step>Use `chrome_get_html` to view page structure</step>
      <step>Use `chrome_get_console_logs` to check for errors</step>
      <step>Use `chrome_evaluate` to run JavaScript</step>
      <step>Use `chrome_screenshot` to capture visual state</step>
    </steps>
  </phase>

  <phase name="Data Extraction">
    <goal>Extract data from pages</goal>
    <steps>
      <step>Use `chrome_get_text` to extract content</step>
      <step>Use `chrome_get_attribute` for element attributes</step>
      <step>Use `chrome_get_css` for styles</step>
      <step>Process and save extracted data</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="Browser Control">
    <skill name="chrome_navigate">
      <purpose>Navigate to a URL</purpose>
      <usage>Navigate to https://example.com</usage>
      <parameters>
        <param name="url">Target URL</param>
      </parameters>
    </skill>
    <skill name="chrome_reload">
      <purpose>Reload the current page</purpose>
      <usage>Refresh with cache cleared</usage>
      <parameters>
        <param name="ignore_cache">Clear cache before reloading (default: false)</param>
      </parameters>
    </skill>
    <skill name="chrome_go_back">
      <purpose>Navigate back in browser history</purpose>
      <usage>Go back to previous page</usage>
    </skill>
    <skill name="chrome_go_forward">
      <purpose>Navigate forward in browser history</purpose>
      <usage>Go forward</usage>
    </skill>
  </skill_group>

  <skill_group name="Page Interaction">
    <skill name="chrome_click">
      <purpose>Click an element on the page</purpose>
      <usage>Click element with ID 'submit-btn'</usage>
      <parameters>
        <param name="selector">CSS selector or XPath</param>
        <param name="wait_for">Wait for navigation after click (optional)</param>
      </parameters>
    </skill>
    <skill name="chrome_fill">
      <purpose>Fill form input fields</purpose>
      <usage>Fill #email with "test@example.com"</usage>
      <parameters>
        <param name="selector">Input element selector</param>
        <param name="value">Value to enter</param>
      </parameters>
    </skill>
    <skill name="chrome_select">
      <purpose>Select an option from a dropdown</purpose>
      <usage>Select 'United States' from country dropdown</usage>
      <parameters>
        <param name="selector">Select element</param>
        <param name="value">Option value or text</param>
      </parameters>
    </skill>
    <skill name="chrome_hover">
      <purpose>Hover over an element</purpose>
      <usage>Hover over the navigation menu</usage>
      <parameters>
        <param name="selector">Element selector</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Page Inspection">
    <skill name="chrome_get_html">
      <purpose>Get the HTML content of the page or element</purpose>
      <usage>Get HTML for the main element</usage>
      <parameters>
        <param name="selector">Element selector (optional, defaults to entire page)</param>
      </parameters>
    </skill>
    <skill name="chrome_get_text">
      <purpose>Extract text content from elements</purpose>
      <usage>Extract text from .product-list</usage>
      <parameters>
        <param name="selector">Element selector</param>
      </parameters>
    </skill>
    <skill name="chrome_get_attribute">
      <purpose>Get attribute value from an element</purpose>
      <usage>Get the href attribute of all links</usage>
      <parameters>
        <param name="selector">Element selector</param>
        <param name="attribute">Attribute name</param>
      </parameters>
    </skill>
    <skill name="chrome_get_css">
      <purpose>Get CSS styles for an element</purpose>
      <usage>Show computed styles for .button</usage>
      <parameters>
        <param name="selector">Element selector</param>
      </parameters>
      <returns>Computed styles, pseudo-element styles, inherited styles</returns>
    </skill>
  </skill_group>

  <skill_group name="JavaScript Execution">
    <skill name="chrome_evaluate">
      <purpose>Execute JavaScript in the page context</purpose>
      <usage>Run document.querySelectorAll('.item')</usage>
      <parameters>
        <param name="code">JavaScript code to execute</param>
      </parameters>
      <returns>Execution result, return value, errors (if any)</returns>
    </skill>
    <skill name="chrome_evaluate_async">
      <purpose>Execute async JavaScript</purpose>
      <usage>Run await fetch('/api/data')</usage>
      <parameters>
        <param name="code">Async JavaScript code</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Screenshot & Visual">
    <skill name="chrome_screenshot">
      <purpose>Take a screenshot of the page or element</purpose>
      <usage>Capture full page screenshot</usage>
      <parameters>
        <param name="selector">Element to screenshot (optional)</param>
        <param name="full_page">Capture entire scrollable page (default: false)</param>
        <param name="path">Save path (optional)</param>
      </parameters>
    </skill>
    <skill name="chrome_pdf">
      <purpose>Generate PDF of the current page</purpose>
      <usage>Save as PDF</usage>
      <parameters>
        <param name="path">Save path (optional)</param>
        <param name="landscape">Landscape orientation (default: false)</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Network Monitoring">
    <skill name="chrome_get_network_logs">
      <purpose>Get network request logs</purpose>
      <usage>Show all XHR requests</usage>
      <returns>Request URLs, status codes, response times, request/response headers</returns>
    </skill>
    <skill name="chrome_get_request_details">
      <purpose>Get details of a specific network request</purpose>
      <usage>Get response headers for request ID</usage>
      <parameters>
        <param name="request_id">Network request ID</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Console & Debugging">
    <skill name="chrome_get_console_logs">
      <purpose>Get browser console logs</purpose>
      <usage>Show errors from console</usage>
      <returns>Console messages, errors, warnings, info logs</returns>
    </skill>
    <skill name="chrome_clear_console">
      <purpose>Clear browser console</purpose>
      <usage>Reset console logs</usage>
    </skill>
  </skill_group>

  <skill_group name="Performance & Metrics">
    <skill name="chrome_get_performance_metrics">
      <purpose>Get page performance metrics</purpose>
      <usage>Show page load time</usage>
      <returns>Page load time, DOMContentLoaded, First Contentful Paint, Largest Contentful Paint, CLS, TTI</returns>
    </skill>
    <skill name="chrome_get_memory_info">
      <purpose>Get memory usage information</purpose>
      <usage>Show browser memory stats</usage>
    </skill>
  </skill_group>

  <skill_group name="Element Manipulation">
    <skill name="chrome_set_style">
      <purpose>Set CSS style on an element</purpose>
      <usage>Set background color to red on .button</usage>
      <parameters>
        <param name="selector">Element selector</param>
        <param name="style">CSS property and value</param>
      </parameters>
    </skill>
    <skill name="chrome_add_class">
      <purpose>Add CSS class to element</purpose>
      <usage>Add class 'active' to .nav-item</usage>
      <parameters>
        <param name="selector">Element selector</param>
        <param name="class_name">Class to add</param>
      </parameters>
    </skill>
    <skill name="chrome_remove_class">
      <purpose>Remove CSS class from element</purpose>
      <usage>Remove class 'hidden' from #modal</usage>
      <parameters>
        <param name="selector">Element selector</param>
        <param name="class_name">Class to remove</param>
      </parameters>
    </skill>
  </skill_group>
</available_skills>

<best_practices>
  <do>
    <item>Use unique selectors (ID > class > tag)</item>
    <item>Wait for page load before interacting</item>
    <item>Check for element existence</item>
    <item>Handle dynamic content</item>
    <item>Clean up after tests</item>
    <item>Use specific selectors for reliability</item>
    <item>Check console for JavaScript errors</item>
    <item>Take screenshots for visual proof</item>
  </do>
  <dont>
    <item>Use brittle selectors</item>
    <item>Assume instant page loads</item>
    <item>Ignore console errors</item>
    <item>Hardcode wait times</item>
    <item>Test in production without care</item>
    <item>Forget to close browser after testing</item>
  </dont>
</best_practices>

<rules>
  <rule priority="high">Always wait for page load before interaction</rule>
  <rule priority="high">Use IDs over classes when available</rule>
  <rule priority="medium">Check console logs for errors</rule>
  <rule priority="medium">Take screenshots for debugging</rule>
  <rule priority="low">Clean up browser sessions after testing</rule>
</rules>

<error_handling>
  <error>
    <condition>Chrome not launching</condition>
    <solution>
      <step>Verify Chrome installation path</step>
      <step>Check Chrome version compatibility</step>
      <step>Ensure Chrome is not already running</step>
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
    <condition>Click not working</condition>
    <solution>
      <step>Check if element is clickable</step>
      <step>Verify element is visible</step>
      <step>Ensure element is not obscured</step>
      <step>Try JavaScript click instead</step>
    </solution>
  </error>
  <error>
    <condition>Screenshot fails</condition>
    <solution>
      <step>Check file path permissions</step>
      <step>Ensure directory exists</step>
      <step>Verify element is visible</step>
    </solution>
  </error>
</error_handling>

<integration_notes>
  <integration>
    <platform>Lumelle</platform>
    <workflows>
      <workflow name="Testing Lumelle App">
        <step>Navigate to http://localhost:5173</step>
        <step>Test navigation</step>
        <step>Fill contact form</step>
        <step>Submit and verify</step>
      </workflow>
      <workflow name="Debugging UI">
        <step>Open Lumelle in Chrome</step>
        <step>Inspect React components</step>
        <step>Get computed styles</step>
        <step>Check console for errors</step>
      </workflow>
      <workflow name="Visual Regression">
        <step>Take screenshot of homepage</step>
        <step>Compare with design</step>
        <step>Check responsive layouts</step>
        <step>Test dark mode</step>
      </workflow>
    </workflows>
  </integration>
</integration_notes>

<examples>
  <example>
    <scenario>Testing a Login Flow</scenario>
    <steps>
      <step>Navigate to /login</step>
      <step>Fill email input</step>
      <step>Fill password input</step>
      <step>Click submit button</step>
      <step>Wait for navigation</step>
      <step>Verify URL changed</step>
      <step>Check for success message</step>
      <step>Take screenshot</step>
    </steps>
  </example>
  <example>
    <scenario>Debugging a UI Issue</scenario>
    <steps>
      <step>Navigate to problematic page</step>
      <step>Get console logs (check for errors)</step>
      <step>Inspect problematic element</step>
      <step>Get computed styles</step>
      <step>Evaluate JavaScript to test fix</step>
      <step>Apply style changes</step>
      <step>Verify fix works</step>
    </steps>
  </example>
  <example>
    <scenario>Performance Audit</scenario>
    <steps>
      <step>Navigate to page</step>
      <step>Clear cache</step>
      <step>Reload page</step>
      <step>Get performance metrics</step>
      <step>Analyze metrics</step>
      <step>Get network logs</step>
      <step>Identify slow requests</step>
      <step>Suggest optimizations</step>
    </steps>
  </example>
</examples>

<advanced_usage>
  <feature>Multiple Pages</feature>
  <capabilities>
    <capability>Open new tab</capability>
    <capability>Navigate to different URL</capability>
    <capability>Switch between tabs</capability>
    <capability>Close specific tab</capability>
  </capabilities>
  <feature>Cookie Management</feature>
  <capabilities>
    <capability>Get all cookies</capability>
    <capability>Set cookie value</capability>
    <capability>Delete cookies</capability>
  </capabilities>
  <feature>Storage</feature>
  <capabilities>
    <capability>Get localStorage item</capability>
    <capability>Set localStorage value</capability>
    <capability>Clear localStorage</capability>
    <capability>Manipulate session data</capability>
  </capabilities>
  <feature>Device Emulation</feature>
  <capabilities>
    <capability>Emulate mobile device</capability>
    <capability>Set viewport size</capability>
    <capability>Test responsive design</capability>
  </capabilities>
</advanced_usage>
