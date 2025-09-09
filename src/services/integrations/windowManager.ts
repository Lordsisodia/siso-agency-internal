interface WindowData {
  id: string;
  type: 'main' | 'dev-tools' | 'agent-monitor' | 'terminal' | 'code-editor';
  title: string;
  url: string;
  windowRef?: Window | null;
  isActive: boolean;
  lastActivity: Date;
  data?: any;
}

interface WindowMessage {
  type: 'state-update' | 'agent-status' | 'project-change' | 'terminal-output' | 'window-ready';
  source: string;
  target?: string;
  data: any;
  timestamp: Date;
}

class WindowManager {
  private windows: Map<string, WindowData> = new Map();
  private messageHandlers: Map<string, (message: WindowMessage) => void> = new Map();
  private currentWindowId: string;

  constructor() {
    this.currentWindowId = this.generateWindowId();
    this.initializeMessageListener();
    this.registerWindow('main', 'SISO Agency Dashboard', window.location.href);
  }

  private generateWindowId(): string {
    return `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMessageListener(): void {
    window.addEventListener('message', (event) => {
      // Only accept messages from same origin
      if (event.origin !== window.location.origin) return;

      const message: WindowMessage = event.data;
      if (message && message.type) {
        this.handleMessage(message);
      }
    });

    // Clean up closed windows
    window.addEventListener('beforeunload', () => {
      this.broadcastMessage({
        type: 'window-ready',
        source: this.currentWindowId,
        data: { action: 'closing' },
        timestamp: new Date()
      });
    });
  }

  private handleMessage(message: WindowMessage): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }

    // Update window activity
    const window = this.windows.get(message.source);
    if (window) {
      window.lastActivity = new Date();
    }
  }

  /**
   * Register a window with the manager
   */
  registerWindow(type: WindowData['type'], title: string, url: string): string {
    const windowId = this.generateWindowId();
    
    const windowData: WindowData = {
      id: windowId,
      type,
      title,
      url,
      isActive: true,
      lastActivity: new Date()
    };

    this.windows.set(windowId, windowData);
    return windowId;
  }

  /**
   * Open a new window for specific functionality
   */
  openWindow(type: WindowData['type'], route: string, options?: {
    width?: number;
    height?: number;
    features?: string;
    data?: any;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      const windowId = this.generateWindowId();
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}${route}?windowId=${windowId}&parentId=${this.currentWindowId}`;
      
      const defaultFeatures = {
        width: options?.width || 1200,
        height: options?.height || 800,
        scrollbars: 'yes',
        resizable: 'yes',
        toolbar: 'no',
        location: 'no',
        directories: 'no',
        status: 'no',
        menubar: 'no',
        copyhistory: 'no'
      };

      const features = options?.features || Object.entries(defaultFeatures)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');

      const newWindow = window.open(fullUrl, windowId, features);
      
      if (!newWindow) {
        reject(new Error('Failed to open window - popup blocked?'));
        return;
      }

      const windowData: WindowData = {
        id: windowId,
        type,
        title: this.getWindowTitle(type),
        url: fullUrl,
        windowRef: newWindow,
        isActive: true,
        lastActivity: new Date(),
        data: options?.data
      };

      this.windows.set(windowId, windowData);

      // Wait for window to be ready
      const readyHandler = (message: WindowMessage) => {
        if (message.source === windowId && message.type === 'window-ready') {
          this.messageHandlers.delete('window-ready');
          resolve(windowId);
        }
      };

      this.messageHandlers.set('window-ready', readyHandler);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.messageHandlers.has('window-ready')) {
          this.messageHandlers.delete('window-ready');
          reject(new Error('Window failed to initialize'));
        }
      }, 10000);

      // Monitor window closure
      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkClosed);
          this.windows.delete(windowId);
          this.broadcastMessage({
            type: 'window-ready',
            source: this.currentWindowId,
            data: { action: 'closed', windowId },
            timestamp: new Date()
          });
        }
      }, 1000);
    });
  }

  /**
   * Open Dev Tools in a new window
   */
  async openDevTools(options?: { 
    tab?: 'overview' | 'claude-session' | 'projects' | 'agents' | 'terminals' | 'code-editor';
    projectId?: string;
  }): Promise<string> {
    const route = `/admin/dev-tools${options?.tab ? `?tab=${options.tab}` : ''}`;
    return this.openWindow('dev-tools', route, {
      width: 1400,
      height: 900,
      data: options
    });
  }

  /**
   * Open Agent Monitor in a new window
   */
  async openAgentMonitor(projectId?: string): Promise<string> {
    const route = `/admin/dev-tools?tab=agents${projectId ? `&projectId=${projectId}` : ''}`;
    return this.openWindow('agent-monitor', route, {
      width: 1000,
      height: 700
    });
  }

  /**
   * Open Agency Dashboard in a new window
   */
  async openAgencyDashboard(): Promise<string> {
    const route = `/admin`;
    return this.openWindow('main', route, {
      width: 1400,
      height: 900
    });
  }

  /**
   * Open AI Team Agents in a new window
   */
  async openAITeamAgents(): Promise<string> {
    const route = `/admin/dev-tools?tab=agents`;
    return this.openWindow('agent-monitor', route, {
      width: 1200,
      height: 800
    });
  }

  /**
   * Open Terminal in a new window
   */
  async openTerminal(projectId?: string): Promise<string> {
    const route = `/admin/dev-tools?tab=terminals${projectId ? `&projectId=${projectId}` : ''}`;
    return this.openWindow('terminal', route, {
      width: 900,
      height: 600
    });
  }

  /**
   * Open Code Editor in a new window
   */
  async openCodeEditor(projectId?: string, filePath?: string): Promise<string> {
    const route = `/admin/dev-tools?tab=code-editor${projectId ? `&projectId=${projectId}` : ''}${filePath ? `&filePath=${filePath}` : ''}`;
    return this.openWindow('code-editor', route, {
      width: 1200,
      height: 800
    });
  }

  /**
   * Broadcast message to all windows
   */
  broadcastMessage(message: Omit<WindowMessage, 'source'>): void {
    const fullMessage: WindowMessage = {
      ...message,
      source: this.currentWindowId
    };

    this.windows.forEach((windowData, windowId) => {
      if (windowId !== this.currentWindowId && windowData.windowRef && !windowData.windowRef.closed) {
        windowData.windowRef.postMessage(fullMessage, window.location.origin);
      }
    });
  }

  /**
   * Send message to specific window
   */
  sendMessage(targetWindowId: string, message: Omit<WindowMessage, 'source' | 'target'>): void {
    const targetWindow = this.windows.get(targetWindowId);
    if (targetWindow && targetWindow.windowRef && !targetWindow.windowRef.closed) {
      const fullMessage: WindowMessage = {
        ...message,
        source: this.currentWindowId,
        target: targetWindowId
      };
      targetWindow.windowRef.postMessage(fullMessage, window.location.origin);
    }
  }

  /**
   * Register message handler
   */
  onMessage(messageType: string, handler: (message: WindowMessage) => void): void {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Get all active windows
   */
  getActiveWindows(): WindowData[] {
    return Array.from(this.windows.values()).filter(w => w.isActive);
  }

  /**
   * Get window by ID
   */
  getWindow(windowId: string): WindowData | undefined {
    return this.windows.get(windowId);
  }

  /**
   * Focus window
   */
  focusWindow(windowId: string): void {
    const windowData = this.windows.get(windowId);
    if (windowData && windowData.windowRef && !windowData.windowRef.closed) {
      windowData.windowRef.focus();
    }
  }

  /**
   * Close window
   */
  closeWindow(windowId: string): void {
    const windowData = this.windows.get(windowId);
    if (windowData && windowData.windowRef && !windowData.windowRef.closed) {
      windowData.windowRef.close();
    }
    this.windows.delete(windowId);
  }

  /**
   * Get current window ID
   */
  getCurrentWindowId(): string {
    return this.currentWindowId;
  }

  /**
   * Check if running in child window
   */
  isChildWindow(): boolean {
    return window.opener !== null;
  }

  /**
   * Get parent window ID from URL params
   */
  getParentWindowId(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('parentId');
  }

  /**
   * Initialize child window
   */
  initializeChildWindow(): void {
    if (this.isChildWindow()) {
      // Notify parent that window is ready
      if (window.opener) {
        window.opener.postMessage({
          type: 'window-ready',
          source: this.currentWindowId,
          data: { action: 'ready' },
          timestamp: new Date()
        }, window.location.origin);
      }
    }
  }

  private getWindowTitle(type: WindowData['type']): string {
    switch (type) {
      case 'main':
        return 'SISO Agency Dashboard';
      case 'dev-tools':
        return 'SISO Dev Tools';
      case 'agent-monitor':
        return 'Agent Monitor';
      case 'terminal':
        return 'Terminal';
      case 'code-editor':
        return 'Code Editor';
      default:
        return 'SISO Window';
    }
  }
}

import React from 'react';

// Global instance
export const windowManager = new WindowManager();

// React hook for window management
export function useWindowManager() {
  const [windows, setWindows] = React.useState<WindowData[]>([]);
  const [isChildWindow, setIsChildWindow] = React.useState(false);

  React.useEffect(() => {
    setWindows(windowManager.getActiveWindows());
    setIsChildWindow(windowManager.isChildWindow());

    if (windowManager.isChildWindow()) {
      windowManager.initializeChildWindow();
    }

    // Listen for window updates
    const handleWindowUpdate = () => {
      setWindows(windowManager.getActiveWindows());
    };

    windowManager.onMessage('window-ready', handleWindowUpdate);
    windowManager.onMessage('state-update', handleWindowUpdate);

    return () => {
      // Cleanup handled by WindowManager
    };
  }, []);

  return {
    windows,
    isChildWindow,
    openDevTools: windowManager.openDevTools.bind(windowManager),
    openAgentMonitor: windowManager.openAgentMonitor.bind(windowManager),
    openTerminal: windowManager.openTerminal.bind(windowManager),
    openCodeEditor: windowManager.openCodeEditor.bind(windowManager),
    openAgencyDashboard: windowManager.openAgencyDashboard.bind(windowManager),
    openAITeamAgents: windowManager.openAITeamAgents.bind(windowManager),
    broadcastMessage: windowManager.broadcastMessage.bind(windowManager),
    sendMessage: windowManager.sendMessage.bind(windowManager),
    onMessage: windowManager.onMessage.bind(windowManager),
    focusWindow: windowManager.focusWindow.bind(windowManager),
    closeWindow: windowManager.closeWindow.bind(windowManager),
    getCurrentWindowId: windowManager.getCurrentWindowId.bind(windowManager)
  };
}

// For non-React usage
export default windowManager;