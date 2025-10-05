// Voice Service for AI Chat
// Handles speech-to-text and text-to-speech functionality

export interface VoiceConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface TTSConfig {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private groqApiKey: string | null = null;

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY || null;
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionConstructor();
    }
  }

  private initializeSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  // Check if speech recognition is supported
  public isSpeechRecognitionSupported(): boolean {
    console.log('🔍 [VOICE AI] Checking speech recognition support...');
    console.log('🌐 [VOICE AI] User agent:', navigator.userAgent);
    console.log('🔒 [VOICE AI] Is HTTPS:', window.location.protocol === 'https:');
    console.log('🏠 [VOICE AI] Is localhost:', window.location.hostname === 'localhost');
    console.log('🌍 [VOICE AI] Current URL:', window.location.href);
    
    // Check for secure context requirement
    const isSecureContext = window.location.protocol === 'https:' || 
                          window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
    
    if (!isSecureContext) {
      console.error('❌ [VOICE AI] Voice recognition requires HTTPS or localhost');
      console.error('🔧 [VOICE AI] Current protocol:', window.location.protocol);
      console.error('💡 [VOICE AI] Solution: Use https:// or access via localhost');
    }
    
    if (!this.recognition) {
      console.error('❌ [VOICE AI] Speech recognition not available');
      return false;
    }
    
    console.log('✅ [VOICE AI] Speech recognition is available');
    return true && isSecureContext;
  }

  // Check microphone permissions with fallback methods
  public async checkMicrophonePermissions(): Promise<boolean> {
    console.log('🎤 [VOICE AI] Checking microphone permissions...');
    
    // Method 1: Try Permissions API first (most reliable)
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log('🔍 [VOICE AI] Permissions API result:', permissionStatus.state);
        
        if (permissionStatus.state === 'granted') {
          console.log('✅ [VOICE AI] Microphone permission already granted via Permissions API');
          return true;
        } else if (permissionStatus.state === 'denied') {
          console.log('❌ [VOICE AI] Microphone permission explicitly denied');
          return false;
        }
        // If 'prompt', continue to getUserMedia method
      } catch (error) {
        console.warn('⚠️ [VOICE AI] Permissions API failed, trying getUserMedia:', error);
      }
    }

    // Method 2: Try getUserMedia (fallback)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ [VOICE AI] MediaDevices API not supported');
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      console.log('✅ [VOICE AI] Microphone access granted via getUserMedia');
      
      // Clean up the stream immediately
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 [VOICE AI] Cleaned up media track:', track.kind);
      });
      return true;
    } catch (error: any) {
      console.error('❌ [VOICE AI] getUserMedia failed:', error);
      console.error('❌ [VOICE AI] Error details:', {
        name: error.name,
        message: error.message,
        constraint: error.constraint
      });
      return false;
    }
  }

  // Check if text-to-speech is supported
  public isTTSSupported(): boolean {
    return this.synthesis !== null || this.groqApiKey !== null;
  }

  // Start listening for speech input
  public async startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    config: VoiceConfig = {}
  ): Promise<void> {
    console.log('🎤 [VOICE AI] Starting speech recognition...');
    console.log('🎤 [VOICE AI] Config:', { 
      language: config.language || 'en-US',
      continuous: config.continuous || false,
      interimResults: config.interimResults || true,
      maxAlternatives: config.maxAlternatives || 1 
    });

    // Check if speech recognition is supported
    if (!this.isSpeechRecognitionSupported()) {
      const error = 'Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.';
      console.error('❌ [VOICE AI] Recognition not supported:', error);
      onError(error);
      throw new Error(error);
    }

    // Check if already listening
    if (this.isListening) {
      const error = 'Already listening';
      console.warn('⚠️ [VOICE AI] Already listening:', error);
      onError(error);
      throw new Error(error);
    }

    // Check microphone permissions (but don't fail immediately - let SpeechRecognition handle it)
    try {
      const hasPermission = await this.checkMicrophonePermissions();
      if (!hasPermission) {
        console.warn('⚠️ [VOICE AI] Microphone permission check failed, but continuing with SpeechRecognition API...');
        // Don't throw error here - let the SpeechRecognition API handle permission requests
      } else {
        console.log('✅ [VOICE AI] Microphone permission verified');
      }
    } catch (permissionError) {
      console.warn('⚠️ [VOICE AI] Permission check failed, proceeding with SpeechRecognition:', permissionError);
      // Continue anyway - SpeechRecognition might handle permissions differently
    }

    return new Promise((resolve, reject) => {

      // Configure recognition - Enable continuous mode for longer recordings
      this.recognition.lang = config.language || 'en-US';
      this.recognition.continuous = config.continuous !== undefined ? config.continuous : true; // Default to continuous
      this.recognition.interimResults = config.interimResults || true;
      this.recognition.maxAlternatives = config.maxAlternatives || 1;

      // Set up event handlers
      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('✅ [VOICE AI] Speech recognition started successfully');
        console.log('🎯 [VOICE AI] Listening state:', this.isListening);
        resolve();
      };

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        console.log('📝 [VOICE AI] Processing speech results...');
        console.log('📊 [VOICE AI] Results count:', event.results.length);
        console.log('📍 [VOICE AI] Result index:', event.resultIndex);

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          const isFinal = event.results[i].isFinal;
          
          console.log(`📋 [VOICE AI] Result ${i}:`, {
            transcript,
            confidence,
            isFinal,
            alternatives: event.results[i].length
          });

          if (isFinal) {
            finalTranscript += transcript;
            console.log('✅ [VOICE AI] Final transcript:', finalTranscript);
          } else {
            interimTranscript += transcript;
            console.log('⏳ [VOICE AI] Interim transcript:', interimTranscript);
          }
        }

        if (finalTranscript) {
          console.log('🎯 [VOICE AI] Sending final result:', finalTranscript);
          onResult(finalTranscript, true);
        } else if (interimTranscript) {
          console.log('📝 [VOICE AI] Sending interim result:', interimTranscript);
          onResult(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        let errorMsg = '';
        
        switch (event.error) {
          case 'no-speech':
            errorMsg = 'No speech detected. Please try speaking again.';
            console.warn('⚠️ [VOICE AI] No speech detected');
            break;
          case 'audio-capture':
            errorMsg = 'No microphone found. Please check your microphone connection.';
            console.error('❌ [VOICE AI] Audio capture failed');
            break;
          case 'not-allowed':
            errorMsg = 'Microphone access denied. Click the microphone icon 🎤 in your browser address bar and select "Allow", then try again.';
            console.error('❌ [VOICE AI] Permission denied - browser blocked microphone access');
            // Try to provide more context about the permission state
            this.logPermissionDiagnostics();
            break;
          case 'network':
            errorMsg = 'Network error occurred. Please check your internet connection.';
            console.error('❌ [VOICE AI] Network error');
            break;
          case 'aborted':
            errorMsg = 'Speech recognition was aborted.';
            console.warn('⚠️ [VOICE AI] Recognition aborted');
            break;
          case 'bad-grammar':
            errorMsg = 'Grammar error in speech recognition.';
            console.error('❌ [VOICE AI] Grammar error');
            break;
          case 'language-not-supported':
            errorMsg = 'Language not supported. Please try English.';
            console.error('❌ [VOICE AI] Language not supported');
            break;
          default:
            errorMsg = `Speech recognition error: ${event.error}`;
            console.error('❌ [VOICE AI] Unknown error:', event.error);
        }
        
        console.error('❌ [VOICE AI] Recognition error details:', {
          error: event.error,
          message: event.message,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        });
        
        onError(errorMsg);
        reject(new Error(errorMsg));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('🔚 [VOICE AI] Speech recognition ended');
        console.log('🎯 [VOICE AI] Final listening state:', this.isListening);
      };

      // Start recognition
      try {
        console.log('🚀 [VOICE AI] Attempting to start recognition...');
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        console.error('❌ [VOICE AI] Failed to start recognition:', error);
        reject(error);
      }
    });
  }

  // Stop listening
  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Check if currently listening
  public getIsListening(): boolean {
    return this.isListening;
  }

  // Speak text using available TTS
  public async speak(
    text: string,
    config: TTSConfig = {},
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    console.log('🔊 [VOICE AI] TTS Request initiated');
    console.log('📄 [VOICE AI] Text to speak:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    console.log('⚙️ [VOICE AI] TTS Config:', config);
    console.log('🔑 [VOICE AI] Groq API available:', !!this.groqApiKey);

    try {
      if (this.groqApiKey && text.length <= 10000) {
        console.log('🌟 [VOICE AI] Using Groq TTS (Premium)');
        await this.speakWithGroqTTS(text, config, onStart, onEnd, onError);
      } else {
        console.log('🔄 [VOICE AI] Using Web Speech API (Fallback)');
        if (!this.groqApiKey) {
          console.warn('⚠️ [VOICE AI] No Groq API key configured');
        }
        if (text.length > 10000) {
          console.warn('⚠️ [VOICE AI] Text too long for Groq TTS:', text.length);
        }
        await this.speakWithWebAPI(text, config, onStart, onEnd, onError);
      }
    } catch (error) {
      console.error('❌ [VOICE AI] TTS failed, falling back to Web Speech API:', error);
      try {
        await this.speakWithWebAPI(text, config, onStart, onEnd, onError);
      } catch (fallbackError) {
        console.error('❌ [VOICE AI] All TTS methods failed:', fallbackError);
        onError?.(fallbackError instanceof Error ? fallbackError.message : 'TTS failed');
        throw fallbackError;
      }
    }
  }

  // Speak using Groq TTS API
  private async speakWithGroqTTS(
    text: string,
    config: TTSConfig = {},
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    console.log('🌟 [VOICE AI] Groq TTS Starting...');
    console.log('📊 [VOICE AI] Request details:', {
      textLength: text.length,
      voice: config.voice || 'Fritz-PlayAI',
      model: 'playai-tts',
      apiKeyPresent: !!this.groqApiKey
    });

    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      onStart?.();
      console.log('🚀 [VOICE AI] Calling Groq TTS API...');

      const requestBody = {
        model: 'playai-tts',
        input: text.substring(0, 10000), // Groq TTS limit
        voice: config.voice || 'Fritz-PlayAI',
        response_format: 'mp3'
      };

      console.log('📝 [VOICE AI] API Request:', requestBody);

      const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 [VOICE AI] API Response status:', response.status);
      console.log('📋 [VOICE AI] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [VOICE AI] Groq API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Groq TTS API error: ${response.statusText}`);
      }

      console.log('✅ [VOICE AI] Groq TTS API success');
      const audioBlob = await response.blob();
      console.log('🎵 [VOICE AI] Audio blob created:', {
        size: audioBlob.size,
        type: audioBlob.type
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      console.log('🎧 [VOICE AI] Audio element created, starting playback...');

      audio.onended = () => {
        console.log('🏁 [VOICE AI] Groq TTS playback completed');
        URL.revokeObjectURL(audioUrl);
        onEnd?.();
      };

      audio.onerror = () => {
        console.error('❌ [VOICE AI] Audio playback failed');
        URL.revokeObjectURL(audioUrl);
        onError?.('Audio playback failed');
      };

      await audio.play();
      console.log('▶️ [VOICE AI] Groq TTS playback started successfully');

    } catch (error) {
      console.error('❌ [VOICE AI] Groq TTS Error:', error);
      onError?.(error instanceof Error ? error.message : 'TTS failed');
      throw error;
    }
  }

  // Speak using Web Speech API
  private async speakWithWebAPI(
    text: string,
    config: TTSConfig = {},
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    console.log('🔄 [VOICE AI] Web Speech API TTS Starting...');
    console.log('📊 [VOICE AI] Web API details:', {
      textLength: text.length,
      rate: config.rate || 1,
      pitch: config.pitch || 1,
      volume: config.volume || 1,
      voice: config.voice || 'default'
    });

    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        const error = 'Text-to-speech not supported';
        console.error('❌ [VOICE AI] Web Speech API not supported:', error);
        onError?.(error);
        reject(new Error(error));
        return;
      }

      // Cancel any ongoing speech
      console.log('🛑 [VOICE AI] Canceling any existing speech...');
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure utterance
      utterance.rate = config.rate || 1;
      utterance.pitch = config.pitch || 1;
      utterance.volume = config.volume || 1;

      console.log('⚙️ [VOICE AI] Utterance configured:', {
        rate: utterance.rate,
        pitch: utterance.pitch,
        volume: utterance.volume
      });

      // Set voice if specified
      if (config.voice) {
        const voices = this.synthesis.getVoices();
        console.log('🎭 [VOICE AI] Available voices:', voices.length);
        const selectedVoice = voices.find(voice => 
          voice.name.includes(config.voice!) || voice.lang.includes(config.voice!)
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('✅ [VOICE AI] Voice selected:', {
            name: selectedVoice.name,
            lang: selectedVoice.lang,
            gender: selectedVoice.gender
          });
        } else {
          console.warn('⚠️ [VOICE AI] Requested voice not found:', config.voice);
        }
      }

      utterance.onstart = () => {
        console.log('▶️ [VOICE AI] Web Speech API playback started');
        onStart?.();
      };

      utterance.onend = () => {
        console.log('🏁 [VOICE AI] Web Speech API playback completed');
        onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        const error = `Speech synthesis error: ${event.error}`;
        console.error('❌ [VOICE AI] Web Speech API Error:', {
          error: event.error,
          message: event.message,
          timestamp: new Date().toISOString()
        });
        onError?.(error);
        reject(new Error(error));
      };

      console.log('🚀 [VOICE AI] Starting Web Speech API synthesis...');
      this.synthesis.speak(utterance);
    });
  }

  // Stop current speech
  public stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Get available voices for Web Speech API
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  // Get Groq TTS voices
  public getGroqVoices(): string[] {
    return [
      'Arista-PlayAI', 'Atlas-PlayAI', 'Basil-PlayAI', 'Briggs-PlayAI',
      'Calum-PlayAI', 'Celeste-PlayAI', 'Cheyenne-PlayAI', 'Chip-PlayAI',
      'Cillian-PlayAI', 'Deedee-PlayAI', 'Fritz-PlayAI', 'Gail-PlayAI',
      'Indigo-PlayAI', 'Mamaw-PlayAI', 'Mason-PlayAI', 'Mikail-PlayAI',
      'Mitch-PlayAI', 'Quinn-PlayAI', 'Thunder-PlayAI'
    ];
  }

  // Log detailed permission diagnostics
  private async logPermissionDiagnostics(): Promise<void> {
    console.log('🔍 [VOICE AI] === PERMISSION DIAGNOSTICS ===');
    
    // Check basic browser support
    const diagnostics = {
      speechRecognition: !!window.SpeechRecognition || !!window.webkitSpeechRecognition,
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!navigator.mediaDevices?.getUserMedia,
      permissions: !!navigator.permissions,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      userAgent: navigator.userAgent.substring(0, 100)
    };
    
    console.log('🌐 [VOICE AI] Browser capabilities:', diagnostics);
    
    // Check permission state if Permissions API is available
    if (navigator.permissions) {
      try {
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log('🎤 [VOICE AI] Microphone permission state:', micPermission.state);
      } catch (error) {
        console.log('❌ [VOICE AI] Could not query microphone permission:', error);
      }
    }
    
    console.log('🔍 [VOICE AI] === END DIAGNOSTICS ===');
  }

  // Chrome-specific permission bypass
  public async forceChromeMicrophoneAccess(): Promise<boolean> {
    console.log('🔧 [VOICE AI] Attempting Chrome-specific microphone bypass...');
    
    // Strategy 1: Multiple rapid getUserMedia calls (Chrome quirk)
    for (let i = 0; i < 3; i++) {
      try {
        console.log(`🔄 [VOICE AI] Chrome bypass attempt ${i + 1}/3`);
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            autoGainControl: false,
            echoCancellation: false,
            noiseSuppression: false
          }
        });
        stream.getTracks().forEach(track => track.stop());
        console.log('✅ [VOICE AI] Chrome bypass successful!');
        return true;
      } catch (error) {
        console.log(`❌ [VOICE AI] Chrome bypass attempt ${i + 1} failed:`, error);
        await new Promise(resolve => setTimeout(resolve, 100)); // Brief delay
      }
    }
    
    // Strategy 2: Try with video=false explicitly (Chrome requirement)
    try {
      console.log('🔄 [VOICE AI] Trying Chrome video=false strategy...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      });
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ [VOICE AI] Chrome video=false strategy successful!');
      return true;
    } catch (error) {
      console.log('❌ [VOICE AI] Chrome video=false strategy failed:', error);
    }
    
    return false;
  }

  // Retry microphone access with different strategies
  public async retryMicrophoneAccess(): Promise<boolean> {
    console.log('🔄 [VOICE AI] Retrying microphone access...');
    
    // First try Chrome-specific bypass
    const chromeSuccess = await this.forceChromeMicrophoneAccess();
    if (chromeSuccess) return true;
    
    // Strategy 1: Simple getUserMedia with minimal constraints
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ [VOICE AI] Retry successful with basic constraints');
      return true;
    } catch (error) {
      console.log('❌ [VOICE AI] Basic retry failed:', error);
    }
    
    // Strategy 2: Try with different audio constraints
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 44100,
          sampleSize: 16,
          channelCount: 1
        } 
      });
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ [VOICE AI] Retry successful with specific constraints');
      return true;
    } catch (error) {
      console.log('❌ [VOICE AI] Specific constraints retry failed:', error);
    }
    
    return false;
  }

  // Debug helper for console testing
  public async debugMicrophoneAccess(): Promise<void> {
    console.log('🔧 [VOICE AI] === MICROPHONE DEBUG TEST ===');
    
    // Test 1: Check browser capabilities
    await this.logPermissionDiagnostics();
    
    // Test 2: Try permission check
    console.log('🧪 [VOICE AI] Testing permission check...');
    try {
      const hasPermission = await this.checkMicrophonePermissions();
      console.log('🎤 [VOICE AI] Permission check result:', hasPermission ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.log('❌ [VOICE AI] Permission check error:', error);
    }
    
    // Test 3: Try speech recognition initialization
    console.log('🧪 [VOICE AI] Testing speech recognition...');
    const speechSupported = this.isSpeechRecognitionSupported();
    console.log('🎙️ [VOICE AI] Speech recognition supported:', speechSupported);
    
    // Test 4: Try retry mechanism
    console.log('🧪 [VOICE AI] Testing retry mechanism...');
    try {
      const retryResult = await this.retryMicrophoneAccess();
      console.log('🔄 [VOICE AI] Retry result:', retryResult ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.log('❌ [VOICE AI] Retry error:', error);
    }
    
    console.log('🔧 [VOICE AI] === DEBUG TEST COMPLETE ===');
    console.log('📋 [VOICE AI] To run this test, open browser console and run: voiceService.debugMicrophoneAccess()');
  }

  // Clean up resources
  public cleanup(): void {
    this.stopListening();
    this.stopSpeaking();
  }
}

// Global voice service instance
export const voiceService = new VoiceService();

// Make voice service available globally for debugging in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).voiceService = voiceService;
  console.log('🔧 [VOICE AI] Voice service available globally as window.voiceService');
  console.log('🧪 [VOICE AI] Run voiceService.debugMicrophoneAccess() in console to test');
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new() => SpeechRecognition;
    webkitSpeechRecognition: new() => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
} 