import { AgentState } from "./state";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tools } from "./tools";

/**
 * Agent Node
 *
 * This node handles the main agent logic:
 * 1. Receives the current state
 * 2. Calls the LLM with available tools
 * 3. Returns the updated state with the LLM's response
 *
 * To customize:
 * - Change the model (ChatOpenAI, ChatAnthropic, etc.)
 * - Modify the system prompt
 * - Adjust temperature and other model parameters
 */
export async function agentNode(state: AgentState): Promise<Partial<AgentState>> {
  // Initialize the LLM model
  // Supports OpenAI, Anthropic, and other providers via LangChain
  const model = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.7,
  }).bindTools(tools);

  // Get the last message (user input)
  const lastMessage = state.messages[state.messages.length - 1];

  // Call the model with the current conversation history
  const response = await model.invoke(state.messages);

  // Return the updated state with the model's response
  return {
    messages: [response],
  };
}

/**
 * Tool Execution Node
 *
 * This node executes tools when the agent requests them.
 * Uses LangGraph's prebuilt ToolNode for automatic tool execution.
 *
 * To customize:
 * - Add custom tool execution logic
 * - Add tool result filtering/transformation
 * - Add error handling for specific tools
 */
export const toolNode = new ToolNode(tools);

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
export function shouldContinue(state: AgentState): "continue" | "end" {
  const lastMessage = state.messages[state.messages.length - 1];

  // If the last message has tool calls, continue to tool execution
  if (
    lastMessage instanceof AIMessage &&
    lastMessage.tool_calls &&
    lastMessage.tool_calls.length > 0
  ) {
    return "continue";
  }

  // Otherwise, end the graph execution
  return "end";
}




