# Chrome DevTools MCP Server Skills

Complete guide to using Chrome DevTools MCP server with Claude Code.

## Overview

The Chrome DevTools MCP server connects Claude Code to Chrome's DevTools Protocol, enabling browser automation, debugging, and inspection capabilities.

**Type:** STDIO (local)
**Browser:** Google Chrome
**Purpose:** Browser automation and debugging

---

## Prerequisites

Before using Chrome DevTools MCP, ensure you have:

1. **Google Chrome** - Installed on your system
2. **Chrome Path** - Correct path to Chrome executable
   - macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
   - Linux: `/usr/bin/google-chrome`
   - Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`

3. **Permissions** - Allow Chrome to be controlled by automation

---

## Available Skills

### Browser Control

#### `chrome_navigate`
Navigate to a URL.

**Usage:**
```
Navigate to https://example.com
Go to localhost:3000
Open https://google.com
```

**Parameters:**
- `url`: Target URL

---

#### `chrome_reload`
Reload the current page.

**Usage:**
```
Reload the page
Refresh with cache cleared
Hard reload
```

**Parameters:**
- `ignore_cache`: Clear cache before reloading (default: false)

---

#### `chrome_go_back`
Navigate back in browser history.

**Usage:**
```
Go back to previous page
Navigate back
```

---

#### `chrome_go_forward`
Navigate forward in browser history.

**Usage:**
```
Go forward
Navigate forward
```

---

### Page Interaction

#### `chrome_click`
Click an element on the page.

**Usage:**
```
Click the login button
Click element with ID 'submit-btn'
Click the '.cta-button' element
```

**Parameters:**
- `selector`: CSS selector or XPath
- `wait_for`: Wait for navigation after click (optional)

---

#### `chrome_fill`
Fill form input fields.

**Usage:**
```
Fill the email input with john@example.com
Fill name and password fields
```

**Parameters:**
- `selector`: Input element selector
- `value`: Value to enter

**Example:**
```
Fill #email with "test@example.com"
Fill #password with "secret123"
```

---

#### `chrome_select`
Select an option from a dropdown.

**Usage:**
```
Select 'United States' from country dropdown
Choose option 2 from the select element
```

**Parameters:**
- `selector`: Select element
- `value`: Option value or text

---

#### `chrome_hover`
Hover over an element.

**Usage:**
```
Hover over the navigation menu
Mouse over the tooltip trigger
```

**Parameters:**
- `selector`: Element selector

---

### Page Inspection

#### `chrome_get_html`
Get the HTML content of the page or element.

**Usage:**
```
Get the page HTML
Get HTML for the main element
```

**Parameters:**
- `selector`: Element selector (optional, defaults to entire page)

---

#### `chrome_get_text`
Extract text content from elements.

**Usage:**
```
Get all text from the page
Extract text from .product-list
```

**Parameters:**
- `selector`: Element selector

---

#### `chrome_get_attribute`
Get attribute value from an element.

**Usage:**
```
Get the href attribute of all links
Get data-id from elements
```

**Parameters:**
- `selector`: Element selector
- `attribute`: Attribute name

---

#### `chrome_get_css`
Get CSS styles for an element.

**Usage:**
```
Get CSS for the header
Show computed styles for .button
```

**Parameters:**
- `selector`: Element selector

**Returns:**
- Computed styles
- Pseudo-element styles
- Inherited styles

---

### JavaScript Execution

#### `chrome_evaluate`
Execute JavaScript in the page context.

**Usage:**
```
Run document.querySelectorAll('.item')
Execute localStorage.getItem('token')
Evaluate window.location.href
```

**Parameters:**
- `code`: JavaScript code to execute

**Returns:**
- Execution result
- Return value
- Errors (if any)

---

#### `chrome_evaluate_async`
Execute async JavaScript.

**Usage:**
```
Run await fetch('/api/data')
Execute async function
```

**Parameters:**
- `code`: Async JavaScript code

---

### Screenshot & Visual

#### `chrome_screenshot`
Take a screenshot of the page or element.

**Usage:**
```
Take a screenshot
Screenshot the .header element
Capture full page screenshot
```

**Parameters:**
- `selector`: Element to screenshot (optional)
- `full_page`: Capture entire scrollable page (default: false)
- `path`: Save path (optional)

---

#### `chrome_pdf`
Generate PDF of the current page.

**Usage:**
```
Generate PDF of this page
Save as PDF
```

**Parameters:**
- `path`: Save path (optional)
- `landscape`: Landscape orientation (default: false)

---

### Network Monitoring

#### `chrome_get_network_logs`
Get network request logs.

**Usage:**
```
Show network requests
Get all XHR requests
```

**Returns:**
- Request URLs
- Status codes
- Response times
- Request/response headers

---

#### `chrome_get_request_details`
Get details of a specific network request.

**Usage:**
```
Show details for request to /api/users
Get response headers for request ID
```

**Parameters:**
- `request_id`: Network request ID

---

### Console & Debugging

#### `chrome_get_console_logs`
Get browser console logs.

**Usage:**
```
Get console logs
Show errors from console
```

**Returns:**
- Console messages
- Errors
- Warnings
- Info logs

---

#### `chrome_clear_console`
Clear browser console.

**Usage:**
```
Clear the console
Reset console logs
```

---

### Performance & Metrics

#### `chrome_get_performance_metrics`
Get page performance metrics.

**Usage:**
```
Get performance metrics
Show page load time
```

**Returns:**
- Page load time
- DOMContentLoaded time
- First Contentful Paint
- Largest Contentful Paint
- Cumulative Layout Shift
- Time to Interactive

---

#### `chrome_get_memory_info`
Get memory usage information.

**Usage:**
```
Get memory usage
Show browser memory stats
```

---

### Element Manipulation

#### `chrome_set_style`
Set CSS style on an element.

**Usage:**
```
Set background color to red on .button
Add border to #header
```

**Parameters:**
- `selector`: Element selector
- `style`: CSS property and value

**Example:**
```
Set display: none on .modal
Set opacity: 0.5 on img
```

---

#### `chrome_add_class`
Add CSS class to element.

**Usage:**
```
Add class 'active' to .nav-item
Add 'hidden' to #modal
```

**Parameters:**
- `selector`: Element selector
- `class_name`: Class to add

---

#### `chrome_remove_class`
Remove CSS class from element.

**Usage:**
```
Remove class 'hidden' from #modal
Remove 'active' from .nav-item
```

---

## Common Workflows

### 1. Web Testing
```
Navigate to localhost:3000
Fill login form
Click submit
Take screenshot
Verify success message
```

### 2. Debugging
```
Open page with bug
Get console errors
Inspect element
Get computed styles
Evaluate JavaScript
```

### 3. Visual Testing
```
Load page
Take screenshot
Compare with baseline
Highlight differences
```

### 4. Performance Analysis
```
Navigate to page
Wait for load
Get performance metrics
Analyze bottlenecks
```

### 5. Data Extraction
```
Navigate to page
Get HTML
Extract data
Save to file
```

---

## Integration with Lumelle

### Testing Lumelle App
```
Navigate to http://localhost:5173
Test navigation
Fill contact form
Submit and verify
```

### Debugging UI
```
Open Lumelle in Chrome
Inspect React components
Get computed styles
Check console for errors
```

### Visual Regression
```
Take screenshot of homepage
Compare with design
Check responsive layouts
Test dark mode
```

---

## Tips

1. **Use specific selectors** - IDs are faster than classes
2. **Wait for elements** - Pages may load asynchronously
3. **Check console** - Always look for JavaScript errors
4. **Take screenshots** - Visual proof of test results
5. **Use Chrome DevTools** - For complex debugging, pair with actual DevTools

---

## Best Practices

✅ **DO:**
- Use unique selectors (ID > class > tag)
- Wait for page load before interacting
- Check for element existence
- Handle dynamic content
- Clean up after tests

❌ **DON'T:**
- Use brittle selectors
- Assume instant page loads
- Ignore console errors
- Hardcode wait times
- Test in production without care

---

## Troubleshooting

**Chrome not launching:**
- Verify Chrome installation path
- Check Chrome version compatibility
- Ensure Chrome is not already running

**Element not found:**
- Verify selector is correct
- Wait for element to load
- Check if element is in iframe
- Use browser DevTools to test selector

**Click not working:**
- Check if element is clickable
- Verify element is visible
- Ensure element is not obscured
- Try JavaScript click instead

**Screenshot fails:**
- Check file path permissions
- Ensure directory exists
- Verify element is visible

---

## Chrome DevTools Protocol

This MCP server uses the Chrome DevTools Protocol, which provides:

- **Page** - Page interactions and navigation
- **Runtime** - JavaScript execution
- **Network** - Network monitoring
- **DOM** - DOM inspection and manipulation
- **CSS** - Style manipulation
- **Console** - Console access
- **Performance** - Performance metrics
- **Debugger** - Script debugging

---

## Advanced Usage

### Multiple Pages
```
Open new tab
Navigate to different URL
Switch between tabs
Close specific tab
```

### Cookie Management
```
Get all cookies
Set cookie value
Delete cookies
```

### Local Storage
```
Get localStorage item
Set localStorage value
Clear localStorage
```

### Session Storage
```
Get sessionStorage
Manipulate session data
```

### Device Emulation
```
Emulate mobile device
Set viewport size
Test responsive design
```

---

## Example Workflows

### Testing a Login Flow
```
1. Navigate to /login
2. Fill email input
3. Fill password input
4. Click submit button
5. Wait for navigation
6. Verify URL changed
7. Check for success message
8. Take screenshot
```

### Debugging a UI Issue
```
1. Navigate to problematic page
2. Get console logs (check for errors)
3. Inspect problematic element
4. Get computed styles
5. Evaluate JavaScript to test fix
6. Apply style changes
7. Verify fix works
```

### Performance Audit
```
1. Navigate to page
2. Clear cache
3. Reload page
4. Get performance metrics
5. Analyze metrics
6. Get network logs
7. Identify slow requests
8. Suggest optimizations
```

---

**Need Help?** Just ask Claude: "Use Chrome DevTools to..."
