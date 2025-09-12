import { execFile } from 'node:child_process';
import { accessSync, constants } from 'node:fs';
import { resolve } from 'node:path';

export interface DesktopCommanderOptions {
  allowedApps?: string[];
  allowedPaths?: string[];
  allowCustomScripts?: boolean;
  defaultBrowserApp?: string; // when focusing/opening URL via specific app
}

export interface DesktopResult<T = any> {
  success: boolean;
  action: string;
  data?: T;
  error?: string;
}

function isDarwin() {
  return typeof process !== 'undefined' && process.platform === 'darwin';
}

function esc(s: string): string {
  // Basic AppleScript string escape
  return String(s).replace(/"/g, '\\"');
}

function withinAllowed(path: string, allowed: string[]): boolean {
  try {
    const abs = resolve(path);
    return allowed.some((base) => abs.startsWith(resolve(base)));
  } catch {
    return false;
  }
}

export class DesktopCommanderClient {
  private options: Required<DesktopCommanderOptions>;

  constructor(opts: DesktopCommanderOptions = {}) {
    this.options = {
      allowedApps: [
        'Safari',
        'Google Chrome',
        'Arc',
        'Firefox',
        'Finder',
        'iTerm',
        'Terminal',
        'Visual Studio Code',
        'Cursor',
        'Notes',
        'TextEdit',
      ],
      allowedPaths: [resolve(process.cwd())],
      allowCustomScripts: false,
      defaultBrowserApp: 'Safari',
      ...opts,
    };
  }

  /**
   * Generic entrypoint used by smartQuery automation intent.
   * Interprets a natural language query into a concrete desktop action.
   */
  async execute(params: { query?: string }): Promise<DesktopResult> {
    if (!isDarwin()) return this.unavailable('execute');
    const q = (params?.query || '').trim();
    if (!q) return this.fail('execute', 'Empty query');

    // open url
    const urlMatch = q.match(/\bopen\s+(?:url|link|website)\s+(https?:[^\s"']+)/i);
    if (urlMatch) return this.openUrl({ url: urlMatch[1] });

    // open/launch app
    const openAppMatch = q.match(/\b(?:open|launch)\s+([A-Za-z0-9 .+\-]+)$/i);
    if (openAppMatch) return this.openApp({ app: openAppMatch[1].trim() });

    // focus app
    const focusMatch = q.match(/\b(?:focus|switch\s+to)\s+([A-Za-z0-9 .+\-]+)$/i);
    if (focusMatch) return this.focusApp({ app: focusMatch[1].trim() });

    // notification
    const notifyMatch = q.match(/\b(?:notify|notification|alert)\b[:\-]?\s*(.+)$/i);
    if (notifyMatch) return this.notify({ message: notifyMatch[1] });

    return this.fail('execute', 'No matching desktop action');
  }

  async openApp(params: { app: string; files?: string[] }): Promise<DesktopResult> {
    if (!isDarwin()) return this.unavailable('openApp');
    const app = this.normalizeApp(params.app);
    if (!this.isAllowedApp(app)) return this.fail('openApp', `App not allowed: ${app}`);

    // Optional: open files with the app (all must be allowed paths)
    if (params.files && params.files.length) {
      for (const p of params.files) {
        if (!withinAllowed(p, this.options.allowedPaths)) {
          return this.fail('openApp', `Path not allowed: ${p}`);
        }
        try {
          accessSync(p, constants.R_OK);
        } catch {
          return this.fail('openApp', `Path not readable: ${p}`);
        }
      }
    }

    const script = params.files && params.files.length
      ? `tell application "${esc(app)}"\nrepeat with f in {${params.files.map((p) => `POSIX file "${esc(resolve(p))}"`).join(', ')}}\nopen f\nend repeat\nactivate\nend tell`
      : `tell application "${esc(app)}" to activate`;

    return this.runOSA('openApp', script);
  }

  async focusApp(params: { app: string }): Promise<DesktopResult> {
    if (!isDarwin()) return this.unavailable('focusApp');
    const app = this.normalizeApp(params.app);
    if (!this.isAllowedApp(app)) return this.fail('focusApp', `App not allowed: ${app}`);
    const script = `tell application "${esc(app)}" to activate`;
    return this.runOSA('focusApp', script);
  }

  async openUrl(params: { url: string; app?: string }): Promise<DesktopResult> {
    if (!isDarwin()) return this.unavailable('openUrl');
    const { url } = params;
    try {
      const u = new URL(url);
      if (!/^https?:$/.test(u.protocol)) throw new Error('Only http/https URLs allowed');
    } catch (e: any) {
      return this.fail('openUrl', `Invalid URL: ${e?.message || 'parse error'}`);
    }

    const app = params.app ? this.normalizeApp(params.app) : this.options.defaultBrowserApp;
    if (app && !this.isAllowedApp(app)) return this.fail('openUrl', `App not allowed: ${app}`);

    // Use default browser if no app specified
    const script = app
      ? `tell application "${esc(app)}" to open location "${esc(url)}"`
      : `open location "${esc(url)}"`;

    return this.runOSA('openUrl', script);
  }

  async openFinder(params: { path: string }): Promise<DesktopResult> {
    if (!isDarwin()) return this.unavailable('openFinder');
    const p = resolve(params.path);
    if (!withinAllowed(p, this.options.allowedPaths)) {
      return this.fail('openFinder', `Path not allowed: ${p}`);
    }
    const script = `tell application "Finder" to reveal POSIX file "${esc(p)}"`;
    return this.runOSA('openFinder', script);
  }

  async notify(params: { message: string; title?: string; subtitle?: string }): Promise<DesktopResult> {
    if (!isDarwin()) return this.unavailable('notify');
    const title = esc(params.title || 'SISO');
    const subtitle = params.subtitle ? ` subtitle "${esc(params.subtitle)}"` : '';
    const message = esc(params.message || '');
    const script = `display notification "${message}" with title "${title}"${subtitle}`;
    return this.runOSA('notify', script);
  }

  // Optional and off by default; requires allowCustomScripts in constructor
  async runAppleScript(params: { script: string }): Promise<DesktopResult> {
    if (!isDarwin()) return this.unavailable('runAppleScript');
    if (!this.options.allowCustomScripts) return this.fail('runAppleScript', 'Custom scripts disabled');
    const script = params.script;
    return this.runOSA('runAppleScript', script);
  }

  // Internals
  private normalizeApp(app: string): string {
    const trimmed = app.trim();
    // Quick aliases
    const aliases: Record<string, string> = {
      chrome: 'Google Chrome',
      safari: 'Safari',
      finder: 'Finder',
      vscode: 'Visual Studio Code',
      code: 'Visual Studio Code',
      cursor: 'Cursor',
      terminal: 'Terminal',
      iterm: 'iTerm',
      notes: 'Notes',
    };
    const key = trimmed.toLowerCase();
    return aliases[key] || trimmed;
  }

  private isAllowedApp(app: string): boolean {
    return this.options.allowedApps.some((a) => a.toLowerCase() === app.toLowerCase());
  }

  private runOSA(action: string, script: string): Promise<DesktopResult<{ stdout: string }>> {
    return new Promise((resolve) => {
      const osa = isDarwin() ? '/usr/bin/osascript' : 'osascript';
      execFile(osa, ['-e', script], { timeout: 5000 }, (err, stdout = '') => {
        if (err) {
          resolve({ success: false, action, error: err.message });
        } else {
          resolve({ success: true, action, data: { stdout: String(stdout).trim() } });
        }
      });
    });
  }

  private fail(action: string, error: string): DesktopResult {
    return { success: false, action, error };
  }

  private unavailable(action: string): DesktopResult {
    return { success: false, action, error: 'Desktop Commander is only supported on macOS.' };
  }
}

export default DesktopCommanderClient;

