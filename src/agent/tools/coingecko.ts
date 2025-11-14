import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * CoinGecko API Tools
 *
 * Tools for fetching cryptocurrency data from CoinGecko API.
 * Provides real-time price data, market information, trending coins, and more.
 *
 * CoinGecko API Documentation: https://www.coingecko.com/en/api
 */

// Base CoinGecko API URL
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

/**
 * Get current prices for one or more cryptocurrencies
 */
export const getCryptoPrices = tool(
  async ({
    ids,
    vsCurrencies = "usd",
    includeMarketCap = false,
    include24hrChange = false,
    include24hrVolume = false
  }: {
    ids: string;
    vsCurrencies?: string;
    includeMarketCap?: boolean;
    include24hrChange?: boolean;
    include24hrVolume?: boolean;
  }) => {
    console.log('🪙 [COINGECKO] getCryptoPrices called with:', { ids, vsCurrencies, includeMarketCap, include24hrChange, include24hrVolume });

    try {
      const params = new URLSearchParams({
        ids,
        vs_currencies: vsCurrencies,
        include_market_cap: includeMarketCap.toString(),
        include_24hr_change: include24hrChange.toString(),
        include_24hr_vol: include24hrVolume.toString(),
      });

      const url = `${COINGECKO_BASE_URL}/simple/price?${params}`;
      console.log('🪙 [COINGECKO] Fetching from URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('🪙 [COINGECKO] API response status:', response.status);
      console.log('🪙 [COINGECKO] API response data keys:', Object.keys(data));

      if (!response.ok) {
        console.error('🪙 [COINGECKO] API error response:', data);
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      // Format the response for better readability
      const formattedData = Object.entries(data).map(([coinId, priceData]) => {
        const coinInfo: Record<string, unknown> = { coin: coinId };

        if (typeof priceData === 'object' && priceData !== null) {
          const priceObj = priceData as Record<string, unknown>;
          if (priceObj.usd !== undefined) coinInfo.usd = priceObj.usd;
          if (priceObj.eur !== undefined) coinInfo.eur = priceObj.eur;
          if (priceObj.btc !== undefined) coinInfo.btc = priceObj.btc;

          if (includeMarketCap && priceObj.usd_market_cap !== undefined) {
            coinInfo.market_cap_usd = priceObj.usd_market_cap;
          }
          if (include24hrChange && priceObj.usd_24h_change !== undefined) {
            coinInfo.change_24h_percent = priceObj.usd_24h_change;
          }
          if (include24hrVolume && priceObj.usd_24h_vol !== undefined) {
            coinInfo.volume_24h_usd = priceObj.usd_24h_vol;
          }
        }

        return coinInfo;
      });

      console.log('🪙 [COINGECKO] Formatted data for', formattedData.length, 'coins');
      const result = JSON.stringify(formattedData, null, 2);
      console.log('🪙 [COINGECKO] Returning result length:', result.length);
      return result;
    } catch (error) {
      console.error('🪙 [COINGECKO] Error in getCryptoPrices:', error);
      return `Error fetching crypto prices: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "get_crypto_prices",
    description: "Get current prices for cryptocurrencies from CoinGecko API. Supports multiple coins and currencies.",
    schema: z.object({
      ids: z.string().describe("Comma-separated list of cryptocurrency IDs (e.g., 'bitcoin,ethereum,cardano')"),
      vsCurrencies: z.string().optional().default("usd").describe("Comma-separated target currencies (e.g., 'usd,eur,btc')"),
      includeMarketCap: z.boolean().optional().default(false).describe("Include market capitalization data"),
      include24hrChange: z.boolean().optional().default(false).describe("Include 24-hour price change percentage"),
      include24hrVolume: z.boolean().optional().default(false).describe("Include 24-hour trading volume"),
    }),
  }
);

/**
 * Get trending cryptocurrencies
 */
export const getTrendingCoins = tool(
  async () => {
    console.log('🪙 [COINGECKO] getTrendingCoins called');

    try {
      const url = `${COINGECKO_BASE_URL}/search/trending`;
      console.log('🪙 [COINGECKO] Fetching trending from:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('🪙 [COINGECKO] Trending API response status:', response.status);

      if (!response.ok) {
        console.error('🪙 [COINGECKO] Trending API error response:', data);
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      // Format trending coins data
      const trendingCoins = data.coins?.map((coin: Record<string, unknown>, index: number) => {
        const item = coin.item;
        if (typeof item === 'object' && item !== null) {
          const itemObj = item as Record<string, unknown>;
          return {
            rank: index + 1,
            name: itemObj.name,
            symbol: typeof itemObj.symbol === 'string' ? itemObj.symbol.toUpperCase() : 'UNKNOWN',
            id: itemObj.id,
            thumb: itemObj.thumb,
            market_cap_rank: itemObj.market_cap_rank,
          };
        }
        return null;
      }).filter(Boolean) || [];

      console.log('🪙 [COINGECKO] Processed', trendingCoins.length, 'trending coins');
      const result = JSON.stringify({
        trending_coins: trendingCoins,
        total_count: trendingCoins.length
      }, null, 2);
      console.log('🪙 [COINGECKO] Returning trending result length:', result.length);
      return result;
    } catch (error) {
      console.error('🪙 [COINGECKO] Error in getTrendingCoins:', error);
      return `Error fetching trending coins: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "get_trending_coins",
    description: "Get the top trending cryptocurrencies from CoinGecko API.",
    schema: z.object({}),
  }
);

/**
 * Get detailed market data for cryptocurrencies
 */
export const getMarketData = tool(
  async ({
    vsCurrency = "usd",
    order = "market_cap_desc",
    perPage = 10,
    page = 1,
    sparkline = false,
    priceChangePercentage = "1h,24h,7d"
  }: {
    vsCurrency?: string;
    order?: string;
    perPage?: number;
    page?: number;
    sparkline?: boolean;
    priceChangePercentage?: string;
  }) => {
    try {
      const params = new URLSearchParams({
        vs_currency: vsCurrency,
        order,
        per_page: perPage.toString(),
        page: page.toString(),
        sparkline: sparkline.toString(),
        price_change_percentage: priceChangePercentage,
      });

      const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      // Format market data
      const marketData = data.map((coin: Record<string, unknown>) => ({
        id: coin.id,
        symbol: typeof coin.symbol === 'string' ? coin.symbol.toUpperCase() : 'UNKNOWN',
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        fully_diluted_valuation: coin.fully_diluted_valuation,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap_change_24h: coin.market_cap_change_24h,
        market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        ath: coin.ath,
        ath_change_percentage: coin.ath_change_percentage,
        ath_date: coin.ath_date,
        atl: coin.atl,
        atl_change_percentage: coin.atl_change_percentage,
        atl_date: coin.atl_date,
        last_updated: coin.last_updated,
      }));

      return JSON.stringify({
        market_data: marketData,
        count: marketData.length,
        page,
        per_page: perPage
      }, null, 2);
    } catch (error) {
      return `Error fetching market data: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "get_market_data",
    description: "Get comprehensive market data for cryptocurrencies including prices, market cap, volume, and price changes.",
    schema: z.object({
      vsCurrency: z.string().optional().default("usd").describe("Target currency (e.g., 'usd', 'eur', 'btc')"),
      order: z.string().optional().default("market_cap_desc").describe("Sort order (e.g., 'market_cap_desc', 'volume_desc', 'price_desc')"),
      perPage: z.number().optional().default(10).describe("Number of results per page (max 250)"),
      page: z.number().optional().default(1).describe("Page number"),
      sparkline: z.boolean().optional().default(false).describe("Include sparkline data (7 days)"),
      priceChangePercentage: z.string().optional().default("1h,24h,7d").describe("Price change percentages to include (comma-separated)"),
    }),
  }
);

/**
 * Get detailed information about a specific cryptocurrency
 */
export const getCoinInfo = tool(
  async ({
    id,
    localization = false,
    tickers = false,
    marketData = true,
    communityData = false,
    developerData = false,
    sparkline = false
  }: {
    id: string;
    localization?: boolean;
    tickers?: boolean;
    marketData?: boolean;
    communityData?: boolean;
    developerData?: boolean;
    sparkline?: boolean;
  }) => {
    try {
      const params = new URLSearchParams({
        localization: localization.toString(),
        tickers: tickers.toString(),
        market_data: marketData.toString(),
        community_data: communityData.toString(),
        developer_data: developerData.toString(),
        sparkline: sparkline.toString(),
      });

      const response = await fetch(`${COINGECKO_BASE_URL}/coins/${id}?${params}`);
      const data: Record<string, unknown> = await response.json();

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      // Format coin information
      const coinInfo: Record<string, unknown> = {
        id: data.id,
        symbol: typeof data.symbol === 'string' ? data.symbol.toUpperCase() : 'UNKNOWN',
        name: data.name,
        description: (typeof data.description === 'object' && data.description !== null && (data.description as Record<string, unknown>).en) ? (data.description as Record<string, unknown>).en as string : "No description available",
        homepage: (typeof data.links === 'object' && data.links !== null && Array.isArray((data.links as Record<string, unknown>).homepage)) ? ((data.links as Record<string, unknown>).homepage as string[])[0] : null,
        blockchain_site: (typeof data.links === 'object' && data.links !== null && Array.isArray((data.links as Record<string, unknown>).blockchain_site)) ? ((data.links as Record<string, unknown>).blockchain_site as string[])[0] : null,
        genesis_date: data.genesis_date || null,
        sentiment_votes_up_percentage: data.sentiment_votes_up_percentage || null,
        sentiment_votes_down_percentage: data.sentiment_votes_down_percentage || null,
        market_cap_rank: data.market_cap_rank || null,
        coingecko_rank: data.coingecko_rank || null,
        coingecko_score: data.coingecko_score || null,
        developer_score: data.developer_score || null,
        community_score: data.community_score || null,
        liquidity_score: data.liquidity_score || null,
        public_interest_score: data.public_interest_score || null,
      };

      if (marketData && typeof data.market_data === 'object' && data.market_data !== null) {
        const marketDataObj = data.market_data as Record<string, unknown>;
        coinInfo.market_data = {
          current_price: marketDataObj.current_price,
          market_cap: marketDataObj.market_cap,
          fully_diluted_valuation: marketDataObj.fully_diluted_valuation,
          total_volume: marketDataObj.total_volume,
          high_24h: marketDataObj.high_24h,
          low_24h: marketDataObj.low_24h,
          price_change_24h: marketDataObj.price_change_24h,
          price_change_percentage_24h: marketDataObj.price_change_percentage_24h,
          price_change_percentage_7d: marketDataObj.price_change_percentage_7d,
          price_change_percentage_14d: marketDataObj.price_change_percentage_14d,
          price_change_percentage_30d: marketDataObj.price_change_percentage_30d,
          price_change_percentage_60d: marketDataObj.price_change_percentage_60d,
          price_change_percentage_200d: marketDataObj.price_change_percentage_200d,
          price_change_percentage_1y: marketDataObj.price_change_percentage_1y,
          market_cap_change_24h: marketDataObj.market_cap_change_24h,
          market_cap_change_percentage_24h: marketDataObj.market_cap_change_percentage_24h,
          circulating_supply: marketDataObj.circulating_supply,
          total_supply: marketDataObj.total_supply,
          max_supply: marketDataObj.max_supply,
          ath: marketDataObj.ath,
          ath_change_percentage: marketDataObj.ath_change_percentage,
          ath_date: marketDataObj.ath_date,
          atl: marketDataObj.atl,
          atl_change_percentage: marketDataObj.atl_change_percentage,
          atl_date: marketDataObj.atl_date,
          last_updated: marketDataObj.last_updated,
        };
      }

      return JSON.stringify(coinInfo, null, 2);
    } catch (error) {
      return `Error fetching coin information: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "get_coin_info",
    description: "Get detailed information about a specific cryptocurrency including market data, description, and links.",
    schema: z.object({
      id: z.string().describe("CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')"),
      localization: z.boolean().optional().default(false).describe("Include localized descriptions"),
      tickers: z.boolean().optional().default(false).describe("Include ticker data"),
      marketData: z.boolean().optional().default(true).describe("Include market data"),
      communityData: z.boolean().optional().default(false).describe("Include community data"),
      developerData: z.boolean().optional().default(false).describe("Include developer data"),
      sparkline: z.boolean().optional().default(false).describe("Include sparkline data"),
    }),
  }
);

/**
 * Search for cryptocurrencies by name or symbol
 */
export const searchCoins = tool(
  async ({ query }: { query: string }) => {
    try {
      const response = await fetch(`${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      // Format search results
      const coins = data.coins?.slice(0, 20).map((coin: Record<string, unknown>) => ({
        id: coin.id,
        name: coin.name,
        symbol: typeof coin.symbol === 'string' ? coin.symbol.toUpperCase() : 'UNKNOWN',
        thumb: coin.thumb,
        market_cap_rank: coin.market_cap_rank,
      })) || [];

      return JSON.stringify({
        query,
        results: coins,
        total_results: coins.length
      }, null, 2);
    } catch (error) {
      return `Error searching coins: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "search_coins",
    description: "Search for cryptocurrencies by name or symbol on CoinGecko.",
    schema: z.object({
      query: z.string().describe("Search query (coin name or symbol)"),
    }),
  }
);
