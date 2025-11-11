"use client";

import { useState, useEffect } from "react";
import { MCPConfiguration, MCPServerConfig } from "@/lib/types";
import Link from "next/link";

export default function SettingsPage() {
  const [config, setConfig] = useState<MCPConfiguration>({ mcpServers: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingServer, setEditingServer] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    serverName: "",
    command: "",
    args: "",
    enabled: true,
    description: "",
    env: "",
  });

  // Load MCP configuration on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/mcp");
      if (!response.ok) throw new Error("Failed to load configuration");
      const data = await response.json();
      setConfig(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (serverName: string) => {
    const server = config.mcpServers[serverName];
    setFormData({
      serverName,
      command: server.command,
      args: Array.isArray(server.args) ? server.args.join("\n") : "",
      enabled: server.enabled,
      description: server.description || "",
      env: server.env ? JSON.stringify(server.env, null, 2) : "",
    });
    setEditingServer(serverName);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setFormData({
      serverName: "",
      command: "",
      args: "",
      enabled: true,
      description: "",
      env: "",
    });
    setIsCreating(true);
    setEditingServer(null);
  };

  const handleCancel = () => {
    setEditingServer(null);
    setIsCreating(false);
    setFormData({
      serverName: "",
      command: "",
      args: "",
      enabled: true,
      description: "",
      env: "",
    });
  };

  const handleSave = async () => {
    try {
      // Parse args (one per line)
      const args = formData.args
        .split("\n")
        .map((arg) => arg.trim())
        .filter((arg) => arg.length > 0);

      // Parse env (JSON object)
      let env: Record<string, string> | undefined;
      if (formData.env.trim()) {
        try {
          env = JSON.parse(formData.env);
        } catch (e) {
          setError("Invalid JSON for environment variables");
          return;
        }
      }

      const serverConfig: MCPServerConfig = {
        command: formData.command,
        args,
        enabled: formData.enabled,
        description: formData.description || undefined,
        env,
      };

      const method = isCreating ? "POST" : "PUT";
      const response = await fetch("/api/mcp", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverName: formData.serverName,
          serverConfig,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save configuration");
      }

      await loadConfig();
      handleCancel();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save configuration");
    }
  };

  const handleDelete = async (serverName: string) => {
    if (!confirm(`Are you sure you want to delete '${serverName}'?`)) return;

    try {
      const response = await fetch(`/api/mcp?serverName=${encodeURIComponent(serverName)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete server");
      }

      await loadConfig();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete server");
    }
  };

  const handleToggleEnabled = async (serverName: string) => {
    const server = config.mcpServers[serverName];
    const updatedServer = { ...server, enabled: !server.enabled };

    try {
      const response = await fetch("/api/mcp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverName,
          serverConfig: updatedServer,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update server");
      }

      await loadConfig();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update server");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              MCP Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage Model Context Protocol servers and tools
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading configuration...</p>
          </div>
        ) : (
          <>
            {/* Server List */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Configured Servers ({Object.keys(config.mcpServers).length})
                </h2>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Server
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(config.mcpServers).map(([serverName, serverConfig]) => (
                  <div
                    key={serverName}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {serverName}
                        </h3>
                        {serverConfig.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {serverConfig.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              serverConfig.enabled
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {serverConfig.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleEnabled(serverName)}
                          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          {serverConfig.enabled ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleEdit(serverName)}
                          className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(serverName)}
                          className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <p>
                        <span className="font-medium">Command:</span> {serverConfig.command}
                      </p>
                      {serverConfig.args.length > 0 && (
                        <p>
                          <span className="font-medium">Args:</span> {serverConfig.args.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {Object.keys(config.mcpServers).length === 0 && !isCreating && (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No MCP servers configured</p>
                    <button
                      onClick={handleCreate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Server
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Edit/Create Form */}
            {(editingServer || isCreating) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {isCreating ? "Add New Server" : `Edit ${editingServer}`}
                </h2>

                <div className="space-y-4">
                  {/* Server Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Server Name *
                    </label>
                    <input
                      type="text"
                      value={formData.serverName}
                      onChange={(e) => setFormData({ ...formData, serverName: e.target.value })}
                      disabled={!isCreating}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:opacity-50"
                      placeholder="e.g., example-python"
                    />
                  </div>

                  {/* Command */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Command *
                    </label>
                    <input
                      type="text"
                      value={formData.command}
                      onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="e.g., deno"
                    />
                  </div>

                  {/* Args */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Arguments (one per line)
                    </label>
                    <textarea
                      value={formData.args}
                      onChange={(e) => setFormData({ ...formData, args: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="run&#10;-A&#10;https://example.com/script.ts"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Describe what this server does"
                    />
                  </div>

                  {/* Environment Variables */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Environment Variables (JSON)
                    </label>
                    <textarea
                      value={formData.env}
                      onChange={(e) => setFormData({ ...formData, env: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder='{"KEY": "value"}'
                    />
                  </div>

                  {/* Enabled Toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="enabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Enable this server
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            ℹ️ About MCP Servers
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            MCP (Model Context Protocol) servers provide additional tools and capabilities to your agent.
            After adding or updating servers, you need to restart the agent for changes to take effect.
          </p>
        </div>
      </div>
    </div>
  );
}
