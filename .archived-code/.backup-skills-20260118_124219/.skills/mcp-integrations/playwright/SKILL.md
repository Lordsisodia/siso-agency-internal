# Playwright MCP Server Skills

Complete guide to using Playwright MCP server with Claude Code.

## Overview

Playwright is a powerful end-to-end testing framework that enables cross-browser automation, testing, and web scraping.

**Type:** STDIO (local)
**Browsers Supported:** Chrome, Firefox, Safari, Edge
**Purpose:** E2E testing and browser automation

---

## Prerequisites

Before using Playwright MCP, ensure you have:

1. **Playwright Installed** - Automatically installed via npx
2. **Browser Binaries** - First run will download browser binaries
3. **Test Files** - Organized test structure (optional)

**Initial Setup:**
```bash
npx playwright install chromium
```

---

## Available Skills

### Browser Launch & Control

#### `playwright_launch`
Launch a browser instance.

**Usage:**
```
Launch Chrome browser
Start Firefox in headless mode
Open browser with viewport
```

**Parameters:**
- `browser`: Browser type (chromium, firefox, webkit)
- `headless`: Run headlessly (default: true)
- `viewport`: Viewport size {width, height}

---

#### `playwright_navigate`
Navigate to a URL.

**Usage:**
```
Navigate to https://example.com
Go to localhost:3000
Open https://google.com
```

**Parameters:**
- `url`: Target URL
- `wait_until`: Wait condition (load, domcontentloaded, networkidle)

---

#### `playwright_close`
Close the browser or page.

**Usage:**
```
Close the browser
Close current tab
```

---

### Page Interaction

#### `playwright_click`
Click an element on the page.

**Usage:**
```
Click the login button
Click element with text 'Submit'
Click #submit-btn
```

**Parameters:**
- `selector`: Element selector (CSS, XPath, text)
- `wait_for`: Wait for navigation after click

---

#### `playwright_fill`
Fill form input fields.

**Usage:**
```
Fill the email input
Fill #password with 'secret'
Fill name and email fields
```

**Parameters:**
- `selector`: Input element selector
- `value`: Value to enter

---

#### `playwright_type`
Type text character by character.

**Usage:**
```
Type 'Hello World' in textarea
Slow-type in search box
```

**Parameters:**
- `selector`: Element selector
- `text`: Text to type
- `delay`: Delay between keystrokes (ms)

---

#### `playwright_select`
Select option from dropdown.

**Usage:**
```
Select 'United States' from country dropdown
Choose option 2
```

**Parameters:**
- `selector`: Select element
- `value`: Option value or label

---

#### `playwright_check`
Check a checkbox.

**Usage:**
```
Check the 'agree' checkbox
Check #terms-checkbox
```

---

#### `playwright_uncheck`
Uncheck a checkbox.

**Usage:**
```
Uncheck the newsletter checkbox
Uncheck #subscribe
```

---

### Element Inspection

#### `playwright_get_text`
Get text content from element(s).

**Usage:**
```
Get text from h1
Extract all product names
Get inner text of .container
```

**Parameters:**
- `selector`: Element selector

---

#### `playwright_get_html`
Get HTML content of element or page.

**Usage:**
```
Get HTML of the page
Get HTML for .main-content
```

---

#### `playwright_get_attribute`
Get attribute value from element.

**Usage:**
```
Get href from all links
Get data-id from element
```

**Parameters:**
- `selector`: Element selector
- `attribute`: Attribute name

---

#### `playwright_get_element_count`
Count elements matching selector.

**Usage:**
```
Count number of .item elements
How many buttons on page?
```

**Parameters:**
- `selector`: Element selector

---

#### `playwright_is_visible`
Check if element is visible.

**Usage:**
```
Is the modal visible?
Check if button is displayed
```

**Parameters:**
- `selector`: Element selector

---

#### `playwright_is_enabled`
Check if element is enabled.

**Usage:**
```
Is the submit button enabled?
Can I click this button?
```

---

### Waiting & Timing

#### `playwright_wait_for_selector`
Wait for element to appear.

**Usage:**
```
Wait for .modal to appear
Wait for #success-message
```

**Parameters:**
- `selector`: Element selector
- `timeout`: Maximum wait time (default: 30000ms)

---

#### `playwright_wait_for_navigation`
Wait for page navigation.

**Usage:**
```
Wait for page to load after click
Wait for navigation to complete
```

---

#### `playwright_wait_for_timeout`
Wait for specific time.

**Usage:**
```
Wait for 5 seconds
Sleep for 1000ms
```

**Parameters:**
- `timeout`: Time to wait (milliseconds)

---

#### `playwright_wait_for_response`
Wait for network response.

**Usage:**
```
Wait for API response
Wait for /api/data response
```

**Parameters:**
- `url`: URL or URL pattern
- `timeout`: Maximum wait time

---

### Screenshot & PDF

#### `playwright_screenshot`
Take screenshot of page or element.

**Usage:**
```
Take screenshot
Screenshot the .header
Capture full page
```

**Parameters:**
- `selector`: Element to screenshot (optional)
- `full_page`: Capture entire page (default: false)
- `path`: Save path (optional)

---

#### `playwright_pdf`
Generate PDF of current page.

**Usage:**
```
Save page as PDF
Generate PDF of documentation
```

**Parameters:**
- `path`: Save path (optional)
- `format`: Paper format (A4, Letter)
- `landscape**: Landscape orientation (default: false)

---

### JavaScript Execution

#### `playwright_evaluate`
Execute JavaScript in page context.

**Usage:**
```
Run document.title
Execute localStorage.getItem('token')
Evaluate window.scrollY
```

**Parameters:**
- `code`: JavaScript code

---

#### `playwright_evaluate_async`
Execute async JavaScript.

**Usage:**
```
Run await fetch('/api/data')
Execute async function
```

**Parameters:**
- `code`: Async JavaScript code

---

### Form & Input

#### `playwright_upload_file`
Upload file through file input.

**Usage:**
```
Upload file to input
Upload /path/to/file.png
```

**Parameters:**
- `selector`: File input element
- `file_path`: Path to file

---

#### `playwright_hover`
Hover over element.

**Usage:**
```
Hover over navigation menu
Mouse over tooltip trigger
```

**Parameters:**
- `selector`: Element selector

---

#### `playwright_focus`
Focus on element.

**Usage:**
```
Focus on email input
Set focus to textarea
```

**Parameters:**
- `selector`: Element selector

---

### Browser Context

#### `playwright_set_viewport`
Set browser viewport size.

**Usage:**
```
Set viewport to mobile size
Set viewport to 1920x1080
```

**Parameters:**
- `width`: Viewport width
- `height`: Viewport height

---

#### `playwright_emulate_device`
Emulate specific device.

**Usage:**
```
Emulate iPhone 12
Emulate iPad Pro
Test on mobile device
```

**Parameters:**
- `device`: Device name (iPhone, iPad, etc.)

---

#### `playwright_set_geolocation`
Set geolocation.

**Usage:**
```
Set location to New York
Set geolocation coordinates
```

**Parameters:**
- `latitude`: Latitude
- `longitude`: Longitude

---

#### `playwright_set_offline`
Set offline mode.

**Usage:**
```
Go offline
Test offline behavior
```

---

### Network & API

#### `playwright_mock_response`
Mock network responses.

**Usage:**
```
Mock API response
Mock /api/users to return test data
```

**Parameters:**
- `url`: URL to mock
- `response`: Mock response data

---

#### `playwright_intercept_route`
Intercept and modify network requests.

**Usage:**
```
Intercept API calls
Block specific requests
Modify request headers
```

---

#### `playwright_wait_for_request`
Wait for network request.

**Usage:**
```
Wait for XHR request
Wait for API call to complete
```

---

### Testing & Assertions

#### `playwright_assert_text`
Assert text exists on page.

**Usage:**
```
Assert 'Welcome' is visible
Verify 'Success' text exists
```

**Parameters:**
- `text`: Expected text
- `selector`: Element selector (optional)

---

#### `playwright_assert_visible`
Assert element is visible.

**Usage:**
```
Assert button is visible
Verify modal appears
```

**Parameters:**
- `selector`: Element selector

---

#### `playwright_assert_url`
Assert current URL.

**Usage:**
```
Assert URL is /dashboard
Verify we're on homepage
```

**Parameters:**
- `url`: Expected URL

---

#### `playwright_assert_title`
Assert page title.

**Usage:**
```
Assert title is 'Home Page'
Verify page title
```

**Parameters:**
- `title`: Expected title

---

## Common Workflows

### 1. E2E Testing
```
Launch browser
Navigate to app
Fill login form
Click submit
Wait for dashboard
Assert success message
Take screenshot
Close browser
```

### 2. Visual Testing
```
Navigate to page
Take screenshot
Compare with baseline
Highlight differences
```

### 3. Form Testing
```
Go to form page
Fill all fields
Select options
Upload file
Submit form
Verify success
```

### 4. Cross-Browser Testing
```
Test in Chrome
Test in Firefox
Test in Safari
Compare results
```

### 5. Mobile Testing
```
Emulate iPhone
Test responsive design
Check touch interactions
Verify mobile features
```

---

## Integration with Lumelle

### Testing Lumelle App
```
Launch browser
Navigate to localhost:5173
Test navigation
Fill contact form
Submit and verify
Check responsive design
```

### Visual Regression
```
Navigate to each page
Take screenshots
Save to baseline
Compare with previous
Report differences
```

### Form Testing
```
Test partner signup form
Validate required fields
Check form validation
Test error handling
Verify submission
```

### E2E Test Suite
```
Test user registration
Test partner login
Test product creation
Test order flow
Test dashboard
```

---

## Tips

1. **Use specific selectors** - Prefer IDs, data-testid attributes
2. **Wait properly** - Use explicit waits over fixed timeouts
3. **Handle async** - Wait for elements, don't assume instant load
4. **Clean up** - Close browsers after tests
5. **Use headless for CI** - Faster in automated pipelines

---

## Best Practices

✅ **DO:**
- Use data-testid attributes for selectors
- Wait for elements explicitly
- Test in multiple browsers
- Use descriptive test names
- Clean up after tests
- Handle dynamic content
- Use page object model
- Run tests in parallel

❌ **DON'T:**
- Use brittle selectors (nth-child)
- Hardcode sleep times
- Test only in Chrome
- Skip cleanup
- Ignore async timing
- Mix concerns in tests
- Duplicate test code

---

## Testing Patterns

### Page Object Model
```javascript
// Define page objects
class LoginPage {
  async login(email, password) {
    await this.fill('#email', email)
    await this.fill('#password', password)
    await this.click('#submit')
  }
}

// Use in tests
const login = new LoginPage()
await login.login('user@example.com', 'pass')
```

### Test Fixtures
```javascript
// Setup fixtures
beforeEach(async () => {
  await navigateTo('/test-page')
  await resetDatabase()
})

// Tests run with fresh state
test('should display user data', async () => {
  // Test code here
})
```

### Data-Driven Tests
```javascript
// Test with multiple datasets
const testCases = [
  { email: 'valid@example.com', expected: 'success' },
  { email: 'invalid', expected: 'error' }
]

for (const testCase of testCases) {
  await runTest(testCase)
}
```

---

## Troubleshooting

**Browser launch fails:**
- Install browser binaries: `npx playwright install`
- Check system requirements
- Verify sufficient disk space

**Element not found:**
- Verify selector is correct
- Wait for element to load
- Check if element is in iframe
- Use browser DevTools to test selector

**Test flaky:**
- Add explicit waits
- Use proper selectors
- Handle dynamic content
- Increase timeout if needed
- Check for race conditions

**Screenshot fails:**
- Ensure element is visible
- Check file path permissions
- Verify directory exists
- Wait for element to render

**Performance issues:**
- Use headless mode
- Disable unnecessary features
- Reuse browser context
- Run tests in parallel
- Optimize test code

---

## Playwright vs Chrome DevTools

| Feature | Playwright | Chrome DevTools |
|---------|-----------|-----------------|
| Multi-browser | ✅ Chrome, Firefox, Safari | ❌ Chrome only |
| E2E Testing | ✅ Full testing framework | ❌ Manual testing |
| Screenshot | ✅ Full page support | ✅ Screenshot |
| PDF Generation | ✅ Native support | ❌ Not supported |
| Network Mocking | ✅ Request/response mocking | ⚠️ Limited |
| Mobile Emulation | ✅ Device emulation | ⚠️ Limited |
| Headless Mode | ✅ Full support | ❌ Requires display |
| Parallel Testing | ✅ Multiple browsers | ❌ Single browser |

**Use Playwright for:** Automated testing, cross-browser testing, CI/CD
**Use Chrome DevTools for:** Manual debugging, live inspection, development

---

## Advanced Features

### API Testing
```
Make API request
Verify response status
Validate response data
Test error handling
```

### File Download
```
Trigger download
Wait for download
Verify file
```

### iFrames
```
Switch to iframe
Interact with iframe content
Switch back to main frame
```

### Multiple Tabs
```
Open new tab
Switch between tabs
Share context between tabs
```

### Browser Context
```
Create isolated context
Set cookies
Set localStorage
Use context for tests
```

### Trace & Debug
```
Enable tracing
Record test execution
View trace file
Debug with inspector
```

---

## Example Test Scenarios

### User Registration Flow
```
1. Navigate to /register
2. Fill registration form
3. Accept terms checkbox
4. Click submit button
5. Wait for success message
6. Verify redirect to dashboard
7. Check user created in database
8. Take screenshot
```

### Shopping Cart Test
```
1. Navigate to product page
2. Click 'Add to Cart'
3. Verify cart count updates
4. Go to cart page
5. Verify product in cart
6. Update quantity
7. Verify total price
8. Proceed to checkout
```

### Responsive Design Test
```
1. Navigate to homepage
2. Set viewport to mobile (375x667)
3. Verify hamburger menu appears
4. Test navigation
5. Set viewport to desktop
6. Verify full navigation
7. Take screenshots for comparison
```

---

**Need Help?** Just ask Claude: "Use Playwright to test..."
