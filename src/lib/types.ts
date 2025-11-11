// State of the agent, make sure this aligns with your agent's state.
export type AgentState = {
  proverbs: string[];
}

// MCP (Model Context Protocol) Configuration Types
export interface MCPServerConfig {
  command: string;
  args: string[];
  enabled: boolean;
  description?: string;
  env?: Record<string, string>;
}

export interface MCPConfiguration {
  mcpServers: Record<string, MCPServerConfig>;
}