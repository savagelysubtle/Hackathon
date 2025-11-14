/**
 * API Logger with Error Codes
 *
 * Centralized logging utility for API endpoints with structured logging,
 * error code integration, and performance tracking.
 */

import { createErrorResponse, getErrorByCode } from './error-codes';

export interface LogContext {
  api: string;
  method: string;
  path: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  api: string;
  code?: string;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  performance?: {
    duration: number;
    memoryUsage?: NodeJS.MemoryUsage;
  };
  [key: string]: unknown;
}

export class APILogger {
  private static instance: APILogger;
  private logs: LogEntry[] = [];
  private maxLogsInMemory = 1000;

  private constructor() {}

  static getInstance(): APILogger {
    if (!APILogger.instance) {
      APILogger.instance = new APILogger();
    }
    return APILogger.instance;
  }

  /**
   * Generate unique request ID
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Create log context for API request
   */
  createContext(
    api: string,
    method: string,
    path: string,
    additionalContext?: Partial<LogContext>,
  ): LogContext {
    return {
      api,
      method,
      path,
      requestId: this.generateRequestId(),
      ...additionalContext,
    };
  }

  /**
   * Log info level message
   */
  info(
    message: string,
    context?: LogContext,
    additionalData?: Record<string, unknown>,
  ): void {
    this.log('info', message, context, additionalData);
  }

  /**
   * Log warning level message
   */
  warn(
    message: string,
    context?: LogContext,
    additionalData?: Record<string, unknown>,
  ): void {
    this.log('warn', message, context, additionalData);
  }

  /**
   * Log error level message
   */
  error(
    message: string,
    error?: Error,
    context?: LogContext,
    additionalData?: Record<string, unknown>,
  ): void {
    const logEntry = this.log('error', message, context, additionalData);

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
  }

  /**
   * Log debug level message
   */
  debug(
    message: string,
    context?: LogContext,
    additionalData?: Record<string, unknown>,
  ): void {
    this.log('debug', message, context, additionalData);
  }

  /**
   * Log API request start
   */
  logRequestStart(context: LogContext): void {
    console.log(
      `🚀 [${context.api.toUpperCase()}] REQUEST START: ${context.method} ${
        context.path
      }`,
    );
    console.log(
      `🚀 [${context.api.toUpperCase()}] Request ID: ${context.requestId}`,
    );
    console.log(
      `🚀 [${context.api.toUpperCase()}] Timestamp: ${new Date().toISOString()}`,
    );

    this.info('Request started', context, {
      event: 'request_start',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log API request success
   */
  logRequestSuccess(
    context: LogContext,
    duration: number,
    responseSize?: number,
  ): void {
    console.log(
      `✅ [${context.api.toUpperCase()}] REQUEST SUCCESS: ${context.method} ${
        context.path
      }`,
    );
    console.log(`✅ [${context.api.toUpperCase()}] Duration: ${duration}ms`);
    if (responseSize) {
      console.log(
        `✅ [${context.api.toUpperCase()}] Response size: ${responseSize} bytes`,
      );
    }
    console.log(
      `✅ [${context.api.toUpperCase()}] Request ID: ${context.requestId}`,
    );

    this.info(
      'Request completed successfully',
      { ...context, duration },
      {
        event: 'request_success',
        duration,
        responseSize,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Log API error with error code
   */
  logAPIError(
    errorCode: string,
    context: LogContext,
    error?: Error,
    additionalData?: Record<string, unknown>,
  ): void {
    const errorDef = getErrorByCode(errorCode);

    if (!errorDef) {
      console.error(
        `❌ [${context.api.toUpperCase()}] UNKNOWN ERROR CODE: ${errorCode}`,
      );
      this.error(
        `Unknown error code: ${errorCode}`,
        error,
        context,
        additionalData,
      );
      return;
    }

    console.error(
      `❌ [${context.api.toUpperCase()}] ERROR ${errorCode}: ${
        errorDef.message
      }`,
    );
    console.error(
      `❌ [${context.api.toUpperCase()}] Category: ${errorDef.category}`,
    );
    console.error(
      `❌ [${context.api.toUpperCase()}] Status Code: ${errorDef.statusCode}`,
    );
    console.error(
      `❌ [${context.api.toUpperCase()}] Request ID: ${context.requestId}`,
    );

    if (errorDef.troubleshooting && errorDef.troubleshooting.length > 0) {
      console.error(`❌ [${context.api.toUpperCase()}] Troubleshooting:`);
      errorDef.troubleshooting.forEach((step, index) => {
        console.error(
          `❌ [${context.api.toUpperCase()}]   ${index + 1}. ${step}`,
        );
      });
    }

    this.error(
      errorDef.message,
      error,
      { ...context, code: errorCode },
      {
        event: 'api_error',
        errorCode,
        category: errorDef.category,
        statusCode: errorDef.statusCode,
        description: errorDef.description,
        troubleshooting: errorDef.troubleshooting,
        ...additionalData,
      },
    );
  }

  /**
   * Log validation error
   */
  logValidationError(
    field: string,
    value: unknown,
    expected: string,
    context: LogContext,
  ): void {
    const message = `Validation failed for field '${field}': expected ${expected}, got ${typeof value}`;
    console.error(
      `❌ [${context.api.toUpperCase()}] VALIDATION ERROR: ${message}`,
    );
    console.error(`❌ [${context.api.toUpperCase()}] Field: ${field}`);
    console.error(`❌ [${context.api.toUpperCase()}] Value:`, value);
    console.error(`❌ [${context.api.toUpperCase()}] Expected: ${expected}`);

    this.error(message, undefined, context, {
      event: 'validation_error',
      field,
      value,
      expected,
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    operation: string,
    duration: number,
    context: LogContext,
    additionalMetrics?: Record<string, unknown>,
  ): void {
    console.log(
      `📊 [${context.api.toUpperCase()}] PERFORMANCE: ${operation} took ${duration}ms`,
    );

    this.info(
      `Performance: ${operation}`,
      { ...context, duration },
      {
        event: 'performance',
        operation,
        duration,
        ...additionalMetrics,
      },
    );
  }

  /**
   * Create standardized error response for API
   */
  createErrorResponse(errorCode: string, details?: Record<string, unknown>) {
    const errorDef = getErrorByCode(errorCode);
    if (!errorDef) {
      return createErrorResponse(
        {
          code: 'UNK_001',
          message: 'Unknown error occurred',
          statusCode: 500,
          category: 'UNK',
          description: 'An unknown error occurred',
        },
        details,
      );
    }
    return createErrorResponse(errorDef, details);
  }

  /**
   * Get recent logs (for debugging)
   */
  getRecentLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get logs by API
   */
  getLogsByAPI(api: string): LogEntry[] {
    return this.logs.filter((log) => log.api === api);
  }

  /**
   * Get logs by error code
   */
  getLogsByErrorCode(errorCode: string): LogEntry[] {
    return this.logs.filter((log) => log.code === errorCode);
  }

  /**
   * Clear logs (for memory management)
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Internal logging method
   */
  private log(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    context?: LogContext,
    additionalData?: Record<string, unknown>,
  ): LogEntry {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      api: context?.api || 'unknown',
      message,
      context,
      ...additionalData,
    };

    // Add to in-memory log storage
    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs = this.logs.slice(-this.maxLogsInMemory);
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      const logPrefix = `[${level.toUpperCase()}]`;
      const apiPrefix = context?.api ? `[${context.api.toUpperCase()}]` : '';
      const requestId = context?.requestId ? `[${context.requestId}]` : '';

      console.log(
        `${logPrefix} ${apiPrefix} ${requestId} ${message}`,
        additionalData || '',
      );
    }

    return logEntry;
  }
}

// Export singleton instance
export const apiLogger = APILogger.getInstance();

// Helper function to create API context
export function createAPIContext(
  api: string,
  method: string,
  path: string,
  req?: {
    headers?: Record<string, string | string[] | undefined>;
    ip?: string;
  },
): LogContext {
  const xForwardedFor = req?.headers?.['x-forwarded-for'];
  const userAgent = req?.headers?.['user-agent'];

  return apiLogger.createContext(api, method, path, {
    ip:
      (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor) ||
      req?.ip,
    userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
    // Add more context from request as needed
  });
}

// Helper function to measure execution time
export function withTiming<T>(
  operation: string,
  context: LogContext,
  fn: () => Promise<T>,
): Promise<T> {
  const startTime = Date.now();

  return fn().finally(() => {
    const duration = Date.now() - startTime;
    apiLogger.logPerformance(operation, duration, context);
  });
}
