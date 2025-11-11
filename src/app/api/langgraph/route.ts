import { NextRequest, NextResponse } from "next/server";
import { agentGraph } from "@/agent";
import { HumanMessage } from "@langchain/core/messages";

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
 * }
 *
 * Response:
 * {
 *   response: string;          // Agent's response
 *   threadId: string;          // Thread ID for future requests
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, threadId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Generate or use provided thread ID for conversation continuity
    const currentThreadId = threadId || `thread-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Invoke the agent graph with the user message
    const result = await agentGraph.invoke(
      {
        messages: [new HumanMessage(message)],
      },
      {
        configurable: {
          thread_id: currentThreadId,
        },
      }
    );

    // Extract the last message (agent's response)
    const lastMessage = result.messages[result.messages.length - 1];
    const response = lastMessage.content as string;

    return NextResponse.json({
      response,
      threadId: currentThreadId,
      messages: result.messages.map((msg) => ({
        role: msg.constructor.name,
        content: msg.content,
      })),
    });
  } catch (error) {
    console.error("LangGraph agent error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    agent: "LangGraph Agent",
    version: "1.0.0",
  });
}


