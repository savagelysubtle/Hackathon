import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

/**
 * Agent State Schema
 *
 * This defines the state structure for the LangGraph agent.
 * The state is shared across all nodes in the graph.
 *
 * To extend the state:
 * 1. Add new fields to this interface
 * 2. Update the reducer functions if needed
 * 3. Update nodes that need to access the new state
 */
export interface AgentState {
  /**
   * Messages array containing the conversation history
   * Uses addMessages reducer to append new messages
   */
  messages: BaseMessage[];

  /**
   * Optional: Add custom state fields here
   * Example:
   * - researchResults: ResearchResult[];
   * - currentTask: string;
   * - metadata: Record<string, unknown>;
   */
}

/**
 * State Annotation for LangGraph
 *
 * This annotation defines how state is managed:
 * - messages: Uses messagesStateReducer to append messages
 * - Other fields: Use reducer functions or direct assignment
 */
export const AgentStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer, // Use LangGraph's built-in message reducer
    default: () => [],
  }),
  // Add custom state fields with reducers here
  // Example:
  // researchResults: Annotation<ResearchResult[]>({
  //   reducer: (x, y) => [...(x ?? []), ...(y ?? [])],
  // }),
});

