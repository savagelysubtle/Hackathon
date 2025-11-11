interface ProverbsCardProps {
  proverbs: string[];
}

export function ProverbsCard({ proverbs }: ProverbsCardProps) {
  if (!proverbs || proverbs.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl mt-6 mb-4 max-w-md w-full border border-lime-500/20">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-lime-500 to-lime-600 rounded-lg flex items-center justify-center font-bold text-black text-sm">
            💭
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Wisdom</h3>
            <p className="text-sm text-lime-400">Ancient Proverbs</p>
          </div>
        </div>

        <div className="space-y-3">
          {proverbs.map((proverb, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-4 border border-lime-500/10"
            >
              <p className="text-white text-sm italic leading-relaxed">
                "{proverb}"
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-lime-500/20">
          <p className="text-xs text-lime-400 text-center">
            {proverbs.length} proverb{proverbs.length !== 1 ? 's' : ''} of wisdom
          </p>
        </div>
      </div>
    </div>
  );
}

