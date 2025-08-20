export interface Agent {
  id: string;
  name: string;
  workingDirectory: string;
  color: string;
  description: string;
  apiEndpoint?: string;
  isOrchestrator?: boolean; // Indicates if this agent orchestrates others
}

export const PREDEFINED_AGENTS: Agent[] = [
  {
    id: "orchestrator",
    name: "Orchestrator Agent",
    workingDirectory: "/tmp/orchestrator",
    color: "bg-gradient-to-r from-blue-500 to-purple-500",
    description: "Intelligent orchestrator that coordinates multi-agent workflows",
    isOrchestrator: true
  },
  {
    id: "file-agent",
    name: "File Operations Agent",
    workingDirectory: "/Users/shaansisodia/DEV/claude-code-by-agents/backend",
    color: "bg-gradient-to-r from-green-500 to-teal-500",
    description: "Handles file operations and backend code analysis",
    apiEndpoint: "http://localhost:8081"
  },
  {
    id: "siso-agent", 
    name: "SISO Projects Agent",
    workingDirectory: "/Users/shaansisodia/DEV/SISO-INTERNAL",
    color: "bg-gradient-to-r from-orange-500 to-red-500",
    description: "Works with SISO internal projects and configurations",
    apiEndpoint: "http://localhost:8083"
  }
];

export const getAgentById = (id: string): Agent | undefined => {
  return PREDEFINED_AGENTS.find(agent => agent.id === id);
};

export const getAgentByName = (name: string): Agent | undefined => {
  return PREDEFINED_AGENTS.find(agent => 
    agent.name.toLowerCase() === name.toLowerCase()
  );
};

export const parseAgentMention = (message: string): { agentId: string | null; cleanMessage: string } => {
  const mentionMatch = message.match(/^@(\w+(?:-\w+)*)\s+(.*)$/);
  if (mentionMatch) {
    const [, agentId, cleanMessage] = mentionMatch;
    const agent = getAgentById(agentId);
    if (agent) {
      return { agentId: agent.id, cleanMessage };
    }
  }
  return { agentId: null, cleanMessage: message };
};

export const getOrchestratorAgent = (): Agent | undefined => {
  return PREDEFINED_AGENTS.find(agent => agent.isOrchestrator);
};

export const getWorkerAgents = (): Agent[] => {
  return PREDEFINED_AGENTS.filter(agent => !agent.isOrchestrator);
};