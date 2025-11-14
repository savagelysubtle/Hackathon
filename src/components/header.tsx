"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface HeaderProps {
  activeTab?: "chat" | "crypto-demo" | "settings";
}

export function Header({ activeTab = "chat" }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border-b border-lime-500/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                🤖 CopilotKit Demo
              </h1>
              <p className="text-lime-400 text-sm">
                AI-Powered Applications
              </p>
            </div>
          </div>

          <Tabs value={activeTab} className="w-auto">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-700">
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-lime-600 data-[state=active]:text-black hover:bg-lime-500/20 transition-all duration-300"
                asChild
              >
                <Link href="/">💬 Chat</Link>
              </TabsTrigger>
              <TabsTrigger
                value="crypto-demo"
                className="data-[state=active]:bg-lime-600 data-[state=active]:text-black hover:bg-lime-500/20 transition-all duration-300"
                asChild
              >
                <Link href="/crypto-demo">🪙 Crypto Demo</Link>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-lime-600 data-[state=active]:text-black hover:bg-lime-500/20 transition-all duration-300"
                asChild
              >
                <Link href="/settings">⚙️ Settings</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  );
}
