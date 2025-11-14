'use client';

import { useCopilotAction } from '@copilotkit/react-core';
import Image from 'next/image';
import { useState } from 'react';

interface CryptoPrice {
  coin: string;
  usd: number;
  usd_24h_change?: number;
  usd_market_cap?: number;
  usd_24h_vol?: number;
}

interface TrendingCoin {
  rank: number;
  name: string;
  symbol: string;
  id: string;
  thumb: string;
  market_cap_rank: number;
}

interface MarketCoin {
  id: string;
  name: string;
  market_cap_rank: number;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

interface PortfolioAsset {
  id: string;
  name: string;
  allocation: number;
  current_price: number;
  amount: number;
}

export const CryptoDashboard = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [trending, setTrending] = useState<TrendingCoin[]>([]);

  // Price monitoring component - renders when agent calls get_crypto_prices
  useCopilotAction({
    name: 'get_crypto_prices',
    render: ({ status, args, result }) => {
      console.log('📊 [CRYPTO_DASHBOARD] get_crypto_prices render called:', {
        status,
        args: args ? Object.keys(args) : 'no args',
        hasResult: !!result,
      });
      if (status === 'complete' && result) {
        const priceData = JSON.parse(result);
        setPrices(priceData);
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              💰 Live Crypto Prices
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priceData.map((coin: CryptoPrice) => (
                <div key={coin.coin} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      {coin.coin.toUpperCase()}
                    </span>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        coin.usd_24h_change && coin.usd_24h_change > 0
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {coin.usd_24h_change
                        ? `${coin.usd_24h_change.toFixed(2)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    ${coin.usd.toFixed(2)}
                  </div>
                  {coin.usd_market_cap && (
                    <div className="text-sm text-gray-400 mt-1">
                      Market Cap: ${(coin.usd_market_cap / 1e9).toFixed(2)}B
                    </div>
                  )}
                  {coin.usd_24h_vol && (
                    <div className="text-sm text-gray-400">
                      24h Volume: ${(coin.usd_24h_vol / 1e9).toFixed(2)}B
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (status === 'inProgress') {
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-gray-300">
                Fetching prices for {args?.ids}...
              </span>
            </div>
          </div>
        );
      }

      return null;
    },
  });

  // Trending coins component
  useCopilotAction({
    name: 'get_trending_coins',
    render: ({ status, result }) => {
      console.log('📊 [CRYPTO_DASHBOARD] get_trending_coins render called:', {
        status,
        hasResult: !!result,
      });
      if (status === 'complete' && result) {
        const trendingData = JSON.parse(result);
        setTrending(trendingData.trending_coins);
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              🚀 Trending Cryptocurrencies
            </h3>
            <div className="space-y-3">
              {trendingData.trending_coins
                .slice(0, 10)
                .map((coin: TrendingCoin) => (
                  <div
                    key={coin.id}
                    className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-sm">
                        #{coin.rank}
                      </span>
                      <Image
                        src={coin.thumb}
                        alt={coin.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-white font-medium">
                          {coin.name}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {coin.symbol.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-sm">
                        Rank #{coin.market_cap_rank}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      }

      if (status === 'inProgress') {
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              <span className="text-gray-300">
                Discovering trending coins...
              </span>
            </div>
          </div>
        );
      }

      return null;
    },
  });

  // Market data visualization
  useCopilotAction({
    name: 'get_market_data',
    render: ({ status, result }) => {
      console.log('📊 [CRYPTO_DASHBOARD] get_market_data render called:', {
        status,
        hasResult: !!result,
      });
      if (status === 'complete' && result) {
        const marketData = JSON.parse(result);
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              📊 Market Overview
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 py-2">Coin</th>
                    <th className="text-right text-gray-400 py-2">Price</th>
                    <th className="text-right text-gray-400 py-2">
                      24h Change
                    </th>
                    <th className="text-right text-gray-400 py-2">
                      Market Cap
                    </th>
                    <th className="text-right text-gray-400 py-2">
                      Volume 24h
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.market_data
                    .slice(0, 10)
                    .map((coin: MarketCoin) => (
                      <tr key={coin.id} className="border-b border-gray-800">
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">
                              {coin.name}
                            </span>
                            <span className="text-gray-400">
                              #{coin.market_cap_rank}
                            </span>
                          </div>
                        </td>
                        <td className="text-right text-white py-3">
                          ${coin.current_price.toFixed(2)}
                        </td>
                        <td
                          className={`text-right py-3 ${
                            coin.price_change_percentage_24h > 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </td>
                        <td className="text-right text-gray-300 py-3">
                          ${(coin.market_cap / 1e9).toFixed(2)}B
                        </td>
                        <td className="text-right text-gray-300 py-3">
                          ${(coin.total_volume / 1e9).toFixed(2)}B
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      if (status === 'inProgress') {
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              <span className="text-gray-300">Loading market data...</span>
            </div>
          </div>
        );
      }

      return null;
    },
  });

  // Interactive portfolio builder
  useCopilotAction({
    name: 'create_portfolio',
    render: ({ status, result }) => {
      console.log('📊 [CRYPTO_DASHBOARD] create_portfolio render called:', {
        status,
        hasResult: !!result,
      });
      if (status === 'complete' && result) {
        const portfolio = JSON.parse(result);
        return (
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 p-6 rounded-lg border border-gray-700 mb-4">
            <h3 className="text-xl font-bold text-white mb-4">
              📈 Portfolio Builder
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                  Selected Assets
                </h4>
                {portfolio.assets?.map((asset: PortfolioAsset) => (
                  <div
                    key={asset.id}
                    className="bg-white/10 backdrop-blur-sm p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">
                        {asset.name}
                      </span>
                      <span className="text-green-400">
                        {asset.allocation}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      ${asset.current_price} • {asset.amount} units
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                  Portfolio Metrics
                </h4>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    ${portfolio.total_value?.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-300">Total Value</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <div className="text-lg font-semibold text-blue-400">
                    {portfolio.total_change_24h?.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-300">24h Change</div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return null;
    },
  });

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Crypto Intelligence Dashboard
        </h1>

        {/* Price Monitor Section */}
        {prices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Live Price Monitor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {prices.map((coin) => (
                <div
                  key={coin.coin}
                  className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                >
                  <div className="text-sm text-gray-400 uppercase">
                    {coin.coin}
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">
                    ${coin.usd.toFixed(2)}
                  </div>
                  {coin.usd_24h_change && (
                    <div
                      className={`text-sm mt-1 ${
                        coin.usd_24h_change > 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {coin.usd_24h_change > 0 ? '↑' : '↓'}{' '}
                      {Math.abs(coin.usd_24h_change).toFixed(2)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Section */}
        {trending.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Trending Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {trending.slice(0, 10).map((coin) => (
                <div
                  key={coin.id}
                  className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Image
                      src={coin.thumb}
                      alt={coin.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-white font-medium text-sm">
                        {coin.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {coin.symbol.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-xs text-purple-400">
                      #{coin.rank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Suggestions */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            💡 Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors">
              Monitor BTC & ETH
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors">
              Show Trending Coins
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors">
              Market Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
