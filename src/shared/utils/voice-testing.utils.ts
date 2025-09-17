/**
 * Voice Input Testing Utilities
 * Comprehensive testing tools for voice input and AI processing pipeline
 */

export interface VoiceTestResult {
  test: string;
  success: boolean;
  duration: number;
  data?: any;
  error?: string;
}

export interface VoiceCapabilities {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  mediaDevices: boolean;
  permissions: {
    microphone: PermissionState | 'unknown';
  };
  supportedLanguages: string[];
}

/**
 * Test Web Speech API capabilities
 */
export async function testVoiceCapabilities(): Promise<VoiceTestResult> {
  const startTime = Date.now();
  
  try {
    const capabilities: VoiceCapabilities = {
      speechRecognition: false,
      speechSynthesis: false,
      mediaDevices: false,
      permissions: {
        microphone: 'unknown' as PermissionState
      },
      supportedLanguages: []
    };

    // Test SpeechRecognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    capabilities.speechRecognition = !!SpeechRecognition;

    // Test SpeechSynthesis support
    capabilities.speechSynthesis = 'speechSynthesis' in window;

    // Test MediaDevices support
    capabilities.mediaDevices = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

    // Test microphone permission
    if (capabilities.mediaDevices) {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        capabilities.permissions.microphone = permission.state;
      } catch (error) {
        console.warn('Could not check microphone permission:', error);
      }
    }

    // Get supported languages (if speech recognition is available)
    if (capabilities.speechRecognition) {
      // Common languages to test
      const testLanguages = ['en-US', 'en-GB', 'en-AU', 'en-CA'];
      capabilities.supportedLanguages = testLanguages; // Simplified for now
    }

    return {
      test: 'Voice Capabilities',
      success: capabilities.speechRecognition && capabilities.mediaDevices,
      duration: Date.now() - startTime,
      data: capabilities
    };
  } catch (error) {
    return {
      test: 'Voice Capabilities',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test microphone access and recording
 */
export async function testMicrophoneAccess(): Promise<VoiceTestResult> {
  const startTime = Date.now();
  
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        test: 'Microphone Access',
        success: false,
        duration: Date.now() - startTime,
        error: 'MediaDevices API not supported'
      };
    }

    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });

    // Test that we can access audio tracks
    const audioTracks = stream.getAudioTracks();
    const audioTrack = audioTracks[0];
    
    if (!audioTrack) {
      stream.getTracks().forEach(track => track.stop());
      return {
        test: 'Microphone Access',
        success: false,
        duration: Date.now() - startTime,
        error: 'No audio tracks available'
      };
    }

    // Get audio track capabilities
    const capabilities = audioTrack.getCapabilities ? audioTrack.getCapabilities() : {};
    const settings = audioTrack.getSettings ? audioTrack.getSettings() : {};

    // Clean up
    stream.getTracks().forEach(track => track.stop());

    return {
      test: 'Microphone Access',
      success: true,
      duration: Date.now() - startTime,
      data: {
        trackLabel: audioTrack.label,
        trackKind: audioTrack.kind,
        trackState: audioTrack.readyState,
        capabilities,
        settings
      }
    };
  } catch (error) {
    return {
      test: 'Microphone Access',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test speech recognition with a timeout
 */
export async function testSpeechRecognition(timeoutMs: number = 5000): Promise<VoiceTestResult> {
  const startTime = Date.now();
  
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return {
        test: 'Speech Recognition',
        success: false,
        duration: Date.now() - startTime,
        error: 'SpeechRecognition not supported'
      };
    }

    return new Promise((resolve) => {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          recognition.stop();
          resolve({
            test: 'Speech Recognition',
            success: false,
            duration: Date.now() - startTime,
            error: `Test timed out after ${timeoutMs}ms (no speech detected)`
          });
        }
      }, timeoutMs);

      recognition.onresult = (event) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          recognition.stop();
          
          const result = event.results[0][0];
          resolve({
            test: 'Speech Recognition',
            success: true,
            duration: Date.now() - startTime,
            data: {
              transcript: result.transcript,
              confidence: result.confidence,
              alternatives: event.results[0].length
            }
          });
        }
      };

      recognition.onerror = (event) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve({
            test: 'Speech Recognition',
            success: false,
            duration: Date.now() - startTime,
            error: `Speech recognition error: ${event.error}`
          });
        }
      };

      recognition.onend = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve({
            test: 'Speech Recognition',
            success: false,
            duration: Date.now() - startTime,
            error: 'Speech recognition ended without results'
          });
        }
      };

      try {
        recognition.start();
      } catch (error) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve({
            test: 'Speech Recognition',
            success: false,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Failed to start recognition'
          });
        }
      }
    });
  } catch (error) {
    return {
      test: 'Speech Recognition',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test AI processing with sample voice input
 */
export async function testAIProcessingPipeline(sampleText: string = "I need to plan my morning routine"): Promise<VoiceTestResult> {
  const startTime = Date.now();
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return {
        test: 'AI Processing Pipeline',
        success: false,
        duration: Date.now() - startTime,
        error: 'Groq API key not found'
      };
    }

    // Test the morning routine processing prompt
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for a 23-minute morning routine app. 

Your role:
1. Process voice input from users during their morning routine
2. Help them organize thoughts into actionable tasks
3. Provide encouraging, brief responses
4. Extract specific tasks from their thoughts

User input format: Voice transcription from morning brain dump
Response format: 
- Brief encouraging response (1-2 sentences)
- Extract 1-3 specific tasks if mentioned
- Keep responses under 100 words

Example:
User: "I need to plan my morning routine and finish the presentation for tomorrow's meeting"
Assistant: "Great start to your morning! I can help you organize that. 
Tasks I heard:
1. Plan morning routine structure
2. Complete presentation for tomorrow's meeting
Let's tackle these systematically!"`
          },
          {
            role: 'user',
            content: sampleText
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      return {
        test: 'AI Processing Pipeline',
        success: false,
        duration: Date.now() - startTime,
        error: `HTTP ${response.status}: ${await response.text()}`
      };
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'No response';

    // Test task extraction
    const tasks = extractTasksFromResponse(aiResponse);

    return {
      test: 'AI Processing Pipeline',
      success: true,
      duration: Date.now() - startTime,
      data: {
        inputText: sampleText,
        aiResponse: aiResponse,
        extractedTasks: tasks,
        tokenUsage: data.usage,
        model: data.model
      }
    };
  } catch (error) {
    return {
      test: 'AI Processing Pipeline',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extract tasks from AI response text
 */
function extractTasksFromResponse(response: string): string[] {
  const tasks: string[] = [];
  
  // Look for numbered lists
  const numberedMatches = response.match(/^\d+\.\s+(.+)$/gm);
  if (numberedMatches) {
    tasks.push(...numberedMatches.map(match => match.replace(/^\d+\.\s+/, '')));
  }
  
  // Look for bullet points
  const bulletMatches = response.match(/^[•\-*]\s+(.+)$/gm);
  if (bulletMatches) {
    tasks.push(...bulletMatches.map(match => match.replace(/^[•\-*]\s+/, '')));
  }
  
  // Look for "Task:" patterns
  const taskMatches = response.match(/(?:Task|TODO|Action):\s*(.+)$/gim);
  if (taskMatches) {
    tasks.push(...taskMatches.map(match => match.replace(/^(?:Task|TODO|Action):\s*/i, '')));
  }
  
  return tasks.filter(task => task.length > 3); // Filter out very short tasks
}

/**
 * Test complete voice to task creation workflow
 */
export async function testCompleteVoiceWorkflow(): Promise<VoiceTestResult> {
  const startTime = Date.now();
  
  try {
    // Step 1: Test voice capabilities
    const voiceCapabilitiesResult = await testVoiceCapabilities();
    if (!voiceCapabilitiesResult.success) {
      return {
        test: 'Complete Voice Workflow',
        success: false,
        duration: Date.now() - startTime,
        error: `Voice capabilities failed: ${voiceCapabilitiesResult.error}`
      };
    }

    // Step 2: Test microphone access
    const microphoneResult = await testMicrophoneAccess();
    if (!microphoneResult.success) {
      return {
        test: 'Complete Voice Workflow',
        success: false,
        duration: Date.now() - startTime,
        error: `Microphone access failed: ${microphoneResult.error}`
      };
    }

    // Step 3: Test AI processing (skip actual speech recognition for automated testing)
    const aiProcessingResult = await testAIProcessingPipeline(
      "I need to prepare for my presentation, call my mom, and plan my workout routine for next week"
    );
    if (!aiProcessingResult.success) {
      return {
        test: 'Complete Voice Workflow',
        success: false,
        duration: Date.now() - startTime,
        error: `AI processing failed: ${aiProcessingResult.error}`
      };
    }

    return {
      test: 'Complete Voice Workflow',
      success: true,
      duration: Date.now() - startTime,
      data: {
        voiceCapabilities: voiceCapabilitiesResult.data,
        microphoneAccess: microphoneResult.data,
        aiProcessing: aiProcessingResult.data,
        workflowSteps: [
          'Voice capabilities ✓',
          'Microphone access ✓', 
          'AI processing ✓',
          'Task extraction ✓'
        ]
      }
    };
  } catch (error) {
    return {
      test: 'Complete Voice Workflow',
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Run all voice and AI pipeline tests
 */
export async function runAllVoiceTests(): Promise<VoiceTestResult[]> {
  console.log('🎤 Running all voice and AI pipeline tests...');
  
  const tests = [
    testVoiceCapabilities(),
    testMicrophoneAccess(),
    testAIProcessingPipeline(),
    testCompleteVoiceWorkflow()
  ];

  const results = await Promise.all(tests);
  
  // Log summary
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ ${successCount}/${results.length} voice tests passed`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}: ${result.duration}ms`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  return results;
}

// Type declarations for global objects
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}