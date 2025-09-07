import { chromium } from 'playwright';

async function captureScreenshot() {
  // Launch browser
  const browser = await chromium.launch({
    headless: false // Set to true if you don't want to see the browser
  });

  // Create context with iPhone 14 Pro viewport
  const context = await browser.newContext({
    ...devices['iPhone 14 Pro'],
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    permissions: ['microphone'] // Grant microphone permissions
  });

  const page = await context.newPage();
  
  // Listen to console logs for voice service debugging
  page.on('console', msg => {
    if (msg.text().toLowerCase().includes('voice') || 
        msg.text().toLowerCase().includes('microphone') ||
        msg.text().toLowerCase().includes('speech') ||
        msg.text().toLowerCase().includes('audio')) {
      console.log('🎤 Voice-related console log:', msg.text());
    }
  });

  // Listen to page errors
  page.on('pageerror', error => {
    console.log('❌ Page error:', error.message);
  });

  try {
    // Navigate to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle' });
    
    // Wait for login form to be visible
    await page.waitForSelector('input[placeholder*="email" i], input[placeholder*="@example.com" i]', { timeout: 10000 });
    
    // Fill in login credentials
    console.log('Filling login credentials...');
    // Find and fill email input
    const emailInput = await page.locator('input[placeholder*="email" i], input[placeholder*="@example.com" i]').first();
    await emailInput.fill('Fuzeheritage123456789@gmail.com');
    
    // Find and fill password input
    const passwordInput = await page.locator('input[type="password"], input[placeholder*="password" i]').first();
    await passwordInput.fill('Million2025@SISO');
    
    // Submit login form
    console.log('Submitting login form...');
    // Try to find and click the submit button
    const submitButton = await page.locator('button:has-text("Sign In"), button:has-text("Sign in"), button:has-text("Login"), button:has-text("Log in")').first();
    await submitButton.click();
    
    // Wait for navigation after login - wait for any successful navigation
    await page.waitForTimeout(3000); // Give login time to process
    
    // Check if we're on admin page already
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    // Navigate to life-lock page
    console.log('Navigating to admin/life-lock page...');
    await page.goto('http://localhost:5173/admin/life-lock', { waitUntil: 'networkidle' });
    
    // Wait a bit for any dynamic content to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    const screenshotPath = './screenshots/admin-life-lock-iphone14pro.png';
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Now test microphone functionality
    console.log('\n🎤 Testing microphone functionality...');
    
    // Look for microphone buttons
    console.log('🔍 Searching for microphone buttons...');
    
    // Check for floating action button (FAB) with microphone
    const microphoneFAB = await page.locator('[data-testid*="microphone"], [aria-label*="microphone"], button:has([data-icon="microphone"]), .microphone-fab, .voice-fab').count();
    if (microphoneFAB > 0) {
      console.log('✅ Found microphone floating action button');
    }
    
    // Check for top-center microphone button
    const topMicButton = await page.locator('header [data-testid*="microphone"], .top-bar [aria-label*="microphone"], .navbar button:has([data-icon="microphone"])').count();
    if (topMicButton > 0) {
      console.log('✅ Found top-center microphone button');
    }
    
    // Check for any button with microphone icon or text
    const anyMicButton = await page.locator('button:has-text("microphone"), button:has-text("voice"), button[aria-label*="voice"], button[title*="microphone"]').count();
    if (anyMicButton > 0) {
      console.log('✅ Found microphone/voice button');
    }
    
    // Get all buttons and check their attributes/content for microphone-related elements
    const allButtons = await page.locator('button').all();
    let microphoneButtons = [];
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const buttonText = await button.textContent().catch(() => '');
      const ariaLabel = await button.getAttribute('aria-label').catch(() => '');
      const title = await button.getAttribute('title').catch(() => '');
      const className = await button.getAttribute('class').catch(() => '');
      const dataTestId = await button.getAttribute('data-testid').catch(() => '');
      
      if (buttonText?.toLowerCase().includes('microphone') ||
          buttonText?.toLowerCase().includes('voice') ||
          ariaLabel?.toLowerCase().includes('microphone') ||
          ariaLabel?.toLowerCase().includes('voice') ||
          title?.toLowerCase().includes('microphone') ||
          title?.toLowerCase().includes('voice') ||
          className?.toLowerCase().includes('mic') ||
          className?.toLowerCase().includes('voice') ||
          dataTestId?.toLowerCase().includes('mic') ||
          dataTestId?.toLowerCase().includes('voice')) {
        
        microphoneButtons.push({
          text: buttonText,
          ariaLabel,
          title,
          className,
          dataTestId
        });
      }
    }
    
    console.log(`Found ${microphoneButtons.length} potential microphone buttons:`, microphoneButtons);
    
    // Try to interact with found microphone buttons
    if (microphoneButtons.length > 0) {
      console.log('🎯 Attempting to interact with microphone buttons...');
      
      // Try clicking the first microphone button found
      try {
        const firstMicButton = page.locator('button').first();
        // Find the actual microphone button from our search
        for (let i = 0; i < allButtons.length; i++) {
          const button = allButtons[i];
          const buttonText = await button.textContent().catch(() => '');
          const ariaLabel = await button.getAttribute('aria-label').catch(() => '');
          
          if (buttonText?.toLowerCase().includes('microphone') ||
              buttonText?.toLowerCase().includes('voice') ||
              ariaLabel?.toLowerCase().includes('microphone') ||
              ariaLabel?.toLowerCase().includes('voice')) {
            
            console.log('🖱️  Clicking microphone button...');
            await button.click();
            
            // Wait for any response
            await page.waitForTimeout(2000);
            
            // Take screenshot after interaction
            await page.screenshot({ 
              path: './screenshots/after-microphone-click.png',
              fullPage: true 
            });
            console.log('📸 Screenshot after microphone interaction saved');
            break;
          }
        }
      } catch (error) {
        console.log('⚠️  Could not interact with microphone button:', error.message);
      }
    } else {
      console.log('❌ No microphone buttons found on the page');
    }
    
    // Check for any voice-related elements in the DOM
    const voiceElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const voiceRelated = [];
      
      elements.forEach(el => {
        const text = (el.textContent || '').toLowerCase();
        const className = (typeof el.className === 'string' ? el.className : '').toLowerCase();
        const id = (el.id || '').toLowerCase();
        
        if (text.includes('voice') || text.includes('microphone') ||
            className.includes('voice') || className.includes('mic') ||
            id.includes('voice') || id.includes('mic')) {
          voiceRelated.push({
            tagName: el.tagName,
            className: typeof el.className === 'string' ? el.className : '',
            id: el.id || '',
            textContent: (el.textContent || '').substring(0, 100)
          });
        }
      });
      
      return voiceRelated;
    });
    
    console.log(`Found ${voiceElements.length} voice-related elements:`, voiceElements);
    
    console.log('\n📊 Microphone Functionality Report:');
    console.log('=====================================');
    console.log(`Floating Action Buttons Found: ${microphoneFAB}`);
    console.log(`Top-Center Buttons Found: ${topMicButton}`);
    console.log(`General Microphone Buttons Found: ${anyMicButton}`);
    console.log(`Total Potential Microphone Buttons: ${microphoneButtons.length}`);
    console.log(`Voice-related DOM Elements: ${voiceElements.length}`);
    
    if (microphoneButtons.length === 0 && voiceElements.length === 0) {
      console.log('🚨 No microphone functionality detected on the page');
    } else {
      console.log('✅ Microphone functionality elements detected');
    }
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    
    // Take a screenshot of the current state for debugging
    await page.screenshot({ 
      path: './screenshots/error-state.png',
      fullPage: true 
    });
    console.log('Error state screenshot saved to: ./screenshots/error-state.png');
  } finally {
    await browser.close();
  }
}

// Import devices from playwright
import { devices } from 'playwright';

// Run the script
captureScreenshot().catch(console.error);