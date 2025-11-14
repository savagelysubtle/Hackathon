console.log('🤖 [AGENT] index.ts module loading...');

/**
 * LangGraph Agent Module
 *
 * This module exports the main agent components:
 * - Graph: The compiled agent graph ready for execution
 * - Types: State types and interfaces
 * - Utilities: Helper functions for working with the agent
 *
 * Usage:
 * ```typescript
 * import { agentGraph } from "@/agent";
 *
 * const result = await agentGraph.invoke({
 *   messages: [new HumanMessage("Hello!")],
 * }, {
 *   configurable: { thread_id: "user-123" },
 * });
 * ```
 */

console.log('🤖 [AGENT] Exporting agentGraph and createAgentGraph...');
export { agentGraph, createAgentGraph } from './graph';
export { checkpointer, createCheckpointer } from './memory';
export {
  agentNode,
  createModel,
  shouldContinue,
  toolNode,
  type ModelConfig,
  type ModelProvider,
} from './nodes';
export { AgentStateAnnotation, type AgentState } from './state';
export { tools } from './tools';

console.log('🤖 [AGENT] Exporting state types...');

console.log('🤖 [AGENT] Exporting node functions...');

console.log('🤖 [AGENT] Exporting tools...');

console.log('🤖 [AGENT] Exporting memory functions...');

console.log('🤖 [AGENT] All exports completed successfully');
