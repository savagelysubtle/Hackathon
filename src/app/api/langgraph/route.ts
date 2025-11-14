import type { ModelConfig } from '@/agent';
import { agentGraph } from '@/agent';
import { apiLogger, createAPIContext, withTiming } from '@/lib/api-logger';
import { HumanMessage } from '@langchain/core/messages';
import { NextRequest, NextResponse } from 'next/server';

console.log('📨 [LANGGRAPH_API] langgraph/route.ts module loading...');

/**
 * LangGraph Agent API Route
 *
 * This API route handles requests to the LangGraph agent.
 * It processes user messages and returns agent responses.
 *
 * Request body:
 * {
 *   message: string;           // User message
 *   threadId?: string;         // Optional thread ID for conversation continuity
 *   model?: {                  // Optional model configuration
 *     provider: "openai" | "lmstudio";  // Model provider
 *     modelName?: string;     // Specific model name
 *     temperature?: number;   // Model temperature (0.0-1.0)
 *   }
 * }
 *
 * Response:
 * {
 *   response: string;          // Agent's response
 *   threadId: string;          // Thread ID for future requests
 *   model: ModelConfig;        // Model used for this request
 * }
 */
export async function POST(req: NextRequest) {
  const context = createAPIContext('langgraph', 'POST', '/api/langgraph', req);
  const requestStartTime = Date.now();

  console.log('📨 [LANGGRAPH_API] Received request from CopilotKit');

  try {
    apiLogger.logRequestStart(context);

    // Parse request body
    console.log('📨 [LANGGRAPH_API] Parsing request body');
    const body = await req.json();
    let { message, threadId, thread_id, model, messages } = body;

    // Handle both formats: direct message and CopilotKit messages array
    if (!message && messages && Array.isArray(messages)) {
      // CopilotKit format: extract last message from messages array
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.content) {
        message = lastMessage.content;
        console.log(
          '📨 [LANGGRAPH_API] Extracted message from CopilotKit format:',
          {
            messageLength: message.length,
            preview:
              message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          },
        );
      }
    }

    // Handle thread_id vs threadId
    const currentThreadId = thread_id || threadId;

    console.log('📨 [LANGGRAPH_API] Parsed message:', {
      messageLength: message?.length || 0,
      hasThreadId: !!currentThreadId,
      modelProvider: model?.provider,
      threadId: currentThreadId?.substring(0, 20) + '...',
      requestFormat: messages ? 'copilotkit' : 'direct',
    });

    apiLogger.info('Request body parsed successfully', context, {
      has_message: !!message,
      message_type: typeof message,
      message_length: message?.length || 0,
      has_thread_id: !!currentThreadId,
      thread_id: currentThreadId,
      has_model_config: !!model,
      model_config: model,
      request_format: messages ? 'copilotkit' : 'direct',
    });

    // Validation
    if (!message || typeof message !== 'string') {
      apiLogger.logValidationError('message', message, 'string', context);
      const errorResponse = apiLogger.createErrorResponse('LGR_VAL_001');
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

    apiLogger.info('Validation passed', context);

    // Generate or use provided thread ID for conversation continuity
    const finalThreadId =
      currentThreadId ||
      `thread-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    apiLogger.info('Thread ID resolved', {
      ...context,
      threadId: finalThreadId,
    });

    // Default model configuration - use LM Studio for CopilotKit requests, OpenAI for direct requests
    const defaultModel: ModelConfig = messages
      ? { provider: 'lmstudio' }
      : { provider: 'openai' };
    const modelConfig: ModelConfig = model || defaultModel;
    apiLogger.info('Model configuration resolved', context, {
      model: modelConfig,
    });

    // Prepare agent invocation
    console.log('🤖 [LANGGRAPH_API] Preparing agent invocation');
    apiLogger.info('Preparing agent invocation', context);
    const humanMessage = new HumanMessage(message);
    console.log('🤖 [LANGGRAPH_API] Created HumanMessage:', {
      type: humanMessage.constructor.name,
      contentLength: humanMessage.content.length,
      preview:
        humanMessage.content.substring(0, 100) +
        (humanMessage.content.length > 100 ? '...' : ''),
    });
    apiLogger.debug('HumanMessage created', context, {
      message_type: humanMessage.constructor.name,
      content_length: humanMessage.content.length,
    });

    const invokePayload = {
      messages: [humanMessage],
    };

    const invokeConfig = {
      configurable: {
        thread_id: finalThreadId,
        model: modelConfig,
      },
    };

    console.log('🤖 [LANGGRAPH_API] Invoking agent graph with config:', {
      threadId: finalThreadId,
      modelProvider: modelConfig.provider,
      modelName: modelConfig.modelName,
    });

    // Invoke the agent graph with timing
    const result = await withTiming(
      'Agent graph invocation',
      context,
      async () => {
        return await agentGraph.invoke(invokePayload, invokeConfig);
      },
    );

    console.log('🤖 [LANGGRAPH_API] Agent graph invocation completed:', {
      hasResult: !!result,
      messageCount: result?.messages?.length || 0,
    });

    apiLogger.info('Agent graph execution completed', context, {
      has_result: !!result,
      messages_count: result?.messages?.length || 0,
      message_types: result?.messages?.map((m) => m.constructor.name) || [],
    });

    // Extract the last message (agent's response)
    console.log('📤 [LANGGRAPH_API] Extracting agent response');
    if (!result || !result.messages || result.messages.length === 0) {
      console.error('❌ [LANGGRAPH_API] No messages in agent result');
      apiLogger.logAPIError('LGR_SYS_002', context);
      const errorResponse = apiLogger.createErrorResponse('LGR_SYS_002');
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

    const lastMessage = result.messages[result.messages.length - 1];
    const response = lastMessage.content as string;

    console.log('📤 [LANGGRAPH_API] Agent response extracted:', {
      responseLength: response.length,
      responsePreview:
        response.substring(0, 200) + (response.length > 200 ? '...' : ''),
      messageType: lastMessage.constructor.name,
    });

    apiLogger.info('Response extracted successfully', context, {
      response_length: response.length,
      response_preview:
        response.substring(0, 200) + (response.length > 200 ? '...' : ''),
    });

    // Prepare response payload
    console.log('📤 [LANGGRAPH_API] Preparing response payload');

    // Handle different response formats based on request format
    let responsePayload;
    if (messages) {
      // CopilotKit format: return messages array
      responsePayload = {
        messages: [
          {
            role: 'assistant',
            content: response,
            id: `msg_${Date.now()}`,
          },
        ],
        thread_id: finalThreadId,
      };
      console.log('📤 [LANGGRAPH_API] Using CopilotKit response format');
    } else {
      // Direct format: return simple response object
      responsePayload = {
        response,
        threadId: finalThreadId,
        model: modelConfig,
        messages: result.messages.map((msg) => ({
          role: msg.constructor.name,
          content: msg.content,
        })),
      };
      console.log('📤 [LANGGRAPH_API] Using direct response format');
    }

    const responseSize = JSON.stringify(responsePayload).length;
    const totalRequestTime = Date.now() - requestStartTime;

    console.log('📤 [LANGGRAPH_API] Sending response back to CopilotKit:', {
      responseSize,
      totalTime: totalRequestTime + 'ms',
      threadId: finalThreadId,
      responseFormat: messages ? 'copilotkit' : 'direct',
    });

    apiLogger.logRequestSuccess(context, totalRequestTime, responseSize);

    console.log('✅ [LANGGRAPH_API] Response sent successfully');
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('❌ [LANGGRAPH_API] Error in request processing:', error);
    const totalRequestTime = Date.now() - requestStartTime;
    apiLogger.logAPIError('LGR_SYS_001', context, error as Error, {
      duration: totalRequestTime,
    });

    const errorResponse = apiLogger.createErrorResponse('LGR_SYS_001', {
      originalError: error instanceof Error ? error.message : String(error),
    });

    console.error('❌ [LANGGRAPH_API] Sending error response:', {
      statusCode: errorResponse.statusCode,
      errorCode: errorResponse.code,
    });

    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

/**
 * GET endpoint for health check
 */
export async function GET(req: NextRequest) {
  const context = createAPIContext('langgraph', 'GET', '/api/langgraph', req);

  try {
    apiLogger.logRequestStart(context);

    const healthResponse = {
      status: 'ok',
      agent: 'LangGraph Agent',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };

    apiLogger.logRequestSuccess(
      context,
      Date.now() - Date.parse(context.requestId!.split('_')[1]),
    );
    return NextResponse.json(healthResponse);
  } catch (error) {
    apiLogger.logAPIError('LGR_SYS_001', context, error as Error);
    const errorResponse = apiLogger.createErrorResponse('LGR_SYS_001');
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}
