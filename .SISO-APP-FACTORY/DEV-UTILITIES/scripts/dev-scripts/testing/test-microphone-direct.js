import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testMicrophoneDirectly() {
  let browser;
  try {
    console.log('🚀 Starting browser with enhanced microphone permissions...');
    
    // Launch browser with all necessary permissions for microphone testing
    browser = await puppeteer.launch({
      headless: false, // Keep as false to see what's happening
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--use-fake-ui-for-media-stream', // Auto-grant microphone permissions
        '--use-fake-device-for-media-stream',
        '--allow-running-insecure-content',
        '--disable-web-security',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--autoplay-policy=no-user-gesture-required',
        '--disable-background-timer-throttling',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ]
    });

    const page = await browser.newPage();

    // Emulate iPhone 14 Pro for mobile testing
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

    // Grant all necessary permissions
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('http://localhost:5173', [
      'microphone',
      'camera',
      'notifications',
      'geolocation'
    ]);

    console.log('🎭 Creating a test page with microphone components...');
    
    // Create a test HTML page with the microphone components
    const testHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Microphone Test - LifeLock</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body {
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                color: white;
                font-family: system-ui, -apple-system, sans-serif;
                min-height: 100vh;
                padding: 20px;
            }
            
            .microphone-btn {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(45deg, #f97316, #eab308);
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(249, 115, 22, 0.3);
                transition: all 0.3s ease;
                z-index: 1000;
            }
            
            .microphone-btn:hover {
                transform: translateX(-50%) scale(1.1);
                box-shadow: 0 6px 25px rgba(249, 115, 22, 0.5);
            }
            
            .microphone-btn.listening {
                background: #ef4444;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
            
            .fab-button {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(45deg, #f97316, #eab308);
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(249, 115, 22, 0.3);
                transition: all 0.3s ease;
                z-index: 1000;
            }
            
            .fab-menu {
                position: fixed;
                bottom: 100px;
                right: 30px;
                display: flex;
                flex-direction: column;
                gap: 15px;
                z-index: 999;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }
            
            .fab-menu.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .fab-option {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .status-display {
                position: fixed;
                bottom: 120px;
                left: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 20px;
                z-index: 900;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }
            
            .status-display.show {
                opacity: 1;
                transform: translateY(0);
            }
        </style>
    </head>
    <body>
        <h1 class="text-3xl font-bold text-center mb-8 mt-20">LifeLock Microphone Test</h1>
        
        <!-- Top Microphone Button (like MobileMicrophoneButton) -->
        <button id="topMicBtn" class="microphone-btn" title="Voice Input">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                <path d="M12 18.5a0.5 0.5 0 0 1 0 1"/>
                <path d="M8 22h8"/>
            </svg>
        </button>
        
        <!-- FAB Button (like FloatingActionButton) -->
        <button id="fabBtn" class="fab-button" title="Quick Actions">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M12 5v14"/>
                <path d="M5 12h14"/>
            </svg>
        </button>
        
        <!-- FAB Menu -->
        <div id="fabMenu" class="fab-menu">
            <button id="voiceOption" class="fab-option" style="background: linear-gradient(45deg, #f97316, #eab308);" title="Voice Input">
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                    <path d="M12 18.5a0.5 0.5 0 0 1 0 1"/>
                    <path d="M8 22h8"/>
                </svg>
            </button>
            <button class="fab-option" style="background: #6b7280;" title="Add Task">
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M12 5v14"/>
                    <path d="M5 12h14"/>
                </svg>
            </button>
            <button class="fab-option" style="background: #10b981;" title="Timer">
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                </svg>
            </button>
        </div>
        
        <!-- Status Display -->
        <div id="statusDisplay" class="status-display">
            <h3 class="text-lg font-semibold mb-2">Voice Status</h3>
            <div id="statusContent">
                <div class="mb-2">
                    <span class="text-orange-300">Browser Support:</span>
                    <span id="browserSupport">Checking...</span>
                </div>
                <div class="mb-2">
                    <span class="text-orange-300">Microphone Permission:</span>
                    <span id="micPermission">Checking...</span>
                </div>
                <div class="mb-2">
                    <span class="text-orange-300">Recording Status:</span>
                    <span id="recordingStatus">Idle</span>
                </div>
                <div class="mb-2">
                    <span class="text-orange-300">Last Transcript:</span>
                    <div id="lastTranscript" class="text-gray-300 text-sm mt-1 p-2 bg-gray-800 rounded">None</div>
                </div>
                <div class="text-xs text-gray-400 mt-3">
                    Click any microphone button to test functionality
                </div>
            </div>
        </div>
        
        <!-- Info Section -->
        <div class="max-w-md mx-auto mt-20 space-y-6">
            <div class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-orange-500/20">
                <h2 class="text-xl font-semibold mb-4 text-orange-300">Test Components</h2>
                <ul class="space-y-2 text-sm">
                    <li class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Top Microphone Button (Mobile centered)</span>
                    </li>
                    <li class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Floating Action Button (Bottom right)</span>
                    </li>
                    <li class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Voice Option in FAB Menu</span>
                    </li>
                </ul>
            </div>
        </div>

        <script>
            class VoiceTestService {
                constructor() {
                    this.recognition = null;
                    this.isListening = false;
                    this.initializeSpeechRecognition();
                }

                initializeSpeechRecognition() {
                    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                        const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
                        this.recognition = new SpeechRecognitionConstructor();
                        
                        this.recognition.continuous = true;
                        this.recognition.interimResults = true;
                        this.recognition.lang = 'en-US';
                        
                        this.setupEventListeners();
                        
                        document.getElementById('browserSupport').textContent = '✅ Supported';
                        document.getElementById('browserSupport').className = 'text-green-400';
                    } else {
                        document.getElementById('browserSupport').textContent = '❌ Not Supported';
                        document.getElementById('browserSupport').className = 'text-red-400';
                    }
                }

                setupEventListeners() {
                    this.recognition.onstart = () => {
                        this.isListening = true;
                        this.updateUI();
                        document.getElementById('recordingStatus').textContent = '🎤 Recording...';
                        document.getElementById('recordingStatus').className = 'text-red-400';
                    };

                    this.recognition.onresult = (event) => {
                        let finalTranscript = '';
                        let interimTranscript = '';

                        for (let i = event.resultIndex; i < event.results.length; i++) {
                            const transcript = event.results[i][0].transcript;
                            if (event.results[i].isFinal) {
                                finalTranscript += transcript;
                            } else {
                                interimTranscript += transcript;
                            }
                        }

                        const displayTranscript = finalTranscript || interimTranscript;
                        if (displayTranscript) {
                            document.getElementById('lastTranscript').textContent = displayTranscript;
                        }
                    };

                    this.recognition.onerror = (event) => {
                        console.error('Speech recognition error:', event.error);
                        document.getElementById('recordingStatus').textContent = \`❌ Error: \${event.error}\`;
                        document.getElementById('recordingStatus').className = 'text-red-400';
                        this.isListening = false;
                        this.updateUI();
                    };

                    this.recognition.onend = () => {
                        this.isListening = false;
                        this.updateUI();
                        document.getElementById('recordingStatus').textContent = '⏹️ Stopped';
                        document.getElementById('recordingStatus').className = 'text-gray-400';
                    };
                }

                async checkMicrophonePermission() {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        stream.getTracks().forEach(track => track.stop());
                        document.getElementById('micPermission').textContent = '✅ Granted';
                        document.getElementById('micPermission').className = 'text-green-400';
                        return true;
                    } catch (error) {
                        document.getElementById('micPermission').textContent = \`❌ \${error.message}\`;
                        document.getElementById('micPermission').className = 'text-red-400';
                        return false;
                    }
                }

                async startListening() {
                    if (!this.recognition) {
                        alert('Speech recognition not supported in this browser');
                        return;
                    }

                    if (this.isListening) {
                        this.recognition.stop();
                        return;
                    }

                    const hasPermission = await this.checkMicrophonePermission();
                    if (!hasPermission) {
                        alert('Microphone permission required. Please grant permission and try again.');
                        return;
                    }

                    try {
                        this.recognition.start();
                    } catch (error) {
                        console.error('Failed to start recognition:', error);
                        alert('Failed to start voice recognition: ' + error.message);
                    }
                }

                updateUI() {
                    const topMicBtn = document.getElementById('topMicBtn');
                    const voiceOption = document.getElementById('voiceOption');
                    
                    if (this.isListening) {
                        topMicBtn.classList.add('listening');
                        voiceOption.style.background = '#ef4444';
                        voiceOption.style.animation = 'pulse 2s infinite';
                    } else {
                        topMicBtn.classList.remove('listening');
                        voiceOption.style.background = 'linear-gradient(45deg, #f97316, #eab308)';
                        voiceOption.style.animation = 'none';
                    }
                }
            }

            // Initialize voice service
            const voiceService = new VoiceTestService();

            // Check microphone permission on load
            voiceService.checkMicrophonePermission();

            // FAB functionality
            let fabMenuVisible = false;
            const fabBtn = document.getElementById('fabBtn');
            const fabMenu = document.getElementById('fabMenu');
            const statusDisplay = document.getElementById('statusDisplay');

            fabBtn.addEventListener('click', () => {
                fabMenuVisible = !fabMenuVisible;
                if (fabMenuVisible) {
                    fabMenu.classList.add('show');
                    statusDisplay.classList.add('show');
                    fabBtn.innerHTML = '<svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>';
                } else {
                    fabMenu.classList.remove('show');
                    statusDisplay.classList.remove('show');
                    fabBtn.innerHTML = '<svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
                }
            });

            // Microphone button handlers
            document.getElementById('topMicBtn').addEventListener('click', () => {
                voiceService.startListening();
            });

            document.getElementById('voiceOption').addEventListener('click', () => {
                voiceService.startListening();
                // Close FAB menu after selection
                fabMenuVisible = false;
                fabMenu.classList.remove('show');
                fabBtn.innerHTML = '<svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
            });

            // Auto-show status on mobile
            setTimeout(() => {
                if (window.innerWidth <= 768) {
                    statusDisplay.classList.add('show');
                }
            }, 2000);
        </script>
    </body>
    </html>
    `;

    // Set the HTML content directly
    await page.setContent(testHTML, { waitUntil: 'networkidle0' });

    console.log('📸 Taking initial screenshot...');
    const initialPath = path.join(__dirname, 'screenshots', 'microphone-test-initial.png');
    await page.screenshot({
      path: initialPath,
      fullPage: true
    });

    // Test microphone functionality
    console.log('🎤 Testing top microphone button...');
    await page.click('#topMicBtn');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const topMicActivePath = path.join(__dirname, 'screenshots', 'top-microphone-active.png');
    await page.screenshot({
      path: topMicActivePath,
      fullPage: true
    });

    // Test FAB functionality
    console.log('🎯 Testing FAB button...');
    await page.click('#fabBtn');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const fabOpenPath = path.join(__dirname, 'screenshots', 'fab-menu-open.png');
    await page.screenshot({
      path: fabOpenPath,
      fullPage: true
    });

    // Test voice option in FAB
    console.log('🎤 Testing voice option in FAB...');
    await page.click('#voiceOption');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const fabVoicePath = path.join(__dirname, 'screenshots', 'fab-voice-active.png');
    await page.screenshot({
      path: fabVoicePath,
      fullPage: true
    });

    // Get test results
    const testResults = await page.evaluate(() => {
      return {
        browserSupport: document.getElementById('browserSupport').textContent,
        micPermission: document.getElementById('micPermission').textContent,
        recordingStatus: document.getElementById('recordingStatus').textContent,
        speechRecognitionAvailable: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
        mediaDevicesAvailable: !!navigator.mediaDevices,
        isHTTPS: window.location.protocol === 'https:',
        userAgent: navigator.userAgent
      };
    });

    console.log('✅ Test completed successfully!');
    console.log('📊 Test Results:', testResults);
    
    return {
      screenshots: [initialPath, topMicActivePath, fabOpenPath, fabVoicePath],
      testResults
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
testMicrophoneDirectly()
  .then(result => {
    console.log('🎉 Microphone test completed!');
    console.log('📸 Screenshots saved:', result.screenshots);
    console.log('📊 Results:', result.testResults);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });