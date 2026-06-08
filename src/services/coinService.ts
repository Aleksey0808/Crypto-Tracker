import { apiClient } from '../api/client';
import { Coin, CoinDetail } from '../types/coin';

interface MarketCoinsParams {
  page: number;
  perPage: number;
  signal?: AbortSignal;
}

interface FavoriteCoinsParams {
  ids: string[];
  signal?: AbortSignal;
}

interface CoinDetailsParams {
  coinId: string;
  signal?: AbortSignal;
}

export const getMarketCoins = async ({ page, perPage, signal }: MarketCoinsParams) => {
  const { data } = await apiClient.get<Coin[]>('/coins/markets', {
    signal,
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: perPage,
      page,
      sparkline: false,
    },
  });

  return data;
};

export const getFavoriteCoins = async ({ ids, signal }: FavoriteCoinsParams) => {
  if (ids.length === 0) {
    return [];
  }

  const { data } = await apiClient.get<Coin[]>('/coins/markets', {
    signal,
    params: {
      vs_currency: 'usd',
      ids: ids.join(','),
      order: 'market_cap_desc',
      sparkline: false,
    },
  });

  return data;
};

export const getCoinDetails = async ({ coinId, signal }: CoinDetailsParams) => {
  const { data } = await apiClient.get<CoinDetail>(`/coins/${coinId}`, {
    signal,
    params: {
      localization: false,
      tickers: false,
      community_data: false,
      developer_data: false,
    },
  });

  return data;
};
