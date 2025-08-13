import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testLifeLockMicrophone() {
  let browser;
  try {
    console.log('🚀 Starting browser...');
    
    // Launch browser with mobile emulation and microphone permissions
    browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--use-fake-ui-for-media-stream', // Auto-grant microphone permissions
        '--use-fake-device-for-media-stream',
        '--allow-running-insecure-content',
        '--disable-web-security',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();

    // Emulate iPhone 14 Pro
    await page.emulate({
      name: 'iPhone 14 Pro',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      viewport: {
        width: 393,
        height: 852,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        isLandscape: false,
      },
    });

    // Grant microphone permissions
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('http://localhost:5173', ['microphone']);

    console.log('📱 Navigating to LifeLock admin page...');
    
    // Navigate to the LifeLock admin page
    await page.goto('http://localhost:5173/admin/life-lock', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Wait for page to load completely
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot in mobile view
    const screenshotPath = path.join(__dirname, 'screenshots', 'lifelock-mobile-screenshot.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log('📸 Screenshot saved to:', screenshotPath);

    // Check if microphone button is visible
    const microphoneButtons = await page.$$eval('[data-testid*="microphone"], [class*="microphone"], [class*="mic"], button:has(svg[class*="mic"])', 
      elements => elements.map(el => ({
        visible: el.offsetWidth > 0 && el.offsetHeight > 0,
        text: el.textContent?.trim() || '',
        class: el.className,
        tagName: el.tagName,
        position: {
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y,
          width: el.getBoundingClientRect().width,
          height: el.getBoundingClientRect().height
        }
      }))
    );

    console.log('🎤 Microphone buttons found:', microphoneButtons);

    // Look for Floating Action Button (FAB) specifically
    const fabButton = await page.$('div[class*="fixed"][class*="bottom"]');
    if (fabButton) {
      const fabVisible = await fabButton.evaluate(el => ({
        visible: el.offsetWidth > 0 && el.offsetHeight > 0,
        class: el.className,
        position: {
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y,
          width: el.getBoundingClientRect().width,
          height: el.getBoundingClientRect().height
        }
      }));
      console.log('🎯 FAB button details:', fabVisible);
    }

    // Try to find and click microphone button if available
    try {
      // Look for the main FAB button first
      const fabSelector = 'div[class*="fixed"][class*="bottom"] button';
      const fabExists = await page.$(fabSelector);
      
      if (fabExists) {
        console.log('🎯 Found FAB button, attempting to click...');
        await page.click(fabSelector);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Take screenshot after clicking FAB
        const fabClickedPath = path.join(__dirname, 'screenshots', 'lifelock-fab-clicked.png');
        await page.screenshot({
          path: fabClickedPath,
          fullPage: true
        });
        console.log('📸 FAB clicked screenshot saved to:', fabClickedPath);

        // Look for expanded microphone option
        const micOption = await page.$('button:has(svg[data-testid*="mic"], svg[class*="lucide-mic"])');
        if (micOption) {
          console.log('🎤 Found microphone option in FAB menu');
          await page.click('button:has(svg[data-testid*="mic"], svg[class*="lucide-mic"])');
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Take screenshot after clicking microphone
          const micClickedPath = path.join(__dirname, 'screenshots', 'lifelock-mic-activated.png');
          await page.screenshot({
            path: micClickedPath,
            fullPage: true
          });
          console.log('📸 Microphone activated screenshot saved to:', micClickedPath);
        }
      }

      // Also look for the top microphone button
      const topMicSelector = 'div[class*="fixed"][class*="top"] button';
      const topMicExists = await page.$(topMicSelector);
      
      if (topMicExists) {
        console.log('🎤 Found top microphone button');
        const topMicPath = path.join(__dirname, 'screenshots', 'lifelock-top-mic.png');
        await page.screenshot({
          path: topMicPath,
          fullPage: true
        });
        console.log('📸 Top microphone screenshot saved to:', topMicPath);

        // Click the top microphone button
        await page.click(topMicSelector);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const topMicActivePath = path.join(__dirname, 'screenshots', 'lifelock-top-mic-active.png');
        await page.screenshot({
          path: topMicActivePath,
          fullPage: true
        });
        console.log('📸 Top microphone activated screenshot saved to:', topMicActivePath);
      }

    } catch (error) {
      console.log('⚠️ Error testing microphone functionality:', error.message);
    }

    console.log('✅ Test completed successfully!');
    
    return {
      screenshotPath,
      microphoneButtons,
      fabButton: !!fabButton
    };

  } catch (error) {
    console.error('❌ Error during test:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testLifeLockMicrophone()
  .then(result => {
    console.log('🎉 Test results:', result);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });