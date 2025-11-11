import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { research } from "./research";

/**
 * Tool Registry
 *
 * This file exports all available tools for the agent.
 * Tools are automatically discovered and made available to the LLM.
 *
 * To add a new tool:
 * 1. Create a new tool file in this directory (e.g., research.ts)
 * 2. Import and export it here
 * 3. The tool will be automatically available to the agent
 */

// Example: Calculator tool
export const calculator = tool(
  async ({ expression }: { expression: string }) => {
    try {
      // Simple safe evaluation (in production, use a proper expression parser)
      const result = Function(`"use strict"; return (${expression})`)();
      return `Result: ${result}`;
    } catch (error) {
      return `Error calculating: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "calculator",
    description: "Performs basic mathematical calculations. Input should be a valid JavaScript expression.",
    schema: z.object({
      expression: z.string().describe("The mathematical expression to evaluate (e.g., '2 + 2', '10 * 5')"),
    }),
  }
);

// Example: Echo tool
export const echo = tool(
  async ({ text }: { text: string }) => {
    return `Echo: ${text}`;
  },
  {
    name: "echo",
    description: "Echoes back the input text. Useful for testing.",
    schema: z.object({
      text: z.string().describe("The text to echo back"),
    }),
  }
);

// Export all tools as an array
// Add new tools here as you create them
export const tools = [calculator, echo, research];

