import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import {
  getCoinInfo,
  getCryptoPrices,
  getMarketData,
  getTrendingCoins,
  searchCoins,
} from './coingecko';
import { research } from './research';

console.log('🛠️ [TOOLS] tools/index.ts module loading...');
console.log('🛠️ [TOOLS] Importing tool dependencies...');

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

console.log('🛠️ [TOOLS] Creating calculator tool...');
// Example: Calculator tool
export const calculator = tool(
  async ({ expression }: { expression: string }) => {
    console.log('🧮 [CALCULATOR] Tool called with expression:', expression);
    try {
      // Simple safe evaluation (in production, use a proper expression parser)
      const result = Function(`"use strict"; return (${expression})`)();
      console.log(
        '🧮 [CALCULATOR] Calculation successful:',
        expression,
        '=',
        result,
      );
      return `Result: ${result}`;
    } catch (error) {
      console.error('🧮 [CALCULATOR] Calculation error:', error);
      return `Error calculating: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
  {
    name: 'calculator',
    description:
      'Performs basic mathematical calculations. Input should be a valid JavaScript expression.',
    schema: z.object({
      expression: z
        .string()
        .describe(
          "The mathematical expression to evaluate (e.g., '2 + 2', '10 * 5')",
        ),
    }),
  },
);

console.log('🛠️ [TOOLS] Calculator tool created');

console.log('🛠️ [TOOLS] Creating echo tool...');
// Example: Echo tool
export const echo = tool(
  async ({ text }: { text: string }) => {
    console.log('🔊 [ECHO] Tool called with text:', text);
    const result = `Echo: ${text}`;
    console.log('🔊 [ECHO] Returning:', result);
    return result;
  },
  {
    name: 'echo',
    description: 'Echoes back the input text. Useful for testing.',
    schema: z.object({
      text: z.string().describe('The text to echo back'),
    }),
  },
);

console.log('🛠️ [TOOLS] Echo tool created');

console.log('🛠️ [TOOLS] Importing research tool...');
console.log('🛠️ [TOOLS] Research tool imported:', !!research);

console.log('🛠️ [TOOLS] Importing CoinGecko tools...');
console.log('🛠️ [TOOLS] getCryptoPrices imported:', !!getCryptoPrices);
console.log('🛠️ [TOOLS] getTrendingCoins imported:', !!getTrendingCoins);
console.log('🛠️ [TOOLS] getMarketData imported:', !!getMarketData);
console.log('🛠️ [TOOLS] getCoinInfo imported:', !!getCoinInfo);
console.log('🛠️ [TOOLS] searchCoins imported:', !!searchCoins);

// Export all tools as an array
// Add new tools here as you create them
console.log('🛠️ [TOOLS] Creating tools array...');
export const tools = [
  calculator,
  echo,
  research,
  getCryptoPrices,
  getTrendingCoins,
  getMarketData,
  getCoinInfo,
  searchCoins,
];

console.log('🛠️ [TOOLS] Tools array created with', tools.length, 'tools');
console.log(
  '🛠️ [TOOLS] Tool names:',
  tools.map((t) => t.name),
);
console.log('🛠️ [TOOLS] All tools initialized and ready');
