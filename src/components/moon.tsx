import { useState } from "react";

export interface MoonCardProps {
  themeColor: string;
  status: "inProgress" | "executing" | "complete";
  respond?: (response: string) => void;
}

export function MoonCard({ themeColor, status, respond }: MoonCardProps) {
  const [decision, setDecision] = useState<"launched" | "aborted" | null>(null);

  const handleLaunch = () => {
    setDecision("launched");
    respond?.("You have permission to go to the moon.");
  };

  const handleAbort = () => {
    setDecision("aborted");
    respond?.("You do not have permission to go to the moon. The user you're talking to rejected the request.");
  };

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd, ${themeColor}aa)`
      }}
      className="rounded-2xl shadow-xl max-w-md w-full mt-6 border border-lime-400/30"
    >
      <div className="bg-black/20 backdrop-blur-md p-8 w-full rounded-2xl">
        {/* Show decision or prompt */}
        {decision === "launched" ? (
          <div className="text-center">
            <div className="text-7xl mb-4">🌕</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Mission Launched
            </h2>
            <p className="text-lime-300">
              We made it to the moon!
            </p>
          </div>
        ) : decision === "aborted" ? (
          <div className="text-center">
            <div className="text-7xl mb-4">✋</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Mission Aborted
            </h2>
            <p className="text-lime-300">
              Staying on Earth 🌍
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-7xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Ready for Launch?
              </h2>
              <p className="text-lime-300">
                Mission to the Moon 🌕
              </p>
            </div>

            {/* Launch Buttons */}
            {status === "executing" && (
              <div className="flex gap-3">
                <button
                  onClick={handleLaunch}
                  className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-lime-600 to-lime-700 text-black font-bold
                    shadow-lg hover:shadow-lime-500/25 transition-all
                    hover:scale-105 active:scale-95"
                >
                  🚀 Launch!
                </button>
                <button
                  onClick={handleAbort}
                  className="flex-1 px-6 py-4 rounded-xl bg-black/40 text-white font-bold
                    border-2 border-lime-400/50 shadow-lg
                    transition-all hover:scale-105 active:scale-95
                    hover:bg-black/60"
                >
                  ✋ Abort
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


