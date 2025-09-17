interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  dataPath: string; // Path in repo where data is stored
}

interface StreamedSystemData {
  timestamp: string;
  whatsapp: {
    unreadCount: number;
    conversations: Array<{
      name: string;
      unreadCount: number;
      lastMessage: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    importantMessages: Array<{
      from: string;
      content: string;
      timestamp: string;
    }>;
  };
  telegram: {
    channels: Array<{
      name: string;
      unreadCount: number;
      lastActivity: string;
    }>;
    bots: Array<{
      name: string;
      status: 'active' | 'idle' | 'error';
      notifications: number;
    }>;
  };
  agents: {
    activeAgents: Array<{
      name: string;
      status: 'running' | 'idle' | 'error';
      efficiency: number;
      tasksCompleted: number;
    }>;
    automations: Array<{
      name: string;
      status: 'active' | 'paused' | 'error';
      successRate: number;
      rateLimitHit: boolean;
    }>;
  };
  system: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    alerts: Array<{
      type: 'warning' | 'error' | 'info';
      message: string;
      timestamp: string;
    }>;
  };
}

class GitHubDataStreamer {
  private config: GitHubConfig;
  private cache: StreamedSystemData | null = null;
  private lastFetch = 0;
  private cacheDuration = 30000; // 30 seconds

  constructor(config?: Partial<GitHubConfig>) {
    this.config = {
      owner: config?.owner || process.env.VITE_GITHUB_OWNER || 'your-username',
      repo: config?.repo || process.env.VITE_GITHUB_REPO || 'system-data-stream',
      token: config?.token || process.env.VITE_GITHUB_TOKEN || '',
      dataPath: config?.dataPath || 'data/latest.json'
    };

    if (!this.config.token) {
      console.warn('GitHub token not configured. Set VITE_GITHUB_TOKEN environment variable.');
    }
  }

  async getLatestSystemData(): Promise<StreamedSystemData | null> {
    const now = Date.now();
    
    // Return cached data if recent
    if (this.cache && (now - this.lastFetch) < this.cacheDuration) {
      return this.cache;
    }

    try {
      const data = await this.fetchFromGitHub();
      if (data) {
        this.cache = data;
        this.lastFetch = now;
      }
      return data;
    } catch (error) {
      console.error('Failed to fetch GitHub data:', error);
      return this.cache; // Return stale cache if available
    }
  }

  private async fetchFromGitHub(): Promise<StreamedSystemData | null> {
    if (!this.config.token) {
      throw new Error('GitHub token not configured');
    }

    const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.dataPath}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Legacy-AI-System'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('GitHub data file not found. Make sure data is being streamed to the repository.');
        return null;
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const fileData = await response.json();
    
    if (!fileData.content) {
      throw new Error('No content in GitHub file');
    }

    // Decode base64 content
    const content = atob(fileData.content.replace(/\n/g, ''));
    
    try {
      const systemData: StreamedSystemData = JSON.parse(content);
      
      // Validate data structure
      if (!systemData.timestamp) {
        throw new Error('Invalid data format: missing timestamp');
      }

      console.log(`📊 Fetched fresh system data from GitHub (${new Date(systemData.timestamp).toLocaleString()})`);
      return systemData;
      
    } catch (parseError) {
      console.error('Failed to parse GitHub data:', parseError);
      return null;
    }
  }

  async getSystemHealth(): Promise<{
    dataAge: number; // minutes since last update
    isStale: boolean;
    lastUpdate: string;
    status: 'fresh' | 'stale' | 'offline';
  }> {
    const data = await this.getLatestSystemData();
    
    if (!data) {
      return {
        dataAge: -1,
        isStale: true,
        lastUpdate: 'Never',
        status: 'offline'
      };
    }

    const lastUpdate = new Date(data.timestamp);
    const now = new Date();
    const ageMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000);
    
    return {
      dataAge: ageMinutes,
      isStale: ageMinutes > 5, // Consider stale if older than 5 minutes
      lastUpdate: lastUpdate.toLocaleString(),
      status: ageMinutes > 10 ? 'offline' : ageMinutes > 5 ? 'stale' : 'fresh'
    };
  }

  // Test GitHub connection
  async testConnection(): Promise<{ success: boolean; error?: string; repoExists?: boolean }> {
    try {
      if (!this.config.token) {
        return { success: false, error: 'GitHub token not configured' };
      }

      const repoUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}`;
      
      const response = await fetch(repoUrl, {
        headers: {
          'Authorization': `token ${this.config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Legacy-AI-System'
        }
      });

      if (response.status === 404) {
        return { 
          success: false, 
          error: `Repository ${this.config.owner}/${this.config.repo} not found or not accessible`,
          repoExists: false 
        };
      }

      if (!response.ok) {
        return { 
          success: false, 
          error: `GitHub API error: ${response.status} ${response.statusText}`,
          repoExists: true 
        };
      }

      // Try to fetch the data file
      const dataCheck = await this.fetchFromGitHub();
      
      return { 
        success: true, 
        repoExists: true,
        error: dataCheck ? undefined : 'Repository accessible but data file not found'
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        repoExists: false 
      };
    }
  }

  // Get configuration info
  getConfig(): GitHubConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig: Partial<GitHubConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.cache = null; // Clear cache when config changes
    this.lastFetch = 0;
  }

  // Clear cache (force fresh fetch)
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }
}

// Create singleton instance
export const githubDataStreamer = new GitHubDataStreamer();

// Example setup script for Mac mini (to be run separately)
export const macMiniSetupScript = `
#!/bin/bash

# Mac Mini System Data Collection Script
# This script should be run on your Mac mini to collect and stream data to GitHub

REPO_OWNER="your-username"
REPO_NAME="system-data-stream"
GITHUB_TOKEN="your-github-token"

# Create data directory
mkdir -p /tmp/legacy-ai-data

# Function to collect WhatsApp data (requires appropriate permissions/apps)
collect_whatsapp_data() {
    # This would need to be implemented based on your WhatsApp setup
    # Could use WhatsApp Business API, web scraping, or other methods
    echo '{"unreadCount": 5, "conversations": []}' > /tmp/legacy-ai-data/whatsapp.json
}

# Function to collect Telegram data
collect_telegram_data() {
    # Use Telegram Bot API or CLI tools
    echo '{"channels": [], "bots": []}' > /tmp/legacy-ai-data/telegram.json
}

# Function to collect system metrics
collect_system_data() {
    cat > /tmp/legacy-ai-data/system.json << EOF
{
  "cpu": $(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//'),
  "memory": $(vm_stat | grep "Pages active" | awk '{print $3}' | sed 's/.//' | awk '{print $1 * 4096 / 1024 / 1024}'),
  "disk": $(df -h / | tail -1 | awk '{print $5}' | sed 's/%//'),
  "network": 0,
  "alerts": []
}
EOF
}

# Function to collect agent data
collect_agent_data() {
    # Monitor your automation systems
    echo '{"activeAgents": [], "automations": []}' > /tmp/legacy-ai-data/agents.json
}

# Main collection function
collect_all_data() {
    echo "Collecting system data..."
    
    collect_whatsapp_data
    collect_telegram_data
    collect_system_data
    collect_agent_data
    
    # Combine all data into single JSON file
    jq -s '{
        timestamp: now | strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        whatsapp: .[0],
        telegram: .[1],
        system: .[2],
        agents: .[3]
    }' /tmp/legacy-ai-data/*.json > /tmp/legacy-ai-data/latest.json
    
    # Upload to GitHub
    upload_to_github
}

# Function to upload data to GitHub
upload_to_github() {
    local file_content=$(base64 -i /tmp/legacy-ai-data/latest.json)
    local api_url="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/contents/data/latest.json"
    
    # Get current file SHA if it exists
    local current_sha=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$api_url" | jq -r '.sha // empty')
    
    local json_payload="{
        \\"message\\": \\"Update system data - $(date)\\",
        \\"content\\": \\"$file_content\\"
    }"
    
    if [ ! -z "$current_sha" ]; then
        json_payload=$(echo "$json_payload" | jq ". + {sha: \\"$current_sha\\"}")
    fi
    
    curl -X PUT \\
        -H "Authorization: token $GITHUB_TOKEN" \\
        -H "Content-Type: application/json" \\
        -d "$json_payload" \\
        "$api_url"
    
    echo "Data uploaded to GitHub at $(date)"
}

# Run collection every 2 minutes
while true; do
    collect_all_data
    sleep 120
done
`;

export default GitHubDataStreamer;