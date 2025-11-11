# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a CopilotKit + LangGraph TypeScript starter template demonstrating how to build AI agents with a Next.js frontend and LangGraph-powered backend. The application runs in a single Next.js server (not dual-server) and showcases features like modular agent design, memory/conversation persistence, tool integration, and MCP (Model Context Protocol) server support.

## Development Commands

### Package Manager
**IMPORTANT**: This project uses `bun` as the primary package manager. While npm, yarn, and pnpm work, `bun` is recommended.

### Installation
```bash
# Install all dependencies
bun install

# Note: The postinstall script references Python setup (install:agent) but the
# actual implementation is TypeScript-only. These scripts may fail safely.
```

### Running the Application
```bash
# Start the Next.js development server (single server, port 3000)
bun run dev

# Start with debug logging
bun run dev:debug

# Start only the UI server (same as dev since agent is integrated)
bun run dev:ui
```

### Building and Linting
```bash
# Build for production
bun run build

# Run production server
bun start

# Lint code
bun run lint
```

## Architecture

### Single-Server Architecture
The application runs a **single Next.js server** (port 3000) with:
- **Next.js UI**: Frontend with React, CopilotKit, and TailwindCSS
- **LangGraph Agent**: TypeScript agent integrated via Next.js API routes

**IMPORTANT**: Despite references in package.json to dual-server setup, the actual implementation is single-server TypeScript-only.

### Communication Flow
1. Frontend (React) → CopilotKit components
2. CopilotKit → `/api/copilotkit` or `/api/langgraph` route handler
3. Next.js API route → LangGraph agent (TypeScript)
4. Agent processes with memory (checkpointer) and tools
5. Response → Frontend via CopilotKit

### Directory Structure

#### Frontend (`src/`)
- **`app/page.tsx`**: Main chat interface with CopilotSidebar and CopilotChat
- **`app/layout.tsx`**: Root layout with CopilotKit provider
- **`app/settings/page.tsx`**: MCP server configuration UI
- **`app/api/copilotkit/route.ts`**: CopilotKit integration endpoint
- **`app/api/langgraph/route.ts`**: Direct LangGraph agent API
- **`app/api/mcp/route.ts`**: REST API for MCP configuration (CRUD operations)
- **`components/`**: React components (weather card, moon card, proverbs card)
- **`lib/types.ts`**: TypeScript type definitions

#### LangGraph Agent (`src/agent/`)
- **`index.ts`**: Main exports (agentGraph, getAgentCheckpointer)
- **`state.ts`**: Agent state schema with `AgentState` type and annotations
- **`nodes.ts`**: Graph nodes (agentNode, toolNode, shouldContinue routing)
- **`graph.ts`**: StateGraph definition, edge connections, and compilation
- **`memory.ts`**: Checkpointer configuration (MemorySaver, SqliteSaver, PostgresSaver)
- **`tools/`**: Tool definitions
  - `index.ts`: Tool registry exports
  - `research.ts`: Example research tool

### LangGraph Agent Flow
```
START → agentNode → shouldContinue?
                         ├→ "continue" → toolNode → agentNode (loop)
                         └→ "end" → END
```

The agent uses a conditional edge (`shouldContinue`) to determine whether to:
- Call tools ("continue") and loop back
- End the conversation ("end")

### State Management

#### Agent State Schema
Defined in `src/agent/state.ts`:
```typescript
export interface AgentState {
  messages: BaseMessage[];  // Conversation history
  // Add custom fields here with custom reducers
}
```

Uses `messagesStateReducer` to append new messages to history.

#### Memory/Checkpointing
Configured via `AGENT_MEMORY_TYPE` environment variable:
- **`memory`** (default): MemorySaver - in-memory, lost on restart
- **`sqlite`**: SqliteSaver - persistent, single-server (requires better-sqlite3)
- **`postgres`**: PostgresSaver - persistent, distributed (requires pg)

Thread-based continuity: Pass `thread_id` in API calls to maintain conversation context.

## Environment Configuration

Create `.env` in root directory:
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
AGENT_MEMORY_TYPE=memory     # Options: memory, sqlite, postgres
```

Optional for persistent storage:
```env
DATABASE_URL=postgresql://...  # For PostgreSQL checkpointer
```

## Tools

### Adding a New Tool

1. Create tool file in `src/agent/tools/`:
```typescript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const myTool = tool(
  async ({ param }: { param: string }) => {
    // Tool logic
    return "result";
  },
  {
    name: "tool_name",
    description: "What the tool does",
    schema: z.object({
      param: z.string().describe("Parameter description")
    })
  }
);
```

2. Export in `src/agent/tools/index.ts`:
```typescript
export { myTool } from './mytool';
```

The agent automatically discovers tools from the registry.

### Tool Pattern
- Use Zod schemas for parameter validation
- Provide clear descriptions for LLM understanding
- Return strings or serializable objects
- Handle errors gracefully

## MCP (Model Context Protocol) Integration

### Overview
Dynamically extend the agent with external tools via MCP servers without code changes.

### Configuration
- **File**: `data/mcp.json`
- **Structure**:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "executable",
      "args": ["arg1", "arg2"],
      "enabled": true,
      "description": "What it does",
      "env": { "VAR": "value" }
    }
  }
}
```

### Managing MCP Servers
1. **UI**: Navigate to `/settings` in running app
   - CRUD operations: Create, Read, Update, Delete
   - Enable/disable toggle
2. **Manual**: Edit `data/mcp.json` directly
3. **Restart**: Changes require agent/server restart

### MCP Server Lifecycle
1. Agent startup: Reads `data/mcp.json`
2. For each enabled server: Initialize MCP client
3. Agent uses tools from all MCP clients automatically
4. **Must restart** after configuration changes

## Extending the Agent

### Adding State Fields
1. Update `AgentState` interface in `src/agent/state.ts`
2. Add custom reducer if needed (default appends to arrays)
3. Update initial state in API routes if necessary

### Adding Graph Nodes
1. Create node function in `src/agent/nodes.ts`:
```typescript
async function myNode(state: AgentState): Promise<Partial<AgentState>> {
  // Node logic
  return { messages: [...state.messages, newMessage] };
}
```

2. Add to graph in `src/agent/graph.ts`:
```typescript
workflow.addNode("myNode", myNode);
workflow.addEdge("someNode", "myNode");
```

### Modifying Memory Backend
Edit `src/agent/memory.ts` to:
- Change checkpointer implementation
- Add custom serialization
- Configure database connections

## API Routes

### POST /api/langgraph
Direct LangGraph agent endpoint:
```typescript
// Request
{
  message: string,
  threadId?: string  // For conversation continuity
}

// Response
{
  response: string,
  threadId: string,
  messages: BaseMessage[]
}
```

### POST /api/copilotkit
CopilotKit integration endpoint (streaming support).

### GET/POST/PUT/DELETE /api/mcp
MCP server configuration REST API:
- **GET**: Retrieve all servers
- **POST**: Create new server
- **PUT**: Update existing server
- **DELETE**: Remove server

## Troubleshooting

### Agent Connection Issues
1. Verify `OPENAI_API_KEY` in `.env`
2. Check server started successfully (`bun run dev`)
3. Inspect browser console and server logs

### Memory Not Persisting
1. Check `AGENT_MEMORY_TYPE` in `.env`
2. Verify `thread_id` is consistent across requests
3. For SQLite/Postgres: validate database connection
4. For MemorySaver: memory is lost on restart (expected)

### Tools Not Working
1. Verify tool exported in `src/agent/tools/index.ts`
2. Check tool schema matches implementation
3. Review server logs for tool execution errors
4. Ensure tool function returns serializable data

### MCP Server Issues
1. Verify command is in PATH (e.g., `deno`, `python`, `node`)
2. Check `enabled: true` in `data/mcp.json`
3. Validate JSON syntax in configuration
4. Restart server after configuration changes
5. Check server logs for MCP initialization errors

## Important Notes

1. **Type Safety**: Keep TypeScript strict mode enabled. The codebase uses proper types throughout.

2. **Path Alias**: `@/*` maps to `src/*` - use absolute imports from `src/`.

3. **State Reducers**: Default reducer appends to arrays. Custom fields need custom reducers.

4. **Thread IDs**: Use consistent `thread_id` values to maintain conversation context across requests.

5. **Tool Discovery**: Agent automatically discovers tools from `src/agent/tools/index.ts` exports.

6. **Memory Backends**: MemorySaver is development-only. Use SQLite or PostgreSQL for production.

7. **Package.json Legacy**: Scripts reference Python setup (`install:agent`, `dev:agent`) but actual implementation is TypeScript-only. These may fail safely.
