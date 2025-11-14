"use client";

import { useState, useEffect } from "react";
import { MCPConfiguration, MCPServerConfig } from "@/lib/types";
import { Header } from "@/components/header";

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
        } catch {
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
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex flex-col">
      <Header activeTab="settings" />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg backdrop-blur-sm">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lime-400">Loading configuration...</p>
          </div>
        ) : (
          <>
            {/* Server List */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Configured Servers ({Object.keys(config.mcpServers).length})
                </h2>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-gradient-to-r from-lime-600 to-lime-700 text-black rounded-lg hover:from-lime-500 hover:to-lime-600 transition-all duration-300 shadow-lg"
                >
                  + Add Server
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(config.mcpServers).map(([serverName, serverConfig]) => (
                  <div
                    key={serverName}
                    className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-lime-500/20 hover:border-lime-400/30 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {serverName}
                        </h3>
                        {serverConfig.description && (
                          <p className="text-sm text-lime-400 mb-2">
                            {serverConfig.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              serverConfig.enabled
                                ? "bg-lime-600 text-black"
                                : "bg-slate-700 text-lime-400"
                            }`}
                          >
                            {serverConfig.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleEnabled(serverName)}
                          className="px-3 py-1 text-sm bg-slate-700 text-lime-400 rounded hover:bg-lime-600 hover:text-black transition-all duration-300"
                        >
                          {serverConfig.enabled ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleEdit(serverName)}
                          className="px-3 py-1 text-sm bg-slate-700 text-lime-400 rounded hover:bg-lime-600 hover:text-black transition-all duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(serverName)}
                          className="px-3 py-1 text-sm bg-red-900/30 text-red-300 rounded hover:bg-red-800/50 transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-300 space-y-1">
                      <p>
                        <span className="font-medium text-lime-400">Command:</span> {serverConfig.command}
                      </p>
                      {serverConfig.args.length > 0 && (
                        <p>
                          <span className="font-medium text-lime-400">Args:</span> {serverConfig.args.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {Object.keys(config.mcpServers).length === 0 && !isCreating && (
                  <div className="text-center py-12 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-xl border border-lime-500/20">
                    <p className="text-lime-400 mb-4">No MCP servers configured</p>
                    <button
                      onClick={handleCreate}
                      className="px-4 py-2 bg-gradient-to-r from-lime-600 to-lime-700 text-black rounded-lg hover:from-lime-500 hover:to-lime-600 transition-all duration-300 shadow-lg"
                    >
                      Add Your First Server
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Edit/Create Form */}
            {(editingServer || isCreating) && (
              <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-lime-500/20">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {isCreating ? "Add New Server" : `Edit ${editingServer}`}
                </h2>

                <div className="space-y-4">
                  {/* Server Name */}
                  <div>
                    <label className="block text-sm font-medium text-lime-400 mb-1">
                      Server Name *
                    </label>
                    <input
                      type="text"
                      value={formData.serverName}
                      onChange={(e) => setFormData({ ...formData, serverName: e.target.value })}
                      disabled={!isCreating}
                      className="w-full px-3 py-2 border border-lime-500/30 rounded-lg bg-slate-800/50 text-white disabled:opacity-50 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 backdrop-blur-sm"
                      placeholder="e.g., example-python"
                    />
                  </div>

                  {/* Command */}
                  <div>
                    <label className="block text-sm font-medium text-lime-400 mb-1">
                      Command *
                    </label>
                    <input
                      type="text"
                      value={formData.command}
                      onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                      className="w-full px-3 py-2 border border-lime-500/30 rounded-lg bg-slate-800/50 text-white focus:border-lime-400 focus:ring-1 focus:ring-lime-400 backdrop-blur-sm"
                      placeholder="e.g., deno"
                    />
                  </div>

                  {/* Args */}
                  <div>
                    <label className="block text-sm font-medium text-lime-400 mb-1">
                      Arguments (one per line)
                    </label>
                    <textarea
                      value={formData.args}
                      onChange={(e) => setFormData({ ...formData, args: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-lime-500/30 rounded-lg bg-slate-800/50 text-white font-mono text-sm focus:border-lime-400 focus:ring-1 focus:ring-lime-400 backdrop-blur-sm"
                      placeholder="run&#10;-A&#10;https://example.com/script.ts"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-lime-400 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-lime-500/30 rounded-lg bg-slate-800/50 text-white focus:border-lime-400 focus:ring-1 focus:ring-lime-400 backdrop-blur-sm"
                      placeholder="Describe what this server does"
                    />
                  </div>

                  {/* Environment Variables */}
                  <div>
                    <label className="block text-sm font-medium text-lime-400 mb-1">
                      Environment Variables (JSON)
                    </label>
                    <textarea
                      value={formData.env}
                      onChange={(e) => setFormData({ ...formData, env: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-lime-500/30 rounded-lg bg-slate-800/50 text-white font-mono text-sm focus:border-lime-400 focus:ring-1 focus:ring-lime-400 backdrop-blur-sm"
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
                      className="w-4 h-4 text-lime-600 border-lime-500/30 rounded focus:ring-lime-400 bg-slate-800/50"
                    />
                    <label htmlFor="enabled" className="ml-2 text-sm text-lime-400">
                      Enable this server
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-gradient-to-r from-lime-600 to-lime-700 text-black rounded-lg hover:from-lime-500 hover:to-lime-600 transition-all duration-300 shadow-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-600 text-lime-400 rounded-lg hover:from-slate-600 hover:to-slate-500 transition-all duration-300"
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
        <div className="mt-8 p-4 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-lime-500/20 rounded-xl">
          <h3 className="text-sm font-semibold text-lime-400 mb-2">
            ℹ️ About MCP Servers
          </h3>
          <p className="text-sm text-gray-300">
            MCP (Model Context Protocol) servers provide additional tools and capabilities to your agent.
            After adding or updating servers, you need to restart the agent for changes to take effect.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
