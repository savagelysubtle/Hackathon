import { MemorySaver } from "@langchain/langgraph";
// import { SqliteSaver } from "@langchain/langgraph/checkpoint/sqlite";
// import { PostgresSaver } from "@langchain/langgraph/checkpoint/postgres";

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

/**
 * Creates a checkpointer based on environment configuration
 *
 * @returns Checkpointer instance
 */
export function createCheckpointer() {
  const memoryType = process.env.AGENT_MEMORY_TYPE || "memory";

  switch (memoryType) {
    case "memory":
      // In-memory checkpointer (development)
      return new MemorySaver();

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
      console.warn(`Unknown memory type: ${memoryType}, using MemorySaver`);
      return new MemorySaver();
  }
}

/**
 * Default checkpointer instance
 */
export const checkpointer = createCheckpointer();

