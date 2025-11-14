"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { useState } from "react";

interface TradingSignal {
  coin: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  target_price?: number;
  stop_loss?: number;
  reasoning: string;
  indicators: string[];
}

interface MarketAlert {
  type: 'PRICE_SPIKE' | 'VOLUME_SPIKE' | 'TREND_CHANGE' | 'WHALE_ACTIVITY';
  coin: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}

interface PortfolioAllocation {
  coin: string;
  percentage: number;
  amount: number;
  risk_level: string;
}

export const TradingSignals = () => {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);

  // Trading signals generator
  useCopilotAction({
    name: "generate_trading_signals",
    render: ({ status, result }) => {
      if (status === "complete" && result) {
        const signalData = JSON.parse(result);
        setSignals(signalData.signals);
        return (
          <div className="bg-gradient-to-r from-green-900 to-blue-900 p-6 rounded-lg border border-gray-700 mb-4">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">🎯</span>
              AI Trading Signals
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signalData.signals.map((signal: TradingSignal, index: number) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${
                  signal.signal === 'BUY'
                    ? 'border-green-500 bg-green-900/20'
                    : signal.signal === 'SELL'
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-yellow-500 bg-yellow-900/20'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-bold text-lg">{signal.coin}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        signal.signal === 'BUY'
                          ? 'bg-green-600 text-white'
                          : signal.signal === 'SELL'
                          ? 'bg-red-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {signal.signal}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">${signal.price}</div>
                      <div className="text-sm text-gray-300">{signal.confidence}% confidence</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    {signal.target_price && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Target:</span>
                        <span className="text-green-400 font-medium">${signal.target_price}</span>
                      </div>
                    )}
                    {signal.stop_loss && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Stop Loss:</span>
                        <span className="text-red-400 font-medium">${signal.stop_loss}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-200 mb-3">{signal.reasoning}</div>

                  <div className="flex flex-wrap gap-1">
                    {signal.indicators.map((indicator, idx) => (
                      <span key={idx} className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs">
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (status === "inProgress") {
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span className="text-gray-300">Analyzing market data and generating trading signals...</span>
            </div>
          </div>
        );
      }

      return null;
    },
  });

  // Real-time market alerts
  useCopilotAction({
    name: "monitor_market_alerts",
    render: ({ status, result }) => {
      if (status === "complete" && result) {
        const alertData = JSON.parse(result);
        setAlerts(prev => [...prev, ...alertData.alerts].slice(-10)); // Keep last 10 alerts
        return (
          <div className="bg-red-900/20 p-6 rounded-lg border border-red-700 mb-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🚨</span>
              Market Alerts
            </h3>
            <div className="space-y-3">
              {alertData.alerts.map((alert: MarketAlert, index: number) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'CRITICAL'
                    ? 'border-red-500 bg-red-900/30'
                    : alert.severity === 'HIGH'
                    ? 'border-orange-500 bg-orange-900/30'
                    : alert.severity === 'MEDIUM'
                    ? 'border-yellow-500 bg-yellow-900/30'
                    : 'border-blue-500 bg-blue-900/30'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium">{alert.coin}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          alert.type === 'PRICE_SPIKE' ? 'bg-green-600' :
                          alert.type === 'VOLUME_SPIKE' ? 'bg-blue-600' :
                          alert.type === 'TREND_CHANGE' ? 'bg-purple-600' :
                          'bg-red-600'
                        } text-white`}>
                          {alert.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-200 text-sm">{alert.message}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.severity === 'CRITICAL' ? 'bg-red-600' :
                      alert.severity === 'HIGH' ? 'bg-orange-600' :
                      alert.severity === 'MEDIUM' ? 'bg-yellow-600' :
                      'bg-blue-600'
                    } text-white`}>
                      {alert.severity}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return null;
    },
  });

  // Interactive portfolio optimizer
  useCopilotAction({
    name: "optimize_portfolio",
    render: ({ status, result }) => {
      if (status === "complete" && result) {
        const optimization = JSON.parse(result);
        return (
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 p-6 rounded-lg border border-gray-700 mb-4">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">⚡</span>
              Portfolio Optimization
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Recommended Allocation</h4>
                <div className="space-y-3">
                  {optimization.allocations.map((alloc: PortfolioAllocation, index: number) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{alloc.coin}</span>
                        <span className="text-green-400 font-bold">{alloc.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${alloc.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-300 mt-1">
                        ${alloc.amount} • Risk: {alloc.risk_level}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Optimization Metrics</h4>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {optimization.expected_return}%
                    </div>
                    <div className="text-sm text-gray-300">Expected Annual Return</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                    <div className="text-xl font-bold text-blue-400">
                      {optimization.risk_score}/10
                    </div>
                    <div className="text-sm text-gray-300">Risk Score</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                    <div className="text-lg font-bold text-purple-400">
                      {optimization.sharpe_ratio}
                    </div>
                    <div className="text-sm text-gray-300">Sharpe Ratio</div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-900/20 rounded-lg border border-yellow-600">
                  <p className="text-yellow-200 text-sm">{optimization.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (status === "inProgress") {
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              <span className="text-gray-300">Optimizing portfolio based on risk tolerance and market conditions...</span>
            </div>
          </div>
        );
      }

      return null;
    },
  });

  // Human-in-the-loop trading confirmation
  useCopilotAction({
    name: "execute_trade",
    renderAndWaitForResponse: ({ respond, args, status }) => {
      if (status === "complete") {
        return (
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-600">
            <p className="text-green-200">✅ Trade executed successfully!</p>
          </div>
        );
      }

      return (
        <div className="bg-orange-900/20 p-6 rounded-lg border border-orange-600 mb-4">
          <h3 className="text-lg font-semibold text-white mb-4">⚠️ Trade Confirmation Required</h3>

          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <h4 className="text-white font-medium mb-2">Trade Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Action:</span>
                <span className="text-white">{args?.action} {args?.amount} {args?.coin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Price:</span>
                <span className="text-white">${args?.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Value:</span>
                <span className="text-white">${(args?.amount * args?.price).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => respond?.("CONFIRM")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ✅ Confirm Trade
            </button>
            <button
              onClick={() => respond?.("CANCEL")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      );
    },
  });

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🚀 Advanced Trading Intelligence</h1>

        {/* Signals Overview */}
        {signals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Active Trading Signals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signals.map((signal, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${
                  signal.signal === 'BUY' ? 'border-green-500 bg-green-900/10' :
                  signal.signal === 'SELL' ? 'border-red-500 bg-red-900/10' :
                  'border-yellow-500 bg-yellow-900/10'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-bold">{signal.coin}</span>
                    <span className={`px-2 py-1 rounded text-sm font-bold ${
                      signal.signal === 'BUY' ? 'bg-green-600' :
                      signal.signal === 'SELL' ? 'bg-red-600' :
                      'bg-yellow-600'
                    } text-white`}>
                      {signal.signal}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">{signal.confidence}% confidence</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Market Alerts</h2>
            <div className="space-y-2">
              {alerts.slice(-5).map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'CRITICAL' ? 'border-red-500 bg-red-900/10' :
                  alert.severity === 'HIGH' ? 'border-orange-500 bg-orange-900/10' :
                  alert.severity === 'MEDIUM' ? 'border-yellow-500 bg-yellow-900/10' :
                  'border-blue-500 bg-blue-900/10'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{alert.coin}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">⚡ Quick Trading Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors">
              Generate Signals
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors">
              Monitor Alerts
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors">
              Optimize Portfolio
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg transition-colors">
              Execute Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
