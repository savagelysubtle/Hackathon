import {
  AIMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { AgentState } from './state';
import { tools } from './tools';

/**
 * Model Configuration Types
 */
export type ModelProvider = 'openai' | 'lmstudio';

export interface ModelConfig {
  provider: ModelProvider;
  temperature?: number;
  modelName?: string;
}

/**
 * Creates a configured LLM model based on the provider
 *
 * @param config Model configuration
 * @returns Configured ChatOpenAI instance
 */
export function createModel(config: ModelConfig = { provider: 'openai' }) {
  const temperature = config.temperature ?? 0.7;

  switch (config.provider) {
    case 'lmstudio':
      const lmStudioModel = new ChatOpenAI({
        modelName:
          config.modelName || process.env.LM_STUDIO_MODEL || 'local-model',
        temperature,
        openAIApiKey: process.env.LM_STUDIO_API_KEY || 'lm-studio',
        configuration: {
          baseURL: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1',
        },
        // Explicitly enable function calling for LM Studio models
        // Some models may need this configuration
        modelKwargs: {
          // Force function calling if model supports it
        },
      });
      console.log('🤖 [CREATE_MODEL] LM Studio model configured:', {
        modelName: lmStudioModel.modelName,
        baseURL: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1',
        temperature,
      });
      return lmStudioModel;

    case 'openai':
    default:
      return new ChatOpenAI({
        modelName:
          config.modelName || process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature,
      });
  }
}

/**
 * Agent Node
 *
 * This node handles the main agent logic:
 * 1. Receives the current state
 * 2. Calls the LLM with available tools
 * 3. Returns the updated state with the LLM's response
 *
 * To customize:
 * - Change the model via configuration (OpenAI, LM Studio, etc.)
 * - Modify the system prompt
 * - Adjust temperature and other model parameters
 */
export async function agentNode(
  state: AgentState,
  config?: { configurable?: { model?: ModelConfig } },
): Promise<Partial<AgentState>> {
  console.log('🤖 [AGENT_NODE] Agent node called with state:', {
    messageCount: state.messages.length,
    lastMessageType:
      state.messages[state.messages.length - 1]?.constructor.name,
    lastMessagePreview:
      (state.messages[state.messages.length - 1]?.content as string)?.substring(
        0,
        100,
      ) + '...',
  });

  // Get model configuration from config or use defaults
  const modelConfig = config?.configurable?.model || {
    provider: 'openai' as ModelProvider,
  };

  console.log('🤖 [AGENT_NODE] Using model config:', {
    provider: modelConfig.provider,
    modelName: modelConfig.modelName,
    temperature: modelConfig.temperature,
  });

  try {
    // Initialize the LLM model
    // Supports OpenAI, LM Studio, and other providers via LangChain
    console.log('🤖 [AGENT_NODE] Creating model instance');
    console.log('🤖 [AGENT_NODE] Available tools:', {
      count: tools.length,
      names: tools.map((t) => t.name),
      toolDetails: tools.map((t) => ({
        name: t.name,
        description: t.description,
        // Log tool schema to verify format
        hasSchema: !!t.schema,
      })),
    });

    // Create model and bind tools
    const baseModel = createModel(modelConfig);
    const baseModelWithName = baseModel as ChatOpenAI & { modelName?: string };
    console.log('🤖 [AGENT_NODE] Base model created:', {
      provider: modelConfig.provider,
      modelName: baseModelWithName.modelName || 'unknown',
    });

    // Bind tools to the model
    // According to LangGraph docs, this should enable tool calling
    // For LM Studio, we may need to ensure the model supports function calling
    console.log('🤖 [AGENT_NODE] Binding tools to model...');
    console.log(
      '🤖 [AGENT_NODE] Tool details:',
      tools.map((t) => ({
        name: t.name,
        description: t.description,
        schemaType: t.schema?.constructor?.name,
      })),
    );

    const model = baseModel.bindTools(tools);
    console.log('🤖 [AGENT_NODE] Model created and bound with tools:', {
      toolCount: tools.length,
      toolNames: tools.map((t) => t.name),
    });

    // For LM Studio models, verify function calling is enabled
    if (modelConfig.provider === 'lmstudio') {
      console.log(
        '🤖 [AGENT_NODE] LM Studio model detected - verifying function calling support',
      );
      // LM Studio models need to support function calling
      // The model should return tool_calls in the response if it supports it
    }

    // Prepare messages with system prompt if needed
    // Check if any message is already a system message
    const hasSystemMessage = state.messages.some(
      (msg) => msg instanceof SystemMessage,
    );

    const messagesToSend = hasSystemMessage
      ? state.messages
      : [
          new SystemMessage(
            `You are a helpful AI assistant with access to various tools including:
- Calculator: For mathematical calculations
- Research: For web research and information gathering
- CoinGecko Tools: For cryptocurrency data including:
  * get_crypto_prices: Get current prices for cryptocurrencies (use coin IDs like 'bitcoin', 'ethereum')
  * get_trending_coins: Get trending cryptocurrencies
  * get_market_data: Get comprehensive market data for multiple coins
  * get_coin_info: Get detailed information about a specific cryptocurrency
  * search_coins: Search for cryptocurrencies by name or symbol

When users ask about cryptocurrency prices, market data, or crypto-related questions, use the appropriate CoinGecko tools to fetch real-time data. Always use get_crypto_prices for price queries.`,
          ),
          ...state.messages,
        ];

    // Call the model with the current conversation history
    console.log('🤖 [AGENT_NODE] Invoking model with messages');
    const lastMsgContent = messagesToSend[messagesToSend.length - 1]?.content;
    const lastMsgPreview =
      typeof lastMsgContent === 'string'
        ? lastMsgContent.substring(0, 100)
        : 'non-string content';
    console.log('🤖 [AGENT_NODE] Messages being sent:', {
      count: messagesToSend.length,
      types: messagesToSend.map((m) => m.constructor.name),
      lastMessage: lastMsgPreview,
    });

    const response = await model.invoke(messagesToSend);

    // Enhanced logging for tool calls
    const responseWithToolCalls = response as AIMessage & {
      tool_calls?: Array<{ name: string; id: string; args: unknown }>;
    };

    console.log('🤖 [AGENT_NODE] Model response received:', {
      responseType: response.constructor.name,
      isAIMessage: response instanceof AIMessage,
      hasToolCalls: !!responseWithToolCalls.tool_calls,
      toolCallCount: responseWithToolCalls.tool_calls?.length || 0,
      contentLength: (response.content as string)?.length || 0,
      responseKeys: Object.keys(response),
    });

    // Log tool calls in detail if they exist
    if (
      responseWithToolCalls.tool_calls &&
      responseWithToolCalls.tool_calls.length > 0
    ) {
      console.log('🔧 [AGENT_NODE] Tool calls detected:', {
        count: responseWithToolCalls.tool_calls.length,
        calls: responseWithToolCalls.tool_calls.map((tc) => ({
          name: tc.name,
          id: tc.id,
          args: tc.args,
        })),
      });
    } else {
      console.log('⚠️ [AGENT_NODE] No tool calls in response');
      console.log(
        '⚠️ [AGENT_NODE] Response content preview:',
        (response.content as string)?.substring(0, 500),
      );

      // Check if response has any tool-related properties
      const responseObj = response as unknown as Record<string, unknown>;
      console.log(
        '⚠️ [AGENT_NODE] All response properties:',
        Object.keys(responseObj),
      );
      if ('tool_calls' in responseObj) {
        console.log(
          '⚠️ [AGENT_NODE] tool_calls property exists but is:',
          responseObj.tool_calls,
        );
      }
    }

    // Return the updated state with the model's response
    const result = {
      messages: [response],
    };

    console.log('🤖 [AGENT_NODE] Returning agent response');
    return result;
  } catch (error) {
    console.error('❌ [AGENT_NODE] Error in agent processing:', error);
    throw error;
  }
}

/**
 * Tool Execution Node
 *
 * This node executes tools when the agent requests them.
 * Custom implementation with detailed logging for debugging.
 *
 * To customize:
 * - Add custom tool execution logic
 * - Add tool result filtering/transformation
 * - Add error handling for specific tools
 */
export async function toolNode(
  state: AgentState,
): Promise<Partial<AgentState>> {
  console.log('🔧 [TOOL_NODE] Tool node called');

  const lastMessage = state.messages[state.messages.length - 1];

  if (
    !(lastMessage instanceof AIMessage) ||
    !lastMessage.tool_calls ||
    lastMessage.tool_calls.length === 0
  ) {
    console.log('🔧 [TOOL_NODE] No tool calls found, returning empty result');
    return {};
  }

  console.log('🔧 [TOOL_NODE] Processing tool calls:', {
    toolCallCount: lastMessage.tool_calls.length,
    toolNames: lastMessage.tool_calls.map((tc) => tc.name),
  });

  const toolResults = [];

  for (const toolCall of lastMessage.tool_calls) {
    console.log('🔧 [TOOL_NODE] Executing tool:', toolCall.name);
    try {
      // Find the tool by name
      const tool = tools.find((t) => t.name === toolCall.name);
      if (!tool) {
        console.error(`🔧 [TOOL_NODE] Tool not found:`, toolCall.name);
        const errorResult = new ToolMessage({
          content: `Error: Tool '${toolCall.name || 'unknown'}' not found`,
          tool_call_id: toolCall.id || '',
          name: toolCall.name || 'unknown',
        });
        toolResults.push(errorResult);
        continue;
      }

      // Execute the tool
      console.log('🔧 [TOOL_NODE] Invoking tool with args:', toolCall.args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (tool as any).invoke(toolCall.args);

      console.log('🔧 [TOOL_NODE] Tool execution successful:', {
        toolName: toolCall.name,
        resultType: typeof result,
        resultLength:
          typeof result === 'string'
            ? result.length
            : JSON.stringify(result).length,
      });

      const toolResult = new ToolMessage({
        content: typeof result === 'string' ? result : JSON.stringify(result),
        tool_call_id: toolCall.id || '',
        name: toolCall.name || 'unknown',
      });

      toolResults.push(toolResult);
    } catch (error) {
      console.error(
        '❌ [TOOL_NODE] Error executing tool',
        toolCall.name,
        ':',
        error,
      );
      const errorResult = new ToolMessage({
        content: `Error executing tool '${toolCall.name || 'unknown'}': ${
          error instanceof Error ? error.message : String(error)
        }`,
        tool_call_id: toolCall.id || '',
        name: toolCall.name || 'unknown',
      });
      toolResults.push(errorResult);
    }
  }

  console.log('🔧 [TOOL_NODE] Tool execution completed, returning results:', {
    resultCount: toolResults.length,
  });

  return {
    messages: toolResults,
  };
}

/**
 * Should Continue Function
 *
 * Determines whether to continue the graph execution or end.
 * Returns:
 * - "continue" if the agent called tools (needs to process tool results)
 * - "end" if the agent provided a final answer
 *
 * To customize:
 * - Add custom routing logic
 * - Add conditional branches for different scenarios
 */
export function shouldContinue(state: AgentState): 'continue' | 'end' {
  console.log('🔀 [SHOULD_CONTINUE] Evaluating continuation condition');

  const lastMessage = state.messages[state.messages.length - 1];
  console.log(
    '🔀 [SHOULD_CONTINUE] Last message type:',
    lastMessage?.constructor.name,
  );

  // If the last message has tool calls, continue to tool execution
  if (
    lastMessage instanceof AIMessage &&
    lastMessage.tool_calls &&
    lastMessage.tool_calls.length > 0
  ) {
    console.log(
      '🔀 [SHOULD_CONTINUE] Tool calls detected, continuing to tool execution:',
      {
        toolCallCount: lastMessage.tool_calls.length,
      },
    );
    return 'continue';
  }

  // Otherwise, end the graph execution
  console.log('🔀 [SHOULD_CONTINUE] No tool calls, ending graph execution');
  return 'end';
}
