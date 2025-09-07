/**
 * Neon Database Client for SISO Personal Tasks
 * 
 * This client handles:
 * - Connection to Neon serverless PostgreSQL
 * - MCP-ready queries for AI agents
 * - Real-time subscriptions
 * - Database branching for AI experiments
 */

import { Client } from 'pg';

interface NeonConfig {
  endpoint: string;
  apiKey?: string;
  databaseUrl: string;
  projectId?: string;
}

export class NeonClient {
  private config: NeonConfig;
  private client: Client | null = null;
  
  constructor(config: NeonConfig) {
    this.config = config;
  }
  
  /**
   * Connect to Neon database
   */
  async connect(): Promise<void> {
    try {
      this.client = new Client({
        connectionString: this.config.databaseUrl,
        ssl: {
          rejectUnauthorized: false
        }
      });
      
      await this.client.connect();
      console.log('✅ [NEON CLIENT] Connected to database');
      
    } catch (error) {
      console.error('❌ [NEON CLIENT] Connection failed:', error);
      throw error;
    }
  }
  
  /**
   * Execute a query
   */
  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.client) {
      throw new Error('Neon client not connected');
    }
    
    try {
      const result = await this.client.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('❌ [NEON CLIENT] Query failed:', error);
      throw error;
    }
  }
  
  /**
   * Close connection
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
      console.log('🔌 [NEON CLIENT] Disconnected');
    }
  }
  
  /**
   * Create a database branch (for AI experiments)
   */
  async createBranch(branchName: string): Promise<string> {
    if (!this.config.apiKey || !this.config.projectId) {
      throw new Error('API key and project ID required for branching');
    }
    
    const response = await fetch(`${this.config.endpoint}/projects/${this.config.projectId}/branches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: branchName,
        parent_id: 'main'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create branch: ${response.statusText}`);
    }
    
    const branch = await response.json();
    console.log(`🌿 [NEON CLIENT] Created branch: ${branchName}`);
    return branch.id;
  }
  
  /**
   * Test connection with a simple query
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW() as current_time, version() as postgres_version');
      console.log('✅ [NEON CLIENT] Connection test successful:', result[0]);
      return true;
    } catch (error) {
      console.error('❌ [NEON CLIENT] Connection test failed:', error);
      return false;
    }
  }
}

// Factory function to create configured client
export function createNeonClient(): NeonClient {
  const config: NeonConfig = {
    endpoint: import.meta.env.VITE_NEON_ENDPOINT || 'https://console.neon.tech/api/v2',
    apiKey: import.meta.env.VITE_NEON_API_KEY,
    databaseUrl: import.meta.env.VITE_NEON_DATABASE_URL || '',
    projectId: import.meta.env.VITE_NEON_PROJECT_ID
  };
  
  if (!config.databaseUrl) {
    console.warn('⚠️ [NEON CLIENT] No database URL provided. Set VITE_NEON_DATABASE_URL environment variable.');
  }
  
  return new NeonClient(config);
}

// Export singleton instance
export const neonClient = createNeonClient();