import axios from 'axios';
import { Coin, CoinDetail, PricePoint } from '../types/coin';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const cache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 60000; // 1 minute

const getCached = (key: string) => {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCache = (key: string, data: any) => {
  cache[key] = { data, timestamp: Date.now() };
};

export const coinGeckoAPI = {
  getCoins: async (page: number = 1, perPage: number = 100): Promise<Coin[]> => {
    const cacheKey = `coins_${page}_${perPage}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${BASE_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: perPage,
          page: page,
          sparkline: false,
          price_change_percentage: '7d'
        }
      });
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching coins:', error);
      throw error;
    }
  },

  getCoinById: async (id: string): Promise<CoinDetail> => {
    const cacheKey = `coin_${id}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${BASE_URL}/coins/${id}`, {
        params: {
          localization: false,
          tickers: false,
          community_data: false,
          developer_data: false
        }
      });
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching coin details:', error);
      throw error;
    }
  },

  getCoinChart: async (id: string, days: number = 7): Promise<PricePoint[]> => {
    const cacheKey = `chart_${id}_${days}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days
        }
      });
      
      const priceData = response.data.prices.map((point: [number, number]) => ({
        timestamp: point[0],
        price: point[1],
        date: new Date(point[0]).toLocaleDateString()
      }));
      
      setCache(cacheKey, priceData);
      return priceData;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },

  getCategories: async (): Promise<string[]> => {
    const cacheKey = 'categories';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${BASE_URL}/coins/categories/list`);
      const categories = response.data.map((cat: any) => cat.name);
      setCache(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return ['DeFi', 'NFT', 'Meme', 'Exchange', 'Stablecoin'];
    }
  }
};