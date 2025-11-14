import { MemorySaver } from "@langchain/langgraph";
// import { SqliteSaver } from "@langchain/langgraph/checkpoint/sqlite";
// import { PostgresSaver } from "@langchain/langgraph/checkpoint/postgres";

console.log('🧠 [MEMORY] memory.ts module loading...');
console.log('🧠 [MEMORY] Available checkpointers imported');
console.log('🧠 [MEMORY] MemorySaver:', typeof MemorySaver);

/**
 * Memory/Checkpointer Configuration
 *
 * LangGraph uses checkpointers to persist state between graph executions.
 * This enables:
 * - Conversation history across sessions
 * - State recovery after failures
 * - Multi-turn conversations
 *
 * Available checkpointers:
 * - MemorySaver: In-memory (development only, lost on restart)
 * - SqliteSaver: SQLite database (good for single-server production)
 * - PostgresSaver: PostgreSQL (good for distributed systems)
 * - Custom: Implement BaseCheckpointSaver interface
 */

console.log('🧠 [MEMORY] Reading environment configuration...');
console.log('🧠 [MEMORY] AGENT_MEMORY_TYPE:', process.env.AGENT_MEMORY_TYPE);

/**
 * Creates a checkpointer based on environment configuration
 *
 * @returns Checkpointer instance
 */
export function createCheckpointer() {
  console.log('🧠 [MEMORY] createCheckpointer() called');

  const memoryType = process.env.AGENT_MEMORY_TYPE || "memory";
  console.log('🧠 [MEMORY] Resolved memory type:', memoryType);

  try {
    switch (memoryType) {
      case "memory":
        console.log('🧠 [MEMORY] Creating MemorySaver checkpointer...');
        // In-memory checkpointer (development)
        const memorySaver = new MemorySaver();
        console.log('🧠 [MEMORY] MemorySaver created successfully');
        console.log('🧠 [MEMORY] MemorySaver type:', typeof memorySaver);
        return memorySaver;

      // case "sqlite":
      //   // SQLite checkpointer (production - single server)
      //   // Requires: bun add better-sqlite3
      //   // import Database from "better-sqlite3";
      //   // const db = new Database("agent_memory.db");
      //   // return new SqliteSaver(db);
      //   throw new Error("SQLite checkpointer not configured. Install better-sqlite3 and uncomment code.");

      // case "postgres":
      //   // PostgreSQL checkpointer (production - distributed)
      //   // Requires: bun add pg
      //   // import { Pool } from "pg";
      //   // const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      //   // return new PostgresSaver(pool);
      //   throw new Error("PostgreSQL checkpointer not configured. Install pg and uncomment code.");

      default:
        console.warn(`🧠 [MEMORY] Unknown memory type: ${memoryType}, using MemorySaver`);
        const defaultSaver = new MemorySaver();
        console.log('🧠 [MEMORY] Default MemorySaver created');
        return defaultSaver;
    }
  } catch (error) {
    console.error('🧠 [MEMORY] ERROR creating checkpointer:', error);
    console.error('🧠 [MEMORY] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}

console.log('🧠 [MEMORY] Creating default checkpointer instance...');
/**
 * Default checkpointer instance
 */
export const checkpointer = createCheckpointer();
console.log('🧠 [MEMORY] Default checkpointer created successfully');
console.log('🧠 [MEMORY] Checkpointer type:', typeof checkpointer);

