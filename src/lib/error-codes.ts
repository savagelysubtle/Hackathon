/**
 * Centralized Error Code System for API Failures
 *
 * This file defines standardized error codes used across all API endpoints.
 * Error codes follow the format: [PREFIX][CATEGORY][NUMBER]
 * - Prefix: API endpoint (COP, LGR, MCP)
 * - Category: Error type (VAL=Validation, NET=Network, SYS=System, CFG=Configuration, etc.)
 * - Number: Sequential error number within category
 */

export interface APIError {
  code: string;
  message: string;
  statusCode: number;
  category: string;
  description: string;
  troubleshooting?: readonly string[];
}

/**
 * Error Categories
 */
export enum ErrorCategory {
  VALIDATION = 'VAL',
  NETWORK = 'NET',
  SYSTEM = 'SYS',
  CONFIGURATION = 'CFG',
  AUTHENTICATION = 'AUTH',
  AUTHORIZATION = 'AUTHZ',
  BUSINESS_LOGIC = 'BIZ',
  EXTERNAL_SERVICE = 'EXT',
  RATE_LIMIT = 'RATE',
  UNKNOWN = 'UNK',
}

/**
 * CopilotKit API Error Codes (COP prefix)
 */
export const COPILOTKIT_ERRORS = {
  // Validation Errors (VAL)
  COP_VAL_001: {
    code: 'COP_VAL_001',
    message: 'Invalid message format',
    statusCode: 400,
    category: ErrorCategory.VALIDATION,
    description: 'The message content is not in the expected format',
    troubleshooting: [
      'Ensure message is a valid object with content property',
      'Check if message contains valid text or image content',
      'Verify message structure matches CopilotKitMessage interface',
    ],
  },

  COP_VAL_002: {
    code: 'COP_VAL_002',
    message: 'Missing required message content',
    statusCode: 400,
    category: ErrorCategory.VALIDATION,
    description: 'No message content provided in the request',
    troubleshooting: [
      'Ensure request body contains a messages array',
      'Check that messages array is not empty',
      'Verify message objects have content property',
    ],
  },

  // System Errors (SYS)
  COP_SYS_001: {
    code: 'COP_SYS_001',
    message: 'Agent execution failed',
    statusCode: 500,
    category: ErrorCategory.SYSTEM,
    description: 'Failed to execute the LangGraph agent',
    troubleshooting: [
      'Check agent graph configuration',
      'Verify all agent dependencies are installed',
      'Review agent logs for specific failure details',
    ],
  },

  COP_SYS_002: {
    code: 'COP_SYS_002',
    message: 'Thread ID generation failed',
    statusCode: 500,
    category: ErrorCategory.SYSTEM,
    description: 'Unable to generate conversation thread ID',
    troubleshooting: [
      'Check system entropy/random number generation',
      'Verify timestamp generation is working',
      'Ensure sufficient memory for string operations',
    ],
  },

  // Network/External Service Errors (NET)
  COP_NET_001: {
    code: 'COP_NET_001',
    message: 'OpenAI API request failed',
    statusCode: 502,
    category: ErrorCategory.NETWORK,
    description: 'Failed to communicate with OpenAI vision API',
    troubleshooting: [
      'Check OpenAI API key configuration',
      'Verify internet connectivity',
      'Check OpenAI service status',
      'Ensure API key has sufficient credits',
    ],
  },

  COP_NET_002: {
    code: 'COP_NET_002',
    message: 'Image URL inaccessible',
    statusCode: 400,
    category: ErrorCategory.NETWORK,
    description: 'Unable to access the provided image URL',
    troubleshooting: [
      'Verify image URL is publicly accessible',
      'Check URL format and protocol (http/https)',
      'Ensure image is not behind authentication',
      'Check for CORS restrictions',
    ],
  },

  // Business Logic Errors (BIZ)
  COP_BIZ_001: {
    code: 'COP_BIZ_001',
    message: 'Image analysis failed',
    statusCode: 500,
    category: ErrorCategory.BUSINESS_LOGIC,
    description: 'Failed to analyze trading screenshot',
    troubleshooting: [
      'Ensure image contains trading chart data',
      'Check image quality and resolution',
      'Verify image format is supported',
      'Try with a different image',
    ],
  },
} as const;

/**
 * LangGraph API Error Codes (LGR prefix)
 */
export const LANGGRAPH_ERRORS = {
  // Validation Errors (VAL)
  LGR_VAL_001: {
    code: 'LGR_VAL_001',
    message: 'Message is required and must be a string',
    statusCode: 400,
    category: ErrorCategory.VALIDATION,
    description: 'The message parameter is missing or not a valid string',
    troubleshooting: [
      'Ensure request body contains "message" field',
      'Verify message is a non-empty string',
      'Check JSON parsing is working correctly',
    ],
  },

  LGR_VAL_002: {
    code: 'LGR_VAL_002',
    message: 'Invalid thread ID format',
    statusCode: 400,
    category: ErrorCategory.VALIDATION,
    description: 'Thread ID provided is not in the expected format',
    troubleshooting: [
      'Thread ID should be a string',
      'Use previously returned thread IDs',
      'Leave threadId empty for new conversations',
    ],
  },

  // System Errors (SYS)
  LGR_SYS_001: {
    code: 'LGR_SYS_001',
    message: 'Agent graph invocation failed',
    statusCode: 500,
    category: ErrorCategory.SYSTEM,
    description: 'Failed to invoke the LangGraph agent graph',
    troubleshooting: [
      'Check agent graph configuration',
      'Verify agent dependencies are loaded',
      'Review graph compilation errors',
      'Check memory usage and limits',
    ],
  },

  LGR_SYS_002: {
    code: 'LGR_SYS_002',
    message: 'No response generated by agent',
    statusCode: 500,
    category: ErrorCategory.SYSTEM,
    description: 'Agent executed but produced no response messages',
    troubleshooting: [
      'Check agent node implementations',
      'Verify message routing in graph',
      'Review agent prompt configuration',
      'Check for infinite loops in agent logic',
    ],
  },

  LGR_SYS_003: {
    code: 'LGR_SYS_003',
    message: 'Message processing failed',
    statusCode: 500,
    category: ErrorCategory.SYSTEM,
    description: 'Failed to process or convert messages',
    troubleshooting: [
      'Check message format compatibility',
      'Verify message content types',
      'Review message transformation logic',
    ],
  },

  // Configuration Errors (CFG)
  LGR_CFG_001: {
    code: 'LGR_CFG_001',
    message: 'Invalid model configuration',
    statusCode: 400,
    category: ErrorCategory.CONFIGURATION,
    description: 'Model configuration provided is invalid',
    troubleshooting: [
      'Check model provider is supported',
      'Verify model name exists',
      'Ensure temperature is between 0.0 and 1.0',
    ],
  },

  // Network Errors (NET)
  LGR_NET_001: {
    code: 'LGR_NET_001',
    message: 'External service communication failed',
    statusCode: 502,
    category: ErrorCategory.NETWORK,
    description: 'Failed to communicate with external AI service',
    troubleshooting: [
      'Check API key configuration',
      'Verify internet connectivity',
      'Check service availability',
      'Review rate limiting status',
    ],
  },
} as const;

/**
 * MCP API Error Codes (MCP prefix)
 */
export const MCP_ERRORS = {
  // Validation Errors (VAL)
  MCP_VAL_001: {
    code: 'MCP_VAL_001',
    message: 'Server name and configuration are required',
    statusCode: 400,
    category: ErrorCategory.VALIDATION,
    description: 'Missing required fields for MCP server configuration',
    troubleshooting: [
      'Provide both serverName and serverConfig',
      'Ensure serverName is a non-empty string',
      'Check serverConfig object structure',
    ],
  },

  MCP_VAL_002: {
    code: 'MCP_VAL_002',
    message: 'Command is required for server configuration',
    statusCode: 400,
    category: ErrorCategory.VALIDATION,
    description: 'MCP server configuration must include a command',
    troubleshooting: [
      'Add command field to serverConfig',
      'Ensure command points to executable',
      'Check command path is correct',
    ],
  },

  MCP_VAL_003: {
    code: 'MCP_VAL_003',
    message: 'Server name is required',
    statusCode: 400,
    category: ErrorCategory.VALIDATION,
    description: 'Server name parameter is missing',
    troubleshooting: [
      'Provide serverName in query parameters',
      'Use correct parameter name (serverName)',
      'Ensure serverName is URL encoded if needed',
    ],
  },

  // Configuration Errors (CFG)
  MCP_CFG_001: {
    code: 'MCP_CFG_001',
    message: 'Failed to read MCP configuration',
    statusCode: 500,
    category: ErrorCategory.CONFIGURATION,
    description: 'Unable to read MCP configuration file',
    troubleshooting: [
      'Check data/mcp.json file exists',
      'Verify file permissions',
      'Ensure JSON syntax is valid',
      'Check file system access',
    ],
  },

  MCP_CFG_002: {
    code: 'MCP_CFG_002',
    message: 'Failed to write MCP configuration',
    statusCode: 500,
    category: ErrorCategory.CONFIGURATION,
    description: 'Unable to save MCP configuration changes',
    troubleshooting: [
      'Check file system write permissions',
      'Ensure data directory exists',
      'Verify disk space availability',
      'Check for file locks',
    ],
  },

  MCP_CFG_003: {
    code: 'MCP_CFG_003',
    message: 'Server already exists',
    statusCode: 409,
    category: ErrorCategory.CONFIGURATION,
    description: 'Cannot create server with existing name',
    troubleshooting: [
      'Use a unique server name',
      'Check existing servers first',
      'Use PUT to update existing servers',
    ],
  },

  MCP_CFG_004: {
    code: 'MCP_CFG_004',
    message: 'Server not found',
    statusCode: 404,
    category: ErrorCategory.CONFIGURATION,
    description: 'Requested server does not exist',
    troubleshooting: [
      'Check server name spelling',
      'Verify server exists with GET request',
      'Use correct case sensitivity',
    ],
  },

  // System Errors (SYS)
  MCP_SYS_001: {
    code: 'MCP_SYS_001',
    message: 'Failed to create MCP server configuration',
    statusCode: 500,
    category: ErrorCategory.SYSTEM,
    description: 'Unexpected error during server creation',
    troubleshooting: [
      'Check server logs for details',
      'Verify server configuration format',
      'Ensure all required fields are provided',
    ],
  },

  MCP_SYS_002: {
    code: 'MCP_SYS_002',
    message: 'Failed to update MCP server configuration',
    statusCode: 500,
    category: ErrorCategory.SYSTEM,
    description: 'Unexpected error during server update',
    troubleshooting: [
      'Check server exists before updating',
      'Verify configuration format',
      'Check file system permissions',
    ],
  },

  MCP_SYS_003: {
    code: 'MCP_SYS_003',
    message: 'Failed to delete MCP server configuration',
    statusCode: 500,
    category: ErrorCategory.SYSTEM,
    description: 'Unexpected error during server deletion',
    troubleshooting: [
      'Verify server exists',
      'Check file system permissions',
      'Ensure no processes are using the server',
    ],
  },
} as const;

/**
 * Combined error code registry
 */
export const API_ERROR_CODES = {
  ...COPILOTKIT_ERRORS,
  ...LANGGRAPH_ERRORS,
  ...MCP_ERRORS,
} as const;

/**
 * Error code lookup by code string
 */
export function getErrorByCode(code: string): APIError | undefined {
  return API_ERROR_CODES[code as keyof typeof API_ERROR_CODES];
}

/**
 * Get all errors for a specific API
 */
export function getErrorsByAPI(apiPrefix: string): APIError[] {
  return Object.values(API_ERROR_CODES).filter((error) =>
    error.code.startsWith(apiPrefix),
  );
}

/**
 * Get errors by category
 */
export function getErrorsByCategory(category: ErrorCategory): APIError[] {
  return Object.values(API_ERROR_CODES).filter(
    (error) => error.category === category,
  );
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: APIError,
  details?: Record<string, unknown>,
): {
  error: string;
  code: string;
  statusCode: number;
  category: string;
  details?: Record<string, unknown>;
  troubleshooting?: string[];
} {
  return {
    error: error.message,
    code: error.code,
    statusCode: error.statusCode,
    category: error.category,
    details,
    troubleshooting: error.troubleshooting,
  };
}
