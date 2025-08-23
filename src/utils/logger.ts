/**
 * Smart Logging Utility
 * Respects environment and reduces log spam
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class SmartLogger {
  private isDevelopment = import.meta.env.DEV;
  private loggedMessages = new Set<string>();

  /**
   * Log debug messages only in development
   */
  debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  /**
   * Log info messages only in development  
   */
  info(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  /**
   * Log once - prevents spam from repeated calls
   */
  once(message: string, level: LogLevel = 'info', ...args: any[]) {
    if (this.loggedMessages.has(message)) {
      return;
    }
    
    this.loggedMessages.add(message);
    
    switch (level) {
      case 'debug':
        this.debug(message, ...args);
        break;
      case 'info':
        this.info(message, ...args);
        break;
      case 'warn':
        console.warn(`⚠️ ${message}`, ...args);
        break;
      case 'error':
        console.error(`❌ ${message}`, ...args);
        break;
    }
  }

  /**
   * Always log warnings
   */
  warn(message: string, ...args: any[]) {
    console.warn(`⚠️ ${message}`, ...args);
  }

  /**
   * Always log errors
   */
  error(message: string, ...args: any[]) {
    console.error(`❌ ${message}`, ...args);
  }

  /**
   * Success messages only in development
   */
  success(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`✅ ${message}`, ...args);
    }
  }
}

export const logger = new SmartLogger();
export default logger;