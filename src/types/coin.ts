export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
}

export interface CoinDetail {
  id: string;
  name: string;
  symbol: string;
  image: { large: string };
  market_data: {
    current_price: { usd: number | null };
    price_change_percentage_24h: number | null;
    price_change_percentage_7d: number | null;
    market_cap: { usd: number | null };
    total_volume: { usd: number | null };
    high_24h: { usd: number | null };
    low_24h: { usd: number | null };
    circulating_supply: number | null;
    max_supply: number | null;
  };
  description: { en: string };
}

export interface CoinStat {
  label: string;
  value: string;
}
