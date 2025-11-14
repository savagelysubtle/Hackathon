import { LogContext, apiLogger, createAPIContext } from '@/lib/api-logger';
import { MCPConfiguration, MCPServerConfig } from '@/lib/types';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const MCP_CONFIG_PATH = path.join(process.cwd(), 'data', 'mcp.json');

// Helper function to read MCP configuration
async function readMCPConfig(context?: LogContext): Promise<MCPConfiguration> {
  try {
    const fileContent = await fs.readFile(MCP_CONFIG_PATH, 'utf-8');
    const config = JSON.parse(fileContent) as MCPConfiguration;

    if (context) {
      apiLogger.debug('MCP configuration read successfully', context, {
        servers_count: Object.keys(config.mcpServers || {}).length,
      });
    }

    return config;
  } catch (error) {
    // If file doesn't exist or is invalid, return empty config
    if (context) {
      apiLogger.warn(
        'MCP configuration file not found or invalid, returning empty config',
        context,
        {
          error: error instanceof Error ? error.message : String(error),
        },
      );
    }
    return { mcpServers: {} };
  }
}

// Helper function to write MCP configuration
async function writeMCPConfig(
  config: MCPConfiguration,
  context?: LogContext,
): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(MCP_CONFIG_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    // Write config with pretty formatting
    await fs.writeFile(
      MCP_CONFIG_PATH,
      JSON.stringify(config, null, 2),
      'utf-8',
    );

    if (context) {
      apiLogger.debug('MCP configuration written successfully', context, {
        servers_count: Object.keys(config.mcpServers || {}).length,
      });
    }
  } catch (error) {
    if (context) {
      apiLogger.error(
        'Failed to write MCP configuration',
        error as Error,
        context,
      );
    }
    throw error;
  }
}

// GET /api/mcp - Retrieve current MCP configuration
export async function GET(req: NextRequest) {
  const context = createAPIContext('mcp', 'GET', '/api/mcp', req);

  try {
    apiLogger.logRequestStart(context);

    const config = await readMCPConfig(context);

    const responseSize = JSON.stringify(config).length;
    apiLogger.logRequestSuccess(
      context,
      Date.now() - Date.parse(context.requestId!.split('_')[1]),
      responseSize,
    );

    return NextResponse.json(config);
  } catch (error) {
    apiLogger.logAPIError('MCP_CFG_001', context, error as Error);
    const errorResponse = apiLogger.createErrorResponse('MCP_CFG_001');
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

// POST /api/mcp - Create new server configuration
export async function POST(request: NextRequest) {
  const context = createAPIContext('mcp', 'POST', '/api/mcp', request);

  try {
    apiLogger.logRequestStart(context);

    const body = await request.json();
    const { serverName, serverConfig } = body as {
      serverName: string;
      serverConfig: MCPServerConfig;
    };

    apiLogger.info('Creating new MCP server', context, {
      server_name: serverName,
      has_config: !!serverConfig,
      config_keys: serverConfig ? Object.keys(serverConfig) : [],
    });

    if (!serverName || !serverConfig) {
      apiLogger.logValidationError(
        'serverName and serverConfig',
        { serverName, serverConfig },
        'both required',
        context,
      );
      const errorResponse = apiLogger.createErrorResponse('MCP_VAL_001');
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

    // Validate required fields
    if (!serverConfig.command) {
      apiLogger.logValidationError(
        'serverConfig.command',
        serverConfig.command,
        'non-empty string',
        context,
      );
      const errorResponse = apiLogger.createErrorResponse('MCP_VAL_002');
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

    const config = await readMCPConfig(context);

    // Check if server already exists
    if (config.mcpServers[serverName]) {
      apiLogger.logAPIError('MCP_CFG_003', context, undefined, {
        server_name: serverName,
      });
      const errorResponse = apiLogger.createErrorResponse('MCP_CFG_003', {
        serverName,
      });
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

    // Add new server
    config.mcpServers[serverName] = serverConfig;
    await writeMCPConfig(config, context);

    apiLogger.info('MCP server created successfully', context, {
      server_name: serverName,
      total_servers: Object.keys(config.mcpServers).length,
    });

    const responseSize = JSON.stringify({
      message: `Server '${serverName}' created successfully`,
      config,
    }).length;
    apiLogger.logRequestSuccess(
      context,
      Date.now() - Date.parse(context.requestId!.split('_')[1]),
      responseSize,
    );

    return NextResponse.json({
      message: `Server '${serverName}' created successfully`,
      config,
    });
  } catch (error) {
    apiLogger.logAPIError('MCP_SYS_001', context, error as Error);
    const errorResponse = apiLogger.createErrorResponse('MCP_SYS_001');
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

// PUT /api/mcp - Update existing server configuration
export async function PUT(request: NextRequest) {
  const context = createAPIContext('mcp', 'PUT', '/api/mcp', request);

  try {
    apiLogger.logRequestStart(context);

    const body = await request.json();
    const { serverName, serverConfig } = body as {
      serverName: string;
      serverConfig: MCPServerConfig;
    };

    apiLogger.info('Updating MCP server', context, {
      server_name: serverName,
      has_config: !!serverConfig,
      config_keys: serverConfig ? Object.keys(serverConfig) : [],
    });

    if (!serverName || !serverConfig) {
      apiLogger.logValidationError(
        'serverName and serverConfig',
        { serverName, serverConfig },
        'both required',
        context,
      );
      const errorResponse = apiLogger.createErrorResponse('MCP_VAL_001');
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

    const config = await readMCPConfig(context);

    // Check if server exists
    if (!config.mcpServers[serverName]) {
      apiLogger.logAPIError('MCP_CFG_004', context, undefined, {
        server_name: serverName,
      });
      const errorResponse = apiLogger.createErrorResponse('MCP_CFG_004', {
        serverName,
      });
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

    // Update server
    config.mcpServers[serverName] = serverConfig;
    await writeMCPConfig(config, context);

    apiLogger.info('MCP server updated successfully', context, {
      server_name: serverName,
      total_servers: Object.keys(config.mcpServers).length,
    });

    const responseSize = JSON.stringify({
      message: `Server '${serverName}' updated successfully`,
      config,
    }).length;
    apiLogger.logRequestSuccess(
      context,
      Date.now() - Date.parse(context.requestId!.split('_')[1]),
      responseSize,
    );

    return NextResponse.json({
      message: `Server '${serverName}' updated successfully`,
      config,
    });
  } catch (error) {
    apiLogger.logAPIError('MCP_SYS_002', context, error as Error);
    const errorResponse = apiLogger.createErrorResponse('MCP_SYS_002');
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

// DELETE /api/mcp - Remove server configuration
export async function DELETE(request: NextRequest) {
  const context = createAPIContext('mcp', 'DELETE', '/api/mcp', request);

  try {
    apiLogger.logRequestStart(context);

    const { searchParams } = new URL(request.url);
    const serverName = searchParams.get('serverName');

    apiLogger.info('Deleting MCP server', context, {
      server_name: serverName,
    });

    if (!serverName) {
      apiLogger.logValidationError(
        'serverName',
        serverName,
        'non-empty string from query params',
        context,
      );
      const errorResponse = apiLogger.createErrorResponse('MCP_VAL_003');
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

    const config = await readMCPConfig(context);

    // Check if server exists
    if (!config.mcpServers[serverName]) {
      apiLogger.logAPIError('MCP_CFG_004', context, undefined, {
        server_name: serverName,
      });
      const errorResponse = apiLogger.createErrorResponse('MCP_CFG_004', {
        serverName,
      });
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

    // Delete server
    delete config.mcpServers[serverName];
    await writeMCPConfig(config, context);

    apiLogger.info('MCP server deleted successfully', context, {
      server_name: serverName,
      remaining_servers: Object.keys(config.mcpServers).length,
    });

    const responseSize = JSON.stringify({
      message: `Server '${serverName}' deleted successfully`,
      config,
    }).length;
    apiLogger.logRequestSuccess(
      context,
      Date.now() - Date.parse(context.requestId!.split('_')[1]),
      responseSize,
    );

    return NextResponse.json({
      message: `Server '${serverName}' deleted successfully`,
      config,
    });
  } catch (error) {
    apiLogger.logAPIError('MCP_SYS_003', context, error as Error);
    const errorResponse = apiLogger.createErrorResponse('MCP_SYS_003');
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}
