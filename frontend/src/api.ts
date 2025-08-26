import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export type PriceRange = 'month' | 'quarter' | 'semi-annual' | 'annual';

export interface PriceBucket {
  marketPrice: string;
  quantitySold: string;
  lowSalePrice: string;
  lowSalePriceWithShipping: string;
  highSalePrice: string;
  highSalePriceWithShipping: string;
  transactionCount: string;
  bucketStartDate: string;
}

export interface PriceResult {
  skuId: string;
  variant: string;
  language: string;
  condition: string;
  averageDailyQuantitySold: string;
  averageDailyTransactionCount: string;
  totalQuantitySold: string;
  totalTransactionCount: string;
  trendingMarketPricePercentages: Record<string, unknown>;
  buckets: PriceBucket[];
}

export interface TCGPlayerPriceHistory {
  count: number;
  result: PriceResult[];
}

export interface PriceHistoryResponse {
  setName: string;
  productId: string;
  priceHistory: TCGPlayerPriceHistory | null;
}

export interface PriceRangeResponse {
  productId: string;
  range: PriceRange;
  priceHistory: TCGPlayerPriceHistory | null;
}

export const api = {
  // Search for MTG set and get initial price data
  async searchSet(setName: string): Promise<PriceHistoryResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/search/${encodeURIComponent(setName)}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch set data: ${error.response?.data?.error || error.message}`);
      }
      throw new Error('Failed to fetch set data: Unknown error');
    }
  },

  // Get price history for specific product ID and range
  async getPriceHistory(productId: string, range: PriceRange = 'quarter'): Promise<PriceRangeResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/price-history/${productId}`, {
        params: { range }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch price history: ${error.response?.data?.error || error.message}`);
      }
      throw new Error('Failed to fetch price history: Unknown error');
    }
  }
};