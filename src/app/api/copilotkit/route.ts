import { tools } from '@/agent';
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Convert LangChain tools to OpenAI function format for CopilotKit
console.log(
  '🔧 [COPILOTKIT_API] Converting LangGraph tools to OpenAI function format...',
);
const openAIFunctions = tools.map((langTool) => {
  const toolName = langTool.name;
  const toolDescription = langTool.description || `Tool: ${toolName}`;

  // Extract schema properties
  const schema = langTool.schema as unknown;
  let properties: Record<string, { type: string; description?: string }> = {};
  const required: string[] = [];

  // Try to extract Zod schema structure
  if (schema && typeof schema === 'object' && '_def' in schema) {
    const zodDef = (
      schema as { _def?: { shape?: () => Record<string, unknown> } }
    )._def;
    if (zodDef?.shape) {
      const shape = zodDef.shape();
      properties = Object.keys(shape).reduce((acc, key) => {
        const field = shape[key] as {
          _def?: { typeName?: string; description?: string };
        };
        const typeName = field._def?.typeName || '';
        let type = 'string';
        if (typeName.includes('String')) type = 'string';
        else if (typeName.includes('Number')) type = 'number';
        else if (typeName.includes('Boolean')) type = 'boolean';

        acc[key] = {
          type,
          description: field._def?.description || key,
        };
        required.push(key);
        return acc;
      }, {} as Record<string, { type: string; description?: string }>);
    }
  }

  console.log(`🔧 [COPILOTKIT_API] Converted tool: ${toolName}`, {
    description: toolDescription,
    parameters: Object.keys(properties).length,
  });

  return {
    type: 'function' as const,
    function: {
      name: toolName,
      description: toolDescription,
      parameters: {
        type: 'object',
        properties,
        required,
      },
    },
  };
});

console.log(
  '✅ [COPILOTKIT_API] Converted',
  openAIFunctions.length,
  'tools to OpenAI function format',
);
console.log(
  '🔧 [COPILOTKIT_API] Tool names:',
  openAIFunctions.map((f) => f.function.name),
);

// Create a map of tool handlers for server-side execution
const toolHandlers = new Map<
  string,
  (args: Record<string, unknown>) => Promise<unknown>
>();

// Register tool handlers for LangGraph tools
console.log('🔧 [COPILOTKIT_API] Registering LangGraph tool handlers...');
tools.forEach((langTool) => {
  const toolName = langTool.name;
  toolHandlers.set(toolName, async (args: Record<string, unknown>) => {
    console.log(`🔧 [COPILOTKIT_API] Tool ${toolName} called with args:`, args);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (langTool as any).invoke(args);
      console.log(
        `✅ [COPILOTKIT_API] Tool ${toolName} executed successfully, result length:`,
        typeof result === 'string'
          ? result.length
          : JSON.stringify(result).length,
      );
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      console.error(
        `❌ [COPILOTKIT_API] Error executing tool ${toolName}:`,
        error,
      );
      throw error;
    }
  });
  console.log(`✅ [COPILOTKIT_API] Registered handler for tool: ${toolName}`);
});

console.log(
  `✅ [COPILOTKIT_API] Registered ${toolHandlers.size} tool handlers`,
);

// Create base OpenAI client configured for LM Studio
const baseOpenAI = new OpenAI({
  apiKey: process.env.LM_STUDIO_API_KEY || 'lm-studio',
  baseURL: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1',
});

// Create a wrapper around OpenAI client that automatically includes tools
// This ensures tools are available to the LLM when making chat completion requests

const openai = new Proxy(baseOpenAI, {
  get(target, prop) {
    if (prop === 'chat' && target.chat) {
      return new Proxy(target.chat, {
        get(chatTarget, chatProp) {
          if (chatProp === 'completions' && chatTarget.completions) {
            return new Proxy(chatTarget.completions, {
              get(completionsTarget, completionsProp) {
                if (completionsProp === 'create') {
                  return async (
                    params: Parameters<typeof chatTarget.completions.create>[0],
                  ) => {
                    // Add tools to the request if not already present
                    const requestParams = {
                      ...params,
                      tools: openAIFunctions,
                    };
                    return chatTarget.completions.create(requestParams);
                  };
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (completionsTarget as any)[completionsProp];
              },
            });
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (chatTarget as any)[chatProp];
        },
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target as any)[prop];
  },
});

// Create OpenAIAdapter for LM Studio
// Note: Tools are automatically included via the Proxy wrapper above
const serviceAdapter = new OpenAIAdapter({
  openai,
  model: process.env.LM_STUDIO_MODEL || 'qwen/qwen3-vl-30b',
  keepSystemRole: true,
  disableParallelToolCalls: true,
});

// Create the CopilotRuntime instance
const runtime = new CopilotRuntime();

// Build the Next.js API route handler
export const POST = async (req: NextRequest) => {
  try {
    // Clone the request so we can read the body multiple times if needed
    const clonedReq = req.clone();
    const body = await clonedReq.json().catch(() => ({}));

    // Check if this is a tool/function call request
    // CopilotKit sends tool calls in the request body
    if (body.messages && Array.isArray(body.messages)) {
      const lastMessage = body.messages[body.messages.length - 1];

      // Check if the last message contains tool calls
      if (lastMessage?.tool_calls && Array.isArray(lastMessage.tool_calls)) {
        console.log(
          `🔧 [COPILOTKIT_API] Intercepted ${lastMessage.tool_calls.length} tool call(s)`,
        );

        // Execute tool calls
        const toolResults = await Promise.all(
          lastMessage.tool_calls.map(
            async (toolCall: {
              id: string;
              function: { name: string; arguments: string };
            }) => {
              const toolName = toolCall.function.name;
              const handler = toolHandlers.get(toolName);

              if (!handler) {
                console.warn(
                  `⚠️ [COPILOTKIT_API] No handler found for tool: ${toolName}`,
                );
                return {
                  tool_call_id: toolCall.id,
                  role: 'tool' as const,
                  name: toolName,
                  content: `Error: Tool ${toolName} not found`,
                };
              }

              try {
                const args = JSON.parse(toolCall.function.arguments);
                const result = await handler(args);
                return {
                  tool_call_id: toolCall.id,
                  role: 'tool' as const,
                  name: toolName,
                  content:
                    typeof result === 'string'
                      ? result
                      : JSON.stringify(result),
                };
              } catch (error) {
                console.error(
                  `❌ [COPILOTKIT_API] Error executing tool ${toolName}:`,
                  error,
                );
                return {
                  tool_call_id: toolCall.id,
                  role: 'tool' as const,
                  name: toolName,
                  content: `Error: ${
                    error instanceof Error ? error.message : String(error)
                  }`,
                };
              }
            },
          ),
        );

        // Add tool results to messages and continue the conversation
        body.messages = [...body.messages, ...toolResults];

        // Create a new request with updated body
        const updatedReq = new NextRequest(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(body),
        });

        const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
          runtime,
          serviceAdapter,
          endpoint: '/api/copilotkit',
        });
        return await handleRequest(updatedReq);
      }
    }

    // For non-tool-call requests, handle normally
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: '/api/copilotkit',
    });
    return await handleRequest(req);
  } catch (error) {
    console.error('❌ [COPILOTKIT_API] Error in POST handler:', error);
    // Fallback to normal handling
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: '/api/copilotkit',
    });
    return await handleRequest(req);
  }
};

// Handle GET requests for GraphQL introspection
export const GET = async (req: NextRequest) => {
  console.log(
    '🔍 [COPILOTKIT_API] Received GET request (GraphQL introspection)',
  );

  try {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: '/api/copilotkit',
    });

    return await handleRequest(req);
  } catch (error) {
    console.error('❌ [COPILOTKIT_API] Error handling GET request:', error);
    return NextResponse.json(
      {
        error: 'Failed to handle request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
};
