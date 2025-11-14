# CopilotKit <> LangGraph TypeScript Starter

This is a starter template for building AI agents using
[LangGraph](https://langchain-ai.github.io/langgraphjs/) (TypeScript) and
[CopilotKit](https://copilotkit.ai). It provides a modern Next.js application
with a modular, extensible LangGraph agent that supports memory, tool
integration, and conversation persistence.

## Prerequisites

- OpenAI API Key (for the LangGraph agent)
- Node.js 20+
- Bun (recommended) or any of the following package managers:
  - pnpm
  - npm
  - yarn

> **Note:** This repository uses `bun` as the primary package manager. While
> other package managers work, `bun` is recommended for the best experience.

## Getting Started

### Step 1: Install dependencies

```bash
# Using bun (recommended)
bun install

# Using npm
npm install

# Using pnpm
pnpm install

# Using yarn
yarn install
```

### Step 2: Set up your environment variables

Create a `.env` file in the root directory with the following content:

```env
OPENAI_API_KEY=sk-...your-openai-key-here...
OPENAI_MODEL=gpt-4o-mini
AGENT_MEMORY_TYPE=memory
```

> **Note:** For production, you can configure persistent memory using
> `AGENT_MEMORY_TYPE=sqlite` or `AGENT_MEMORY_TYPE=postgres`. See the
> [LangGraph Agent README](./src/agent/README.md) for details.

### Step 3: Start the development server

```bash
# Using bun
bun run dev

# Using npm
npm run dev

# Using pnpm
pnpm dev

# Using yarn
yarn dev
```

This will start the Next.js application with the integrated LangGraph agent.

## Using Local Models with LM Studio

This agent supports both OpenAI GPT models and local models via LM Studio for
privacy and cost savings.

### Setting up LM Studio

1. **Download and Install LM Studio**: Visit [lmstudio.ai](https://lmstudio.ai)
   and download the desktop application.

2. **Load a Model**: In LM Studio, download and load a model (e.g., Llama 3.2,
   Mistral, etc.).

3. **Start the Local Server**: In LM Studio, go to "Local Server" tab and click
   "Start Server". The server runs on `http://localhost:1234/v1` by default.

4. **Configure Environment**: Update your `.env` file with LM Studio settings:

```env
# LM Studio Configuration (for local LLM support)
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_API_KEY=lm-studio  # Can be any value for local server
LM_STUDIO_MODEL=local-model  # Will be set to the model loaded in LM Studio
```

### Switching Between Models

You can switch between OpenAI and LM Studio models in your API calls:

#### Using OpenAI (default):

```bash
curl -X POST http://localhost:3000/api/langgraph \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how are you?",
    "model": {"provider": "openai", "modelName": "gpt-4o-mini"}
  }'
```

#### Using LM Studio:

```bash
curl -X POST http://localhost:3000/api/langgraph \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how are you?",
    "model": {"provider": "lmstudio"}
  }'
```

### Testing the Integration

Run the built-in test script to verify both model providers:

```bash
# Test both OpenAI and LM Studio
node scripts/test-models.js

# Test only OpenAI
node scripts/test-models.js openai

# Test only LM Studio
node scripts/test-models.js lmstudio
```

## Available Scripts

The following scripts can be run using your preferred package manager:

- `dev` - Starts the Next.js development server with the LangGraph agent
- `dev:debug` - Starts development server with debug logging enabled
- `dev:ui` - Starts only the Next.js UI server
- `build` - Builds the Next.js application for production
- `start` - Starts the production server
- `lint` - Runs ESLint for code linting

## Architecture

### Single-Server Architecture

The application runs a single Next.js server that includes:

- **Next.js UI** (port 3000): Frontend with React, CopilotKit, and TailwindCSS
- **LangGraph Agent** (TypeScript): Integrated agent running within the Next.js
  API routes

### Communication Flow

1. Frontend (Next.js) → `/api/copilotkit` or `/api/langgraph` route handler
2. LangGraph agent processes the request with memory and tools
3. Response is returned to the frontend via CopilotKit

### Key Components

#### Frontend (`src/`)

- **`app/page.tsx`**: Main UI with CopilotSidebar, demonstrates CopilotKit
  features
- **`app/api/copilotkit/route.ts`**: Next.js API route for CopilotKit
  integration
- **`app/api/langgraph/route.ts`**: Direct API route for LangGraph agent
- **`components/`**: React components for UI elements
- **`lib/types.ts`**: TypeScript type definitions

#### LangGraph Agent (`src/agent/`)

- **`index.ts`**: Main exports for the agent
- **`state.ts`**: State schema and annotations
- **`nodes.ts`**: Graph nodes (agent, tools, routing)
- **`graph.ts`**: Graph definition and compilation
- **`memory.ts`**: Checkpointer/memory configuration
- **`tools/`**: Tool definitions (calculator, echo, research, etc.)

See [src/agent/README.md](./src/agent/README.md) for detailed documentation on
the agent architecture.

## LangGraph Agent Features

- **Modular Design**: Separated concerns for easy upgrades and extensions
- **Memory Support**: Built-in checkpointer for conversation persistence
- **Tool Integration**: Easy-to-add tool system with automatic discovery
- **Type Safety**: Full TypeScript support with proper types
- **Extensible**: Clear extension points for custom functionality

### Using the Agent

#### Via API Route

```typescript
// POST /api/langgraph
const response = await fetch('/api/langgraph', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello!',
    threadId: 'user-123', // Optional, for conversation continuity
  }),
});

const data = await response.json();
console.log(data.response);
```

#### Direct Import

```typescript
import { agentGraph } from '@/agent';
import { HumanMessage } from '@langchain/core/messages';

const result = await agentGraph.invoke(
  {
    messages: [new HumanMessage('What is 2 + 2?')],
  },
  {
    configurable: {
      thread_id: 'user-123',
    },
  },
);
```

## MCP (Model Context Protocol) Integration

This starter supports MCP servers, allowing you to extend your agent with
additional tools and capabilities.

### Managing MCP Servers

1. **Access Settings**: Click the "Settings" button in the top-right corner of
   the application
2. **Add Server**: Click "Add Server" and fill in the configuration:

   - **Server Name**: Unique identifier for the server
   - **Command**: Executable command (e.g., `deno`, `python`, `node`)
   - **Arguments**: Command arguments (one per line)
   - **Description**: Optional description of what the server does
   - **Environment Variables**: Optional JSON object with environment variables
   - **Enabled**: Toggle to enable/disable the server

3. **Edit/Delete**: Use the buttons next to each server to modify or remove
   configurations

### MCP Configuration File

MCP servers are configured in `data/mcp.json`. The file has the following
structure:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "executable-command",
      "args": ["arg1", "arg2"],
      "enabled": true,
      "description": "Description of the server",
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```

### Example MCP Servers

**Python Execution (Deno-based)**:

```json
{
  "example-python": {
    "command": "deno",
    "args": ["run", "-A", "https://jsr.io/@pydantic/mcp-run-python@latest"],
    "enabled": true,
    "description": "Execute Python code in a sandboxed environment"
  }
}
```

**Local Node.js Server**:

```json
{
  "local-tools": {
    "command": "node",
    "args": ["path/to/your/mcp-server.js"],
    "enabled": true,
    "description": "Custom local MCP server",
    "env": {
      "API_KEY": "your-api-key"
    }
  }
}
```

### Adding MCP Tools to Your Agent

After configuring MCP servers, you can integrate them with your LangGraph agent
by:

1. Loading MCP tools in your agent's tool registry
2. Making them available to the agent's tool node
3. The agent will automatically use them when appropriate

See the [LangGraph Agent README](./src/agent/README.md) for details on adding
tools.

## Extending the Agent

### Adding a New Tool

Create a new tool file in `src/agent/tools/`:

```typescript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const myTool = tool(
  async ({ input }: { input: string }) => {
    // Your tool logic here
    return 'Tool result';
  },
  {
    name: 'my_tool',
    description: 'Description of what the tool does',
    schema: z.object({
      input: z.string().describe('Input description'),
    }),
  },
);
```

Then export it in `src/agent/tools/index.ts`.

See [src/agent/README.md](./src/agent/README.md) for comprehensive extension
guides.

## Documentation

- [LangGraph Agent Documentation](./src/agent/README.md) - Detailed guide to the
  agent architecture and features
- [LangGraph.js Documentation](https://langchain-ai.github.io/langgraphjs/) -
  Official LangGraph TypeScript documentation
- [CopilotKit Documentation](https://docs.copilotkit.ai) - Explore CopilotKit's
  capabilities
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js
  features and API

## Contributing

Feel free to submit issues and enhancement requests! This starter is designed to
be easily extensible.

## License

This project is licensed under the MIT License - see the LICENSE file for
details.

## Troubleshooting

### Agent Connection Issues

If you see "I'm having trouble connecting to my tools", make sure:

1. Your OpenAI API key is set correctly in `.env`
2. The development server started successfully
3. Check the browser console and server logs for errors

### Agent Not Responding

- Check `OPENAI_API_KEY` is set in `.env`
- Verify the model name is correct (`OPENAI_MODEL`)
- Check server console for errors
- Ensure all dependencies are installed: `bun install`

### Memory Not Persisting

- Ensure checkpointer is configured correctly in `src/agent/memory.ts`
- Verify `thread_id` is consistent across requests
- Check database connection (if using persistent storage)
- See [src/agent/README.md](./src/agent/README.md) for memory configuration

### Tools Not Working

- Verify tool is exported in `src/agent/tools/index.ts`
- Check tool schema matches implementation
- Ensure tool function handles errors gracefully
- Check server logs for tool execution errors
