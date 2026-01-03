// Voice Service for AI Chat
// Handles speech-to-text and text-to-speech functionality

import { logger } from '@/lib/utils/logger';
import { deepgramService } from './deepgram.service';

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
  private openaiApiKey: string | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentStream: MediaStream | null = null;
  private currentAudio: HTMLAudioElement | null = null; // Track active TTS audio
  private currentUtterance: SpeechSynthesisUtterance | null = null; // Track Web Speech TTS

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY || null;
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || null;

    logger.debug('🔑 [VOICE AI] API Keys loaded:', {
      groq: !!this.groqApiKey,
      openai: !!this.openaiApiKey
    });
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
    logger.debug('🔍 [VOICE AI] Checking speech recognition support...');
    logger.debug('🌐 [VOICE AI] User agent:', navigator.userAgent);
    logger.debug('🔒 [VOICE AI] Is HTTPS:', window.location.protocol === 'https:');
    logger.debug('🏠 [VOICE AI] Is localhost:', window.location.hostname === 'localhost');
    logger.debug('🌍 [VOICE AI] Current URL:', window.location.href);
    
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
    
    logger.debug('✅ [VOICE AI] Speech recognition is available');
    return isSecureContext;
  }

  // Check microphone permissions with fallback methods
  public async checkMicrophonePermissions(): Promise<boolean> {
    logger.debug('🎤 [VOICE AI] Checking microphone permissions...');
    
    // Method 1: Try Permissions API first (most reliable)
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        logger.debug('🔍 [VOICE AI] Permissions API result:', permissionStatus.state);
        
        if (permissionStatus.state === 'granted') {
          logger.debug('✅ [VOICE AI] Microphone permission already granted via Permissions API');
          return true;
        } else if (permissionStatus.state === 'denied') {
          logger.debug('❌ [VOICE AI] Microphone permission explicitly denied');
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
      logger.debug('✅ [VOICE AI] Microphone access granted via getUserMedia');
      
      // Clean up the stream immediately
      stream.getTracks().forEach(track => {
        track.stop();
        logger.debug('🛑 [VOICE AI] Cleaned up media track:', track.kind);
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

  // Start listening for speech input - REAL-TIME with Deepgram!
  public async startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    config: VoiceConfig = {}
  ): Promise<void> {
    logger.debug('🎤 [VOICE AI] Starting speech recognition...');

    // Check if already listening
    if (this.isListening) {
      const error = 'Already listening';
      console.warn('⚠️ [VOICE AI] Already listening:', error);
      onError(error);
      throw new Error(error);
    }

    // Priority: Deepgram (real-time) > Web Speech API (fallback)
    if (deepgramService.isConfigured()) {
      logger.debug('🌟 [VOICE AI] Using Deepgram Real-Time (Premium - WebSocket streaming)');
      console.log('📊 [VOICE AI] Deepgram configured:', {
        isConfigured: deepgramService.isConfigured(),
        currentlyListening: this.isListening
      });

      try {
        this.isListening = true;
        console.log('✅ [VOICE AI] Set isListening = true, about to start Deepgram...');
        await deepgramService.startRealTimeTranscription(
          onResult,
          (error) => {
            this.isListening = false;
            onError(error);
          },
          {
            language: config.language || 'en-US',
            punctuate: true,
            interimResults: true,
            endpointing: 300 // 300ms silence before finalizing
          }
        );
        return;
      } catch (error) {
        this.isListening = false;
        console.warn('⚠️ [VOICE AI] Deepgram failed, falling back to Web Speech API:', error);
      }
    }

    // Fallback to Web Speech API
    logger.debug('🔄 [VOICE AI] Using Web Speech API (Fallback)');
    if (!deepgramService.isConfigured()) {
      console.warn('⚠️ [VOICE AI] No Deepgram key - using Web Speech API. For better accuracy, add VITE_DEEPGRAM_API_KEY');
    }
    return this.startListeningWithWebAPI(onResult, onError, config);
  }

  // Whisper-based speech recognition (OpenAI)
  private async startListeningWithWhisper(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    config: VoiceConfig = {}
  ): Promise<void> {
    try {
      // Get microphone access
      this.currentStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioChunks = [];

      // Force WebM format
      const options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else {
        options.mimeType = 'audio/webm';
      }

      this.mediaRecorder = new MediaRecorder(this.currentStream, options);
      logger.debug('🎵 [VOICE AI] Using audio format:', options.mimeType);

      // ACCUMULATE chunks - don't send until user stops
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          logger.debug('🎵 [VOICE AI] Audio chunk collected:', event.data.size, 'bytes', `(total: ${this.audioChunks.length} chunks)`);
        }
      };

      // When recording stops, send COMPLETE audio file to Whisper
      this.mediaRecorder.onstop = async () => {
        logger.debug('🛑 [VOICE AI] Recording stopped, processing complete audio...');

        if (this.audioChunks.length === 0) {
          logger.debug('⚠️ [VOICE AI] No audio chunks to process');
          return;
        }

        try {
          // Combine all chunks into complete audio file
          const audioBlob = new Blob(this.audioChunks, { type: options.mimeType });
          logger.debug('🎵 [VOICE AI] Complete audio file created:', audioBlob.size, 'bytes');

          // Send complete file to Whisper
          const transcript = await this.transcribeWithWhisper(audioBlob);
          if (transcript && transcript.trim()) {
            onResult(transcript.trim(), true); // Mark as final
          }
        } catch (error) {
          console.error('❌ [VOICE AI] Whisper transcription error:', error);
          onError(error instanceof Error ? error.message : 'Transcription failed');
        }
      };

      // Collect audio in continuous stream (don't create chunks until stopped)
      this.mediaRecorder.start();
      this.isListening = true;

      logger.debug('✅ [VOICE AI] Whisper recording started - speak then click Stop');

    } catch (error) {
      this.isListening = false;
      console.error('❌ [VOICE AI] Failed to start Whisper recording:', error);
      onError(error instanceof Error ? error.message : 'Microphone access failed');
      throw error;
    }
  }

  // Groq Whisper API transcription
  private async startListeningWithGroqWhisper(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    config: VoiceConfig = {}
  ): Promise<void> {
    try {
      this.currentStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioChunks = [];

      // Force WebM format
      const options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else {
        options.mimeType = 'audio/webm';
      }

      this.mediaRecorder = new MediaRecorder(this.currentStream, options);
      logger.debug('🎵 [VOICE AI] Using audio format:', options.mimeType);

      // ACCUMULATE chunks - don't send until user stops
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          logger.debug('🎵 [VOICE AI] Audio chunk collected:', event.data.size, 'bytes');
        }
      };

      // When recording stops, send COMPLETE audio file
      this.mediaRecorder.onstop = async () => {
        logger.debug('🛑 [VOICE AI] Recording stopped, processing complete audio...');

        if (this.audioChunks.length === 0) return;

        try {
          const audioBlob = new Blob(this.audioChunks, { type: options.mimeType });
          logger.debug('🎵 [VOICE AI] Complete audio file created:', audioBlob.size, 'bytes');

          const transcript = await this.transcribeWithGroqWhisper(audioBlob);
          if (transcript && transcript.trim()) {
            onResult(transcript.trim(), true);
          }
        } catch (error) {
          console.error('❌ [VOICE AI] Groq Whisper error:', error);
          onError(error instanceof Error ? error.message : 'Transcription failed');
        }
      };

      this.mediaRecorder.start();
      this.isListening = true;

      logger.debug('✅ [VOICE AI] Groq Whisper recording started');
    } catch (error) {
      this.isListening = false;
      console.error('❌ [VOICE AI] Failed to start Groq Whisper:', error);
      onError(error instanceof Error ? error.message : 'Microphone access failed');
      throw error;
    }
  }

  // OpenAI Whisper transcription
  private async transcribeWithWhisper(audioBlob: Blob): Promise<string | null> {
    if (!this.openaiApiKey) return null;

    try {
      // Determine file extension - WebM is now standard
      const mimeType = audioBlob.type;
      let fileExtension = 'webm';
      if (mimeType.includes('webm')) fileExtension = 'webm';
      else if (mimeType.includes('ogg')) fileExtension = 'ogg';
      else if (mimeType.includes('wav')) fileExtension = 'wav';
      else if (mimeType.includes('mp3')) fileExtension = 'mp3';

      const formData = new FormData();
      formData.append('file', audioBlob, `audio.${fileExtension}`);
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');

      logger.debug('🎤 [VOICE AI] Sending to OpenAI Whisper:', {
        size: audioBlob.size,
        type: audioBlob.type,
        filename: `audio.${fileExtension}`
      });

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.debug('❌ [VOICE AI] Whisper API error response:', errorText);
        throw new Error(`Whisper API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      logger.debug('✅ [VOICE AI] Whisper transcript:', result.text);
      return result.text;
    } catch (error) {
      console.error('❌ [VOICE AI] Whisper API failed:', error);
      return null;
    }
  }

  // Groq Whisper transcription
  private async transcribeWithGroqWhisper(audioBlob: Blob): Promise<string | null> {
    if (!this.groqApiKey) return null;

    try {
      // Determine file extension - WebM is standard
      const mimeType = audioBlob.type;
      let fileExtension = 'webm';
      if (mimeType.includes('webm')) fileExtension = 'webm';
      else if (mimeType.includes('ogg')) fileExtension = 'ogg';
      else if (mimeType.includes('wav')) fileExtension = 'wav';
      else if (mimeType.includes('mp3')) fileExtension = 'mp3';

      const formData = new FormData();
      formData.append('file', audioBlob, `audio.${fileExtension}`);
      formData.append('model', 'whisper-large-v3-turbo');
      formData.append('response_format', 'json');

      logger.debug('🎤 [VOICE AI] Sending to Groq Whisper:', {
        size: audioBlob.size,
        type: audioBlob.type,
        filename: `audio.${fileExtension}`
      });

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.debug('❌ [VOICE AI] Groq Whisper error response:', errorText);
        throw new Error(`Groq Whisper error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      logger.debug('✅ [VOICE AI] Groq Whisper transcript:', result.text);
      return result.text;
    } catch (error) {
      console.error('❌ [VOICE AI] Groq Whisper failed:', error);
      return null;
    }
  }

  // Fallback to Web Speech API (kept for compatibility)
  private async startListeningWithWebAPI(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    config: VoiceConfig = {}
  ): Promise<void> {
    if (!this.isSpeechRecognitionSupported()) {
      const error = 'Speech recognition not supported and no Whisper API key configured';
      onError(error);
      throw new Error(error);
    }

    return new Promise((resolve, reject) => {
      this.recognition!.lang = config.language || 'en-US';
      this.recognition!.continuous = true;
      this.recognition!.interimResults = true;

      this.recognition!.onstart = () => {
        this.isListening = true;
        logger.debug('✅ [VOICE AI] Web Speech API started');
        resolve();
      };

      this.recognition!.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        onResult(transcript.trim(), event.results[event.results.length - 1].isFinal);
      };

      this.recognition!.onerror = (event) => {
        this.isListening = false;
        onError(event.error);
        reject(new Error(event.error));
      };

      this.recognition!.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition!.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  // Stop listening
  public stopListening(): void {
    this.isListening = false;

    // Stop Deepgram if active
    if (deepgramService.isTranscribing()) {
      deepgramService.stop();
      logger.debug('🛑 [VOICE AI] Deepgram stopped');
    }

    // Stop MediaRecorder if using Whisper
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      logger.debug('🛑 [VOICE AI] MediaRecorder stopped');
    }

    // Stop audio stream
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => {
        track.stop();
        logger.debug('🛑 [VOICE AI] Audio track stopped');
      });
      this.currentStream = null;
    }

    // Stop Web Speech API if active
    if (this.recognition && this.recognition) {
      try {
        this.recognition.stop();
        logger.debug('🛑 [VOICE AI] Web Speech API stopped');
      } catch (e) {
        // Ignore errors when stopping
      }
    }

    logger.debug('✅ [VOICE AI] All recording stopped');
  }

  // Check if currently listening
  public getIsListening(): boolean {
    return this.isListening;
  }

  // Stop any currently playing TTS
  public stopTTS(): void {
    console.log('🛑 [VOICE AI] stopTTS() called');

    // Stop OpenAI/Groq TTS audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      logger.debug('🛑 [TTS] Stopped audio playback');
    }

    // Stop Web Speech API TTS
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
      logger.debug('🛑 [TTS] Cancelled Web Speech synthesis');
    }

    logger.debug('✅ [TTS] All TTS stopped');
  }

  // Speak text using available TTS
  public async speak(
    text: string,
    config: TTSConfig = {},
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    logger.debug('🔊 [VOICE AI] TTS Request initiated');
    logger.debug('📄 [VOICE AI] Text to speak:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    logger.debug('⚙️ [VOICE AI] TTS Config:', config);
    logger.debug('🔑 [VOICE AI] Groq API available:', !!this.groqApiKey);

    try {
      // Try OpenAI TTS first (most reliable), then Groq, then Web Speech API
      if (this.openaiApiKey && text.length <= 4096) {
        logger.debug('🌟 [VOICE AI] Using OpenAI TTS (Premium)');
        try {
          await this.speakWithOpenAITTS(text, config, onStart, onEnd, onError);
          return;
        } catch (error) {
          console.warn('⚠️ [VOICE AI] OpenAI TTS failed, trying Groq:', error);
        }
      }

      if (this.groqApiKey && text.length <= 10000) {
        logger.debug('🌟 [VOICE AI] Using Groq TTS');
        try {
          await this.speakWithGroqTTS(text, config, onStart, onEnd, onError);
          return;
        } catch (error) {
          console.warn('⚠️ [VOICE AI] Groq TTS failed, falling back to Web Speech:', error);
        }
      }

      // Final fallback to Web Speech API
      logger.debug('🔄 [VOICE AI] Using Web Speech API (Fallback)');
      await this.speakWithWebAPI(text, config, onStart, onEnd, onError);

    } catch (error) {
      console.error('❌ [VOICE AI] All TTS methods failed:', error);
      onError?.(error instanceof Error ? error.message : 'TTS failed');
      throw error;
    }
  }

  // Speak using OpenAI TTS API
  private async speakWithOpenAITTS(
    text: string,
    config: TTSConfig = {},
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      onStart?.();
      logger.debug('🚀 [VOICE AI] Calling OpenAI TTS API...');

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text.substring(0, 4096),
          voice: config.voice || 'alloy',
          response_format: 'mp3',
          speed: config.rate || 1.0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [VOICE AI] OpenAI TTS Error:', errorText);
        throw new Error(`OpenAI TTS error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Store reference so we can stop it if user interrupts
      this.currentAudio = audio;

      audio.onended = () => {
        logger.debug('🏁 [VOICE AI] OpenAI TTS playback completed');
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        onEnd?.();
      };

      audio.onerror = () => {
        console.error('❌ [VOICE AI] Audio playback failed');
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        onError?.('Audio playback failed');
      };

      await audio.play();
      logger.debug('▶️ [VOICE AI] OpenAI TTS playback started');

    } catch (error) {
      console.error('❌ [VOICE AI] OpenAI TTS Error:', error);
      onError?.(error instanceof Error ? error.message : 'TTS failed');
      throw error;
    }
  }

  private async speakWithGroqTTS(
    text: string,
    config: TTSConfig = {},
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    logger.debug('🌟 [VOICE AI] Groq TTS Starting...');
    logger.debug('📊 [VOICE AI] Request details:', {
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
      logger.debug('🚀 [VOICE AI] Calling Groq TTS API...');

      const requestBody = {
        model: 'playai-tts',
        input: text.substring(0, 10000), // Groq TTS limit
        voice: config.voice || 'Fritz-PlayAI',
        response_format: 'mp3'
      };

      logger.debug('📝 [VOICE AI] API Request:', requestBody);

      const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      logger.debug('📡 [VOICE AI] API Response status:', response.status);
      logger.debug('📋 [VOICE AI] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [VOICE AI] Groq API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Groq TTS API error: ${response.statusText}`);
      }

      logger.debug('✅ [VOICE AI] Groq TTS API success');
      const audioBlob = await response.blob();
      logger.debug('🎵 [VOICE AI] Audio blob created:', {
        size: audioBlob.size,
        type: audioBlob.type
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      logger.debug('🎧 [VOICE AI] Audio element created, starting playback...');

      audio.onended = () => {
        logger.debug('🏁 [VOICE AI] Groq TTS playback completed');
        URL.revokeObjectURL(audioUrl);
        onEnd?.();
      };

      audio.onerror = () => {
        console.error('❌ [VOICE AI] Audio playback failed');
        URL.revokeObjectURL(audioUrl);
        onError?.('Audio playback failed');
      };

      await audio.play();
      logger.debug('▶️ [VOICE AI] Groq TTS playback started successfully');

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
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        const error = 'Web Speech API not supported';
        onError?.(error);
        reject(new Error(error));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Store reference for interruption
      this.currentUtterance = utterance;

      // Configure utterance
      utterance.rate = config.rate || 1;
      utterance.pitch = config.pitch || 1;
      utterance.volume = config.volume || 1;

      logger.debug('⚙️ [VOICE AI] Utterance configured:', {
        rate: utterance.rate,
        pitch: utterance.pitch,
        volume: utterance.volume
      });

      // Set voice if specified
      if (config.voice) {
        const voices = this.synthesis.getVoices();
        logger.debug('🎭 [VOICE AI] Available voices:', voices.length);
        const selectedVoice = voices.find(voice =>
          voice.name.includes(config.voice!) || voice.lang.includes(config.voice!)
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          logger.debug('✅ [VOICE AI] Voice selected:', {
            name: selectedVoice.name,
            lang: selectedVoice.lang,
            gender: selectedVoice.gender
          });
        } else {
          console.warn('⚠️ [VOICE AI] Requested voice not found:', config.voice);
        }
      }

      utterance.onstart = () => {
        logger.debug('▶️ [VOICE AI] Web Speech API playback started');
        onStart?.();
      };

      utterance.onend = () => {
        logger.debug('🏁 [VOICE AI] Web Speech API playback completed');
        this.currentUtterance = null;
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
        this.currentUtterance = null;
        onError?.(error);
        reject(new Error(error));
      };

      logger.debug('🚀 [VOICE AI] Starting Web Speech API synthesis...');
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
    logger.debug('🔍 [VOICE AI] === PERMISSION DIAGNOSTICS ===');
    
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
    
    logger.debug('🌐 [VOICE AI] Browser capabilities:', diagnostics);
    
    // Check permission state if Permissions API is available
    if (navigator.permissions) {
      try {
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        logger.debug('🎤 [VOICE AI] Microphone permission state:', micPermission.state);
      } catch (error) {
        logger.debug('❌ [VOICE AI] Could not query microphone permission:', error);
      }
    }
    
    logger.debug('🔍 [VOICE AI] === END DIAGNOSTICS ===');
  }

  // Chrome-specific permission bypass
  public async forceChromeMicrophoneAccess(): Promise<boolean> {
    logger.debug('🔧 [VOICE AI] Attempting Chrome-specific microphone bypass...');
    
    // Strategy 1: Multiple rapid getUserMedia calls (Chrome quirk)
    for (let i = 0; i < 3; i++) {
      try {
        logger.debug(`🔄 [VOICE AI] Chrome bypass attempt ${i + 1}/3`);
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            autoGainControl: false,
            echoCancellation: false,
            noiseSuppression: false
          }
        });
        stream.getTracks().forEach(track => track.stop());
        logger.debug('✅ [VOICE AI] Chrome bypass successful!');
        return true;
      } catch (error) {
        logger.debug(`❌ [VOICE AI] Chrome bypass attempt ${i + 1} failed:`, error);
        await new Promise(resolve => setTimeout(resolve, 100)); // Brief delay
      }
    }
    
    // Strategy 2: Try with video=false explicitly (Chrome requirement)
    try {
      logger.debug('🔄 [VOICE AI] Trying Chrome video=false strategy...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      });
      stream.getTracks().forEach(track => track.stop());
      logger.debug('✅ [VOICE AI] Chrome video=false strategy successful!');
      return true;
    } catch (error) {
      logger.debug('❌ [VOICE AI] Chrome video=false strategy failed:', error);
    }
    
    return false;
  }

  // Retry microphone access with different strategies
  public async retryMicrophoneAccess(): Promise<boolean> {
    logger.debug('🔄 [VOICE AI] Retrying microphone access...');
    
    // First try Chrome-specific bypass
    const chromeSuccess = await this.forceChromeMicrophoneAccess();
    if (chromeSuccess) return true;
    
    // Strategy 1: Simple getUserMedia with minimal constraints
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      logger.debug('✅ [VOICE AI] Retry successful with basic constraints');
      return true;
    } catch (error) {
      logger.debug('❌ [VOICE AI] Basic retry failed:', error);
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
      logger.debug('✅ [VOICE AI] Retry successful with specific constraints');
      return true;
    } catch (error) {
      logger.debug('❌ [VOICE AI] Specific constraints retry failed:', error);
    }
    
    return false;
  }

  // Debug helper for console testing
  public async debugMicrophoneAccess(): Promise<void> {
    logger.debug('🔧 [VOICE AI] === MICROPHONE DEBUG TEST ===');
    
    // Test 1: Check browser capabilities
    await this.logPermissionDiagnostics();
    
    // Test 2: Try permission check
    logger.debug('🧪 [VOICE AI] Testing permission check...');
    try {
      const hasPermission = await this.checkMicrophonePermissions();
      logger.debug('🎤 [VOICE AI] Permission check result:', hasPermission ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      logger.debug('❌ [VOICE AI] Permission check error:', error);
    }
    
    // Test 3: Try speech recognition initialization
    logger.debug('🧪 [VOICE AI] Testing speech recognition...');
    const speechSupported = this.isSpeechRecognitionSupported();
    logger.debug('🎙️ [VOICE AI] Speech recognition supported:', speechSupported);
    
    // Test 4: Try retry mechanism
    logger.debug('🧪 [VOICE AI] Testing retry mechanism...');
    try {
      const retryResult = await this.retryMicrophoneAccess();
      logger.debug('🔄 [VOICE AI] Retry result:', retryResult ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      logger.debug('❌ [VOICE AI] Retry error:', error);
    }
    
    logger.debug('🔧 [VOICE AI] === DEBUG TEST COMPLETE ===');
    logger.debug('📋 [VOICE AI] To run this test, open browser console and run: voiceService.debugMicrophoneAccess()');
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
  logger.debug('🔧 [VOICE AI] Voice service available globally as window.voiceService');
  logger.debug('🧪 [VOICE AI] Run voiceService.debugMicrophoneAccess() in console to test');
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
