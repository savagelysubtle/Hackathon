import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentStateAnnotation } from "./state";
import { agentNode, toolNode, shouldContinue } from "./nodes";
import { checkpointer } from "./memory";
import type { BaseCheckpointSaver } from "@langchain/langgraph/checkpoint/base";

/**
 * Agent Graph Definition
 *
 * This file defines the LangGraph workflow:
 * 1. START -> agent: Initial user message goes to agent
 * 2. agent -> shouldContinue: Check if tools are needed
 * 3. If "continue": agent -> tools -> agent (loop)
 * 4. If "end": agent -> END (final answer)
 *
 * To customize:
 * - Add new nodes (e.g., validation, filtering, transformation)
 * - Add conditional edges for different scenarios
 * - Add subgraphs for complex workflows
 */

/**
 * Creates and compiles the agent graph
 *
 * @param memoryCheckpointer Optional checkpointer for memory persistence
 * @returns Compiled graph ready for execution
 */
export function createAgentGraph(memoryCheckpointer?: BaseCheckpointSaver) {
  // Create a new StateGraph with our state annotation
  const graph = new StateGraph(AgentStateAnnotation)
    // Add the agent node
    .addNode("agent", agentNode)
    // Add the tool execution node
    .addNode("tools", toolNode)
    // Set the entry point
    .addEdge(START, "agent")
    // Add conditional edge: agent decides whether to use tools
    .addConditionalEdges("agent", shouldContinue, {
      continue: "tools", // If tools are needed, go to tools node
      end: END, // Otherwise, end the graph
    })
    // After tools execute, return to agent
    .addEdge("tools", "agent");

  // Compile the graph with optional checkpointer for memory
  return graph.compile({ checkpointer: memoryCheckpointer });
}

/**
 * Default graph instance with configured checkpointer
 *
 * Uses the checkpointer from memory.ts which is configured via:
 * - Environment variable AGENT_MEMORY_TYPE
 * - Defaults to MemorySaver for development
 *
 * For production, configure AGENT_MEMORY_TYPE and set up the appropriate database.
 */
export const agentGraph = createAgentGraph(checkpointer);

