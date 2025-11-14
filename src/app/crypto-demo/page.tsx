'use client';

import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';
import { CryptoDashboard } from '../../components/crypto-dashboard';
import { TradingSignals } from '../../components/trading-signals';

export default function CryptoDemoPage() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      onError={(errorEvent) => {
        console.error('CopilotKit Error:', errorEvent);
      }}
    >
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Header activeTab="crypto-demo" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Next-Generation Crypto Intelligence
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the power of AI-driven cryptocurrency analysis with
              real-time data visualization, intelligent trading signals, and
              interactive portfolio management.
            </p>
            <div className="bg-linear-to-r from-blue-900 to-purple-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                💬 Try These Commands:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <p className="text-blue-200">
                    • &ldquo;Show me BTC and ETH prices&rdquo;
                  </p>
                  <p className="text-blue-200">
                    • &ldquo;What&apos;s trending today?&rdquo;
                  </p>
                  <p className="text-blue-200">
                    • &ldquo;Analyze the top 10 cryptocurrencies&rdquo;
                  </p>
                  <p className="text-blue-200">
                    • &ldquo;Tell me about Solana&rdquo;
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-blue-200">
                    • &ldquo;Generate trading signals&rdquo;
                  </p>
                  <p className="text-blue-200">
                    • &ldquo;Monitor market alerts&rdquo;
                  </p>
                  <p className="text-blue-200">
                    • &ldquo;Optimize my portfolio&rdquo;
                  </p>
                  <p className="text-blue-200">
                    • &ldquo;Execute a trade&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-700">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="trading"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Trading Signals
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                About
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <div className="text-3xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Real-Time Data
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Live cryptocurrency prices, market cap, volume, and trends
                    from CoinGecko API
                  </p>
                </div>
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <div className="text-3xl mb-4">🤖</div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    AI Analysis
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Intelligent market analysis, trading signals, and portfolio
                    recommendations
                  </p>
                </div>
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <div className="text-3xl mb-4">🎨</div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Generative UI
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Interactive visualizations and components generated directly
                    in the chat
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-8">
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">
                  📈 Market Intelligence Dashboard
                </h2>
                <CryptoDashboard />
              </div>
            </TabsContent>

            {/* Trading Signals Tab */}
            <TabsContent value="trading" className="mt-8">
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">
                  🚀 Advanced Trading Intelligence
                </h2>
                <TradingSignals />
              </div>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="mt-8 space-y-8">
              {/* Technical Implementation Details */}
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  🔧 Technical Implementation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-2">
                      CopilotKit Features Used:
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>
                        •{' '}
                        <code className="bg-gray-800 px-1 rounded">
                          useCopilotAction
                        </code>{' '}
                        - Generative UI components
                      </li>
                      <li>
                        •{' '}
                        <code className="bg-gray-800 px-1 rounded">
                          renderAndWaitForResponse
                        </code>{' '}
                        - Human-in-the-loop
                      </li>
                      <li>
                        •{' '}
                        <code className="bg-gray-800 px-1 rounded">
                          CopilotChat
                        </code>{' '}
                        - AI conversation interface
                      </li>
                      <li>
                        •{' '}
                        <code className="bg-gray-800 px-1 rounded">
                          Tool Integration
                        </code>{' '}
                        - Backend tools with UI rendering
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">
                      CoinGecko Tools:
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>
                        •{' '}
                        <code className="bg-gray-800 px-1 rounded">
                          get_crypto_prices
                        </code>{' '}
                        - Real-time pricing
                      </li>
                      <li>
                        •{' '}
                        <code className="bg-gray-800 px-1 rounded">
                          get_trending_coins
                        </code>{' '}
                        - Market trends
                      </li>
                      <li>
                        •{' '}
                        <code className="bg-gray-800 px-1 rounded">
                          get_market_data
                        </code>{' '}
                        - Comprehensive market data
                      </li>
                      <li>
                        •{' '}
                        <code className="bg-gray-800 px-1 rounded">
                          get_coin_info
                        </code>{' '}
                        - Detailed coin information
                      </li>
                      <li>
                        •{' '}
                        <code className="bg-gray-800 px-1 rounded">
                          search_coins
                        </code>{' '}
                        - Cryptocurrency search
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Use Cases */}
              <div className="bg-linear-to-r from-gray-900 to-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  💡 Perfect For:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <h4 className="text-white font-medium">Crypto Traders</h4>
                    <p className="text-gray-300 text-sm">
                      Real-time signals and market analysis
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <h4 className="text-white font-medium">
                      Portfolio Managers
                    </h4>
                    <p className="text-gray-300 text-sm">
                      AI-powered portfolio optimization
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔬</div>
                    <h4 className="text-white font-medium">
                      Market Researchers
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Deep market insights and trends
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎓</div>
                    <h4 className="text-white font-medium">Crypto Learners</h4>
                    <p className="text-gray-300 text-sm">
                      Interactive educational experience
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Copilot Chat - Fixed Position */}
        <div className="fixed bottom-4 right-4 z-50">
          <CopilotChat
            instructions={`
You are a cryptocurrency trading assistant powered by CoinGecko data and advanced AI analysis.

Available tools and capabilities:
- Real-time cryptocurrency prices and market data
- Trending coin discovery
- Comprehensive market analysis
- Detailed coin information and research
- AI-powered trading signals generation
- Portfolio optimization recommendations
- Market alert monitoring
- Human-in-the-loop trade execution

When using tools, leverage the generative UI capabilities to create rich, interactive visualizations.
Always provide context and explain your reasoning. Be helpful, accurate, and conservative with financial advice.

Key commands users might try:
- "Show me current prices for BTC, ETH, and SOL"
- "What's trending in crypto today?"
- "Analyze the top 10 cryptocurrencies"
- "Tell me about [coin name]"
- "Generate trading signals for my portfolio"
- "Monitor for market alerts"
- "Optimize my portfolio with 60% BTC, 30% ETH, 10% SOL"
- "Execute a trade: buy 0.1 BTC at market price"

Remember: This is for educational purposes. Always do your own research and consult financial advisors.
            `}
            labels={{
              title: 'Crypto Intelligence Assistant',
              initial:
                "Hi! I'm your AI crypto assistant. I can help you analyze markets, generate trading signals, and manage portfolios. What would you like to explore?",
            }}
            className="w-96 h-[600px]"
          />
        </div>
      </div>
    </CopilotKit>
  );
}
