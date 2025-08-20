// Mock API for usage statistics to work with Claudia-GUI components

export interface ModelUsage {
  model: string;
  total_cost: number;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  session_count: number;
}

export interface DailyUsage {
  date: string;
  total_cost: number;
  total_tokens: number;
  models_used: string[];
}

export interface ProjectUsage {
  project_path: string;
  project_name: string;
  total_cost: number;
  total_tokens: number;
  session_count: number;
  last_used: string;
}

export interface UsageStats {
  total_cost: number;
  total_tokens: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cache_creation_tokens: number;
  total_cache_read_tokens: number;
  total_sessions: number;
  by_model: ModelUsage[];
  by_date: DailyUsage[];
  by_project: ProjectUsage[];
}

// Mock data for demo purposes
const mockStats: UsageStats = {
  total_cost: 24.67,
  total_tokens: 125430,
  total_input_tokens: 89234,
  total_output_tokens: 36196,
  total_cache_creation_tokens: 12500,
  total_cache_read_tokens: 8700,
  total_sessions: 15,
  by_model: [
    {
      model: "claude-3.5-sonnet",
      total_cost: 18.45,
      input_tokens: 67234,
      output_tokens: 28196,
      cache_creation_tokens: 9500,
      cache_read_tokens: 6700,
      session_count: 12
    },
    {
      model: "claude-4-opus",
      total_cost: 6.22,
      input_tokens: 22000,
      output_tokens: 8000,
      cache_creation_tokens: 3000,
      cache_read_tokens: 2000,
      session_count: 3
    }
  ],
  by_date: [
    {
      date: "2025-08-18",
      total_cost: 3.45,
      total_tokens: 18500,
      models_used: ["claude-3.5-sonnet"]
    },
    {
      date: "2025-08-17",
      total_cost: 5.67,
      total_tokens: 24300,
      models_used: ["claude-3.5-sonnet", "claude-4-opus"]
    },
    {
      date: "2025-08-16",
      total_cost: 2.89,
      total_tokens: 15200,
      models_used: ["claude-3.5-sonnet"]
    }
  ],
  by_project: [
    {
      project_path: "/Users/shaansisodia/DEV/SISO-IDE",
      project_name: "SISO-IDE",
      total_cost: 12.34,
      total_tokens: 65000,
      session_count: 8,
      last_used: "2025-08-18T10:30:00Z"
    },
    {
      project_path: "/Users/shaansisodia/DEV/claudia-gui",
      project_name: "claudia-gui",
      total_cost: 8.91,
      total_tokens: 42000,
      session_count: 5,
      last_used: "2025-08-17T15:45:00Z"
    },
    {
      project_path: "/Users/shaansisodia/DEV/agentrooms",
      project_name: "agentrooms",
      total_cost: 3.42,
      total_tokens: 18430,
      session_count: 2,
      last_used: "2025-08-16T09:20:00Z"
    }
  ]
};

const mockProjectUsage: ProjectUsage[] = [
  {
    project_path: "/Users/shaansisodia/DEV/SISO-IDE",
    project_name: "SISO-IDE",
    total_cost: 12.34,
    total_tokens: 65000,
    session_count: 8,
    last_used: "2025-08-18T10:30:00Z"
  },
  {
    project_path: "/Users/shaansisodia/DEV/claudia-gui",
    project_name: "claudia-gui",
    total_cost: 8.91,
    total_tokens: 42000,
    session_count: 5,
    last_used: "2025-08-17T15:45:00Z"
  }
];

// Mock API implementation
export const api = {
  async getUsageStats(): Promise<UsageStats> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStats;
  },

  async getUsageByDateRange(startDate: string, endDate: string): Promise<UsageStats> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock data by date range for demonstration
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const filteredByDate = mockStats.by_date.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= start && dayDate <= end;
    });

    return {
      ...mockStats,
      by_date: filteredByDate,
      // Reduce totals proportionally for demo
      total_cost: mockStats.total_cost * (filteredByDate.length / mockStats.by_date.length),
      total_tokens: Math.floor(mockStats.total_tokens * (filteredByDate.length / mockStats.by_date.length)),
      total_sessions: Math.floor(mockStats.total_sessions * (filteredByDate.length / mockStats.by_date.length))
    };
  },

  async getSessionStats(
    since?: string,
    until?: string,
    order?: "asc" | "desc"
  ): Promise<ProjectUsage[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let result = [...mockProjectUsage];
    
    // Sort by order if specified
    if (order === "desc") {
      result.sort((a, b) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime());
    } else if (order === "asc") {
      result.sort((a, b) => new Date(a.last_used).getTime() - new Date(b.last_used).getTime());
    }
    
    return result;
  }
};