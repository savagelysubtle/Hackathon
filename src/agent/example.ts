/**
 * Example Usage of LangGraph Agent
 *
 * This file demonstrates how to use the LangGraph agent in various scenarios.
 * Run with: bun run src/agent/example.ts
 */

import { agentGraph } from "./index";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Basic example: Single message
 */
async function basicExample() {
  console.log("=== Basic Example ===");

  const result = await agentGraph.invoke(
    {
      messages: [new HumanMessage("What is 2 + 2?")],
    },
    {
      configurable: {
        thread_id: "example-1",
      },
    }
  );

  const lastMessage = result.messages[result.messages.length - 1];
  console.log("User:", "What is 2 + 2?");
  console.log("Agent:", lastMessage.content);
  console.log();
}

/**
 * Conversation example: Multiple turns with memory
 */
async function conversationExample() {
  console.log("=== Conversation Example ===");

  const threadId = "conversation-example";

  // First message
  const result1 = await agentGraph.invoke(
    {
      messages: [new HumanMessage("My name is Alice")],
    },
    {
      configurable: { thread_id: threadId },
    }
  );
  console.log("User:", "My name is Alice");
  console.log("Agent:", result1.messages[result1.messages.length - 1].content);
  console.log();

  // Second message (agent should remember the name)
  const result2 = await agentGraph.invoke(
    {
      messages: [new HumanMessage("What's my name?")],
    },
    {
      configurable: { thread_id: threadId },
    }
  );
  console.log("User:", "What's my name?");
  console.log("Agent:", result2.messages[result2.messages.length - 1].content);
  console.log();
}

/**
 * Tool usage example: Agent using calculator tool
 */
async function toolExample() {
  console.log("=== Tool Usage Example ===");

  const result = await agentGraph.invoke(
    {
      messages: [new HumanMessage("Calculate 15 * 23 + 7")],
    },
    {
      configurable: {
        thread_id: "tool-example",
      },
    }
  );

  console.log("User:", "Calculate 15 * 23 + 7");
  console.log("Agent:", result.messages[result.messages.length - 1].content);
  console.log();

  // Show tool calls if any
  const toolCalls = result.messages.filter(
    (msg) => msg.constructor.name === "AIMessage" && "tool_calls" in msg && msg.tool_calls?.length
  );
  if (toolCalls.length > 0) {
    console.log("Tool calls made:", toolCalls.length);
  }
}

/**
 * Streaming example: Stream responses in real-time
 */
async function streamingExample() {
  console.log("=== Streaming Example ===");

  const stream = await agentGraph.stream(
    {
      messages: [new HumanMessage("Tell me a short joke")],
    },
    {
      configurable: {
        thread_id: "streaming-example",
      },
    }
  );

  console.log("User:", "Tell me a short joke");
  console.log("Agent (streaming):");

  for await (const chunk of stream) {
    // Process each chunk
    if (chunk.agent) {
      const messages = chunk.agent.messages;
      if (messages && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.content) {
          process.stdout.write(lastMsg.content as string);
        }
      }
    }
  }
  console.log("\n");
}

/**
 * Main function to run all examples
 */
async function main() {
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable is not set");
    console.error("Please set it before running examples:");
    console.error("  export OPENAI_API_KEY=your-api-key");
    process.exit(1);
  }

  try {
    await basicExample();
    await conversationExample();
    await toolExample();
    // await streamingExample(); // Uncomment to test streaming
  } catch (error) {
    console.error("Error running examples:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  main();
}




