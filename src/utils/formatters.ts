import { CoinDetail, CoinStat } from '../types/coin';

export const formatCompactUsd = (value: number) =>
  value >= 1_000_000_000
    ? `$${(value / 1_000_000_000).toFixed(2)}B`
    : value >= 1_000_000
    ? `$${(value / 1_000_000).toFixed(2)}M`
    : `$${value.toLocaleString()}`;

export const formatUsd = (value: number) => `$${value.toLocaleString()}`;

export const formatPercentChange = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

export const cleanCoinDescription = (description: string) =>
  description
    .replace(/<[^>]+>/g, '')
    .split('. ')
    .slice(0, 3)
    .join('. ');

export const buildCoinStats = (coin: CoinDetail): CoinStat[] => {
  const { market_data: marketData, symbol } = coin;
  const ticker = symbol.toUpperCase();

  return [
    { label: 'Market Cap', value: marketData.market_cap.usd ? formatCompactUsd(marketData.market_cap.usd) : '-' },
    { label: '24h Volume', value: marketData.total_volume.usd ? formatCompactUsd(marketData.total_volume.usd) : '-' },
    { label: '24h High', value: marketData.high_24h.usd ? formatUsd(marketData.high_24h.usd) : '-' },
    { label: '24h Low', value: marketData.low_24h.usd ? formatUsd(marketData.low_24h.usd) : '-' },
    {
      label: 'Circulating Supply',
      value: marketData.circulating_supply ? `${marketData.circulating_supply.toLocaleString()} ${ticker}` : '-',
    },
    {
      label: 'Max Supply',
      value: marketData.max_supply ? `${marketData.max_supply.toLocaleString()} ${ticker}` : 'Infinity',
    },
  ];
};
