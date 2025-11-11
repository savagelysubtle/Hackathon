# LangGraph Agent Module

A modular, extensible LangGraph TypeScript agent with memory support and tool
integration.

## Architecture

```
src/agent/
├── index.ts          # Main exports
├── state.ts          # State schema and annotations
├── nodes.ts          # Graph nodes (agent, tools, routing)
├── graph.ts          # Graph definition and compilation
├── memory.ts         # Checkpointer/memory configuration
└── tools/            # Tool definitions
    ├── index.ts      # Tool registry
    └── research.ts   # Example research tool
```

## Key Features

- **Modular Design**: Separated concerns for easy upgrades and extensions
- **Memory Support**: Built-in checkpointer for conversation persistence
- **Tool Integration**: Easy-to-add tool system with automatic discovery
- **Type Safety**: Full TypeScript support with proper types
- **Extensible**: Clear extension points for custom functionality

## Usage

### Basic Usage

```typescript
import { agentGraph } from '@/agent';
import { HumanMessage } from '@langchain/core/messages';

// Invoke the agent
const result = await agentGraph.invoke(
  {
    messages: [new HumanMessage('What is 2 + 2?')],
  },
  {
    configurable: {
      thread_id: 'user-123', // For conversation continuity
    },
  },
);

console.log(result.messages[result.messages.length - 1].content);
```

### Via API Route

```typescript
// POST /api/langgraph
const response = await fetch('/api/langgraph', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello!',
    threadId: 'user-123', // Optional
  }),
});

const data = await response.json();
console.log(data.response);
```

## Extending the Agent

### Adding a New Tool

1. Create a new tool file in `tools/`:

```typescript
// src/agent/tools/my-tool.ts
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

2. Export it in `tools/index.ts`:

```typescript
import { myTool } from './my-tool';
export const tools = [calculator, echo, research, myTool];
```

### Adding Custom State Fields

1. Update `state.ts`:

```typescript
export interface AgentState {
  messages: BaseMessage[];
  customField: string; // Add your field
}

export const AgentStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    /* ... */
  }),
  customField: Annotation<string>({
    reducer: (x, y) => y ?? x, // Custom reducer logic
  }),
});
```

2. Update nodes to use the new field:

```typescript
export async function agentNode(
  state: AgentState,
): Promise<Partial<AgentState>> {
  // Access: state.customField
  // Return: { customField: "new value" }
}
```

### Adding New Nodes

1. Create the node function in `nodes.ts`:

```typescript
export async function customNode(
  state: AgentState,
): Promise<Partial<AgentState>> {
  // Your node logic
  return {
    /* updated state */
  };
}
```

2. Add it to the graph in `graph.ts`:

```typescript
const graph = new StateGraph(AgentStateAnnotation)
  .addNode('agent', agentNode)
  .addNode('custom', customNode)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .addEdge('tools', 'agent')
  .addEdge('custom', 'agent'); // Add your edges
```

### Configuring Memory

Update `memory.ts` to use persistent storage:

```typescript
// For SQLite (single server)
import { SqliteSaver } from '@langchain/langgraph/checkpoint/sqlite';
import Database from 'better-sqlite3';

const db = new Database('agent_memory.db');
return new SqliteSaver(db);

// For PostgreSQL (distributed)
import { PostgresSaver } from '@langchain/langgraph/checkpoint/postgres';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
return new PostgresSaver(pool);
```

Set environment variable:

```bash
AGENT_MEMORY_TYPE=sqlite  # or postgres
```

## Environment Variables

```bash
# Required
OPENAI_API_KEY=your-api-key

# Optional
OPENAI_MODEL=gpt-4o-mini          # Default model
AGENT_MEMORY_TYPE=memory          # memory, sqlite, or postgres
DATABASE_URL=postgresql://...     # For PostgreSQL checkpointer
```

## Best Practices

1. **State Management**: Use reducers for complex state updates
2. **Tool Design**: Keep tools focused and single-purpose
3. **Error Handling**: Always handle errors in tool execution
4. **Memory**: Use persistent checkpointers in production
5. **Type Safety**: Leverage TypeScript types throughout

## Troubleshooting

### Agent not responding

- Check `OPENAI_API_KEY` is set
- Verify model name is correct
- Check console for errors

### Memory not persisting

- Ensure checkpointer is configured correctly
- Verify thread_id is consistent across requests
- Check database connection (if using persistent storage)

### Tools not working

- Verify tool is exported in `tools/index.ts`
- Check tool schema matches implementation
- Ensure tool function handles errors gracefully
