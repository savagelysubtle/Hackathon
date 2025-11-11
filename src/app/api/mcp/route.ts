import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { MCPConfiguration, MCPServerConfig } from "@/lib/types";

const MCP_CONFIG_PATH = path.join(process.cwd(), "data", "mcp.json");

// Helper function to read MCP configuration
async function readMCPConfig(): Promise<MCPConfiguration> {
  try {
    const fileContent = await fs.readFile(MCP_CONFIG_PATH, "utf-8");
    return JSON.parse(fileContent) as MCPConfiguration;
  } catch (error) {
    // If file doesn't exist or is invalid, return empty config
    console.error("Error reading MCP config:", error);
    return { mcpServers: {} };
  }
}

// Helper function to write MCP configuration
async function writeMCPConfig(config: MCPConfiguration): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(MCP_CONFIG_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    // Write config with pretty formatting
    await fs.writeFile(MCP_CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing MCP config:", error);
    throw error;
  }
}

// GET /api/mcp - Retrieve current MCP configuration
export async function GET() {
  try {
    const config = await readMCPConfig();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read MCP configuration" },
      { status: 500 }
    );
  }
}

// POST /api/mcp - Create new server configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverName, serverConfig } = body as {
      serverName: string;
      serverConfig: MCPServerConfig;
    };

    if (!serverName || !serverConfig) {
      return NextResponse.json(
        { error: "Server name and configuration are required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!serverConfig.command) {
      return NextResponse.json(
        { error: "Command is required for server configuration" },
        { status: 400 }
      );
    }

    const config = await readMCPConfig();

    // Check if server already exists
    if (config.mcpServers[serverName]) {
      return NextResponse.json(
        { error: `Server '${serverName}' already exists` },
        { status: 409 }
      );
    }

    // Add new server
    config.mcpServers[serverName] = serverConfig;
    await writeMCPConfig(config);

    return NextResponse.json({
      message: `Server '${serverName}' created successfully`,
      config,
    });
  } catch (error) {
    console.error("Error creating MCP server:", error);
    return NextResponse.json(
      { error: "Failed to create MCP server configuration" },
      { status: 500 }
    );
  }
}

// PUT /api/mcp - Update existing server configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverName, serverConfig } = body as {
      serverName: string;
      serverConfig: MCPServerConfig;
    };

    if (!serverName || !serverConfig) {
      return NextResponse.json(
        { error: "Server name and configuration are required" },
        { status: 400 }
      );
    }

    const config = await readMCPConfig();

    // Check if server exists
    if (!config.mcpServers[serverName]) {
      return NextResponse.json(
        { error: `Server '${serverName}' not found` },
        { status: 404 }
      );
    }

    // Update server
    config.mcpServers[serverName] = serverConfig;
    await writeMCPConfig(config);

    return NextResponse.json({
      message: `Server '${serverName}' updated successfully`,
      config,
    });
  } catch (error) {
    console.error("Error updating MCP server:", error);
    return NextResponse.json(
      { error: "Failed to update MCP server configuration" },
      { status: 500 }
    );
  }
}

// DELETE /api/mcp - Remove server configuration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverName = searchParams.get("serverName");

    if (!serverName) {
      return NextResponse.json(
        { error: "Server name is required" },
        { status: 400 }
      );
    }

    const config = await readMCPConfig();

    // Check if server exists
    if (!config.mcpServers[serverName]) {
      return NextResponse.json(
        { error: `Server '${serverName}' not found` },
        { status: 404 }
      );
    }

    // Delete server
    delete config.mcpServers[serverName];
    await writeMCPConfig(config);

    return NextResponse.json({
      message: `Server '${serverName}' deleted successfully`,
      config,
    });
  } catch (error) {
    console.error("Error deleting MCP server:", error);
    return NextResponse.json(
      { error: "Failed to delete MCP server configuration" },
      { status: 500 }
    );
  }
}
