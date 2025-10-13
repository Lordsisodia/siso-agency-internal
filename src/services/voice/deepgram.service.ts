/**
 * Deepgram Real-Time Speech-to-Text Service
 * WebSocket-based streaming transcription for natural conversations
 */

import { logger } from '@/shared/utils/logger';

interface DeepgramConfig {
  language?: string;
  model?: string;
  punctuate?: boolean;
  interimResults?: boolean;
  endpointing?: number; // Milliseconds of silence before finalizing
}

export class DeepgramService {
  private ws: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private apiKey: string;
  private isActive = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY || '';
    logger.debug('🔑 [DEEPGRAM] API Key loaded:', !!this.apiKey);
  }

  /**
   * Start real-time transcription with WebSocket
   */
  async startRealTimeTranscription(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    config: DeepgramConfig = {}
  ): Promise<void> {
    if (!this.apiKey || this.apiKey === 'YOUR_KEY_HERE') {
      throw new Error('Deepgram API key not configured. Get free key at https://console.deepgram.com/signup');
    }

    if (this.isActive) {
      throw new Error('Already transcribing');
    }

    // Log key format for debugging (first/last 4 chars only)
    const keyPreview = this.apiKey.length > 8
      ? `${this.apiKey.slice(0, 4)}...${this.apiKey.slice(-4)}`
      : '[too short]';
    logger.debug('🔑 [DEEPGRAM] Using API key:', keyPreview, `(${this.apiKey.length} chars)`);

    try {
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000 // Deepgram recommends 16kHz
        }
      });

      // Build WebSocket URL with parameters
      // Expanded vocabulary for better tech/productivity term recognition
      const keywords = [
        // Database & Backend (High Priority)
        'Supabase:3', 'database:2', 'PostgreSQL:2', 'SQL:2', 'API:2',

        // Task Management
        'task:2', 'tasks:2', 'subtask:2', 'subtasks:2',
        'deep work:3', 'light work:3', 'focus:2', 'priority:2',

        // Tech Stack
        'React:2', 'TypeScript:2', 'JavaScript:2', 'Vite:2',
        'Tailwind:2', 'shadcn:2', 'Prisma:2',

        // Development
        'frontend:2', 'backend:2', 'fullstack:2', 'deployment:2',
        'build:2', 'debug:2', 'refactor:2', 'optimize:2',

        // Productivity
        'schedule:2', 'timebox:2', 'deadline:2', 'urgent:2',
        'important:2', 'complete:2', 'finish:2',

        // Common Actions
        'create:1', 'update:1', 'delete:1', 'query:1',
        'check:1', 'review:1', 'analyze:1'
      ].join(',');

      const params = new URLSearchParams({
        language: config.language || 'en-US',
        model: config.model || 'nova-2', // Latest model
        punctuate: String(config.punctuate !== false),
        interim_results: String(config.interimResults !== false),
        endpointing: String(config.endpointing || 300), // 300ms silence = finalize
        smart_format: 'true', // Better formatting, capitalization, numbers
        keywords: keywords
      });

      const wsUrl = `wss://api.deepgram.com/v1/listen?${params}`;

      logger.debug('🌐 [DEEPGRAM] Connecting to WebSocket:', wsUrl);

      // Create WebSocket connection
      this.ws = new WebSocket(wsUrl, ['token', this.apiKey]);

      this.ws.onopen = () => {
        logger.debug('✅ [DEEPGRAM] WebSocket connected');
        this.isActive = true;
        this.startStreaming();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Log ALL messages from Deepgram for debugging
          console.log('📨 [DEEPGRAM] Raw message received:', data);

          // Check for metadata (connection confirmation, etc)
          if (data.type === 'Metadata') {
            console.log('📋 [DEEPGRAM] Metadata:', data);
            return;
          }

          // Check for errors in response
          if (data.error) {
            console.error('❌ [DEEPGRAM] API Error:', data.error);
            onError(`Deepgram error: ${data.error}`);
            this.stop();
            return;
          }

          // Check for transcripts
          if (data.channel?.alternatives?.[0]?.transcript) {
            const transcript = data.channel.alternatives[0].transcript;
            const isFinal = data.is_final || false;

            console.log(`📝 [DEEPGRAM] ${isFinal ? 'FINAL' : 'interim'}:`, transcript);

            if (transcript.trim()) {
              onTranscript(transcript, isFinal);
            }
          } else {
            // Log when we get a message but no transcript
            console.log('⚠️ [DEEPGRAM] Message received but no transcript:', data);
          }
        } catch (error) {
          console.error('❌ [DEEPGRAM] Message parse error:', error);
          console.error('❌ [DEEPGRAM] Raw event.data:', event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ [DEEPGRAM] WebSocket error:', error);
        console.error('❌ [DEEPGRAM] Error details:', JSON.stringify(error));
        onError('Deepgram connection error');
        this.stop();
      };

      this.ws.onclose = (event) => {
        logger.debug('🔌 [DEEPGRAM] WebSocket closed');
        console.log('📋 [DEEPGRAM] Close details:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        this.isActive = false;
      };

    } catch (error) {
      console.error('❌ [DEEPGRAM] Failed to start:', error);
      this.stop();
      onError(error instanceof Error ? error.message : 'Failed to start transcription');
      throw error;
    }
  }

  /**
   * Stream audio from microphone to Deepgram
   * Sends WebM audio - Deepgram auto-detects format
   */
  private startStreaming() {
    if (!this.stream || !this.ws) return;

    try {
      // Use MediaRecorder with WebM format (Deepgram supports this)
      const options: MediaRecorderOptions = {
        mimeType: 'audio/webm;codecs=opus'
      };

      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          logger.debug('🎵 [DEEPGRAM] Audio chunk captured:', event.data.size, 'bytes');

          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(event.data);
            logger.debug('📤 [DEEPGRAM] Sent WebM chunk to WebSocket');
          } else {
            console.warn('⚠️ [DEEPGRAM] WebSocket not ready, state:', this.ws?.readyState);
          }
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('❌ [DEEPGRAM] MediaRecorder error:', event);
      };

      // Send audio in small chunks for real-time processing
      this.mediaRecorder.start(250); // 250ms chunks for ultra-responsive transcription

      logger.debug('✅ [DEEPGRAM] Streaming started (WebM format, 250ms chunks)');

    } catch (error) {
      console.error('❌ [DEEPGRAM] Failed to start streaming:', error);
      this.stop();
    }
  }

  /**
   * Stop transcription and clean up
   */
  stop(): void {
    // Log stack trace to see WHO called stop()
    console.trace('🛑 [DEEPGRAM] stop() called from:');
    logger.debug('🛑 [DEEPGRAM] Stopping transcription...');

    this.isActive = false;

    // Stop media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
      logger.debug('🛑 [DEEPGRAM] MediaRecorder stopped');
    }

    // Stop media stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      logger.debug('🛑 [DEEPGRAM] Media stream stopped');
    }

    // Close WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
      this.ws = null;
      logger.debug('🛑 [DEEPGRAM] WebSocket closed');
    }

    logger.debug('✅ [DEEPGRAM] Stopped and cleaned up');
  }

  /**
   * Check if currently active
   */
  isTranscribing(): boolean {
    return this.isActive;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'YOUR_KEY_HERE';
  }
}

// Export singleton
export const deepgramService = new DeepgramService();
