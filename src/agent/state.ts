import { BaseMessage } from '@langchain/core/messages';
import { Annotation, messagesStateReducer } from '@langchain/langgraph';

console.log('📊 [STATE] state.ts module loading...');
console.log(
  '📊 [STATE] Importing LangGraph Annotation and messagesStateReducer...',
);

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

console.log('📊 [STATE] AgentState interface defined');

/**
 * State Annotation for LangGraph
 *
 * This annotation defines how state is managed:
 * - messages: Uses messagesStateReducer to append messages
 * - Other fields: Use reducer functions or direct assignment
 */
console.log('📊 [STATE] Creating AgentStateAnnotation...');

export const AgentStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer, // Use LangGraph's built-in message reducer
    default: () => {
      console.log('📊 [STATE] Creating default messages array');
      return [];
    },
  }),
  // Add custom state fields with reducers here
  // Example:
  // researchResults: Annotation<ResearchResult[]>({
  //   reducer: (x, y) => [...(x ?? []), ...(y ?? [])],
  // }),
});

console.log('📊 [STATE] AgentStateAnnotation created successfully');
console.log(
  '📊 [STATE] Annotation fields:',
  Object.keys(AgentStateAnnotation.spec),
);
console.log('📊 [STATE] State management ready');
