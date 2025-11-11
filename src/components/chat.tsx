"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import Link from "next/link";

const PLACEHOLDER_QUESTIONS = [
  "What's the latest research on AI agents?",
  "Explain quantum computing basics",
  "How do neural networks learn?",
  "What are the best practices for React development?",
];

export function ChatInterface() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-black via-slate-900 to-black text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-lime-500/20 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-lime-500 to-lime-600 rounded-lg flex items-center justify-center font-bold text-black shadow-lg">
            R
          </div>
          <div>
            <div className="text-lg font-semibold text-white">Researcher Agent</div>
            <div className="text-xs text-lime-400">Your intelligent research companion</div>
          </div>
        </div>
        <Link
          href="/settings"
          className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-lime-600 hover:to-lime-700 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-lime-500/25"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          Settings
        </Link>
      </div>

      <CopilotChat
        labels={{
          title: "Researcher Agent",
          initial: "Ask me anything...",
        }}
        suggestions={PLACEHOLDER_QUESTIONS.map((q) => ({
          title: q.substring(0, 50),
          message: q,
        }))}
        className="flex-1"
      />
    </div>
  );
}
