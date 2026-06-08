import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppContext } from '../context/AppContext';
import { RootStackParamList } from '../../App';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getApiErrorMessage, isRequestCanceled } from '../api/errors';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { getCoinDetails } from '../services/coinService';
import { CoinDetail } from '../types/coin';
import { buildCoinStats, cleanCoinDescription, formatPercentChange, formatUsd } from '../utils/formatters';

type DetailsRouteProp = RouteProp<RootStackParamList, 'Details'>;
type DetailsNavProp = StackNavigationProp<RootStackParamList, 'Details'>;

const DetailsScreen = ({navigation, route}: {navigation: DetailsNavProp, route: DetailsRouteProp }) => {
  const { coinId } = route.params;
  const { favorites, addFavorite, removeFavorite } = useContext(AppContext);
  const { isOffline } = useNetworkStatus();
  const isMountedRef = useRef(true);
  const activeRequestRef = useRef<AbortController | null>(null);

  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isFavorite = favorites.includes(coinId);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      activeRequestRef.current?.abort();
    };
  }, []);

  const fetchCoin = useCallback(async () => {
    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;

    try {
      setError('');
      const data = await getCoinDetails({ coinId, signal: controller.signal });
      if (!isMountedRef.current || controller.signal.aborted) return false;
      setCoin(data);
      return true;
    } catch (err) {
      if (isRequestCanceled(err) || !isMountedRef.current) return false;
      setError(getApiErrorMessage(err, 'Failed to load coin details.'));
      console.error(err);
      return true;
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
      }
    }
  }, [coinId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const completed = await fetchCoin();
      if (isMountedRef.current && completed) setLoading(false);
    };
    load();
  }, [fetchCoin]);

  const onRetry = async () => {
    setLoading(true);
    const completed = await fetchCoin();
    if (isMountedRef.current && completed) setLoading(false);
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(coinId);
    } else {
      addFavorite(coinId);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#f92020" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (error || !coin) {
    return (
      <SafeAreaView style={styles.container}>
        {isOffline ? <Text style={styles.offlineText}>No internet connection.</Text> : null}
        <Text style={styles.errorText}>{error || 'Something went wrong.'}</Text>
        <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
          <Text style={styles.retryText}>Tap to refresh</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const md = coin.market_data;
  const change24h = md.price_change_percentage_24h ?? 0;
  const change7d = md.price_change_percentage_7d ?? 0;
  const currentPrice = md.current_price.usd ?? 0;
  const isPositive24h = change24h >= 0;
  const isPositive7d = change7d >= 0;
  const description = cleanCoinDescription(coin.description.en);
  const stats = buildCoinStats(coin);

  return (
    <SafeAreaView style={styles.container}>
      {isOffline ? <Text style={styles.offlineText}>No internet connection.</Text> : null}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Entypo name="arrow-left" size={24} color={"#f92020"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favBtn}>
          {isFavorite ? (
            <MaterialIcons name="favorite" size={22} color={'#f10808'} />
          ) : (
            <MaterialIcons name="favorite-border" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.identity}>
          <Image source={{ uri: coin.image.large }} style={styles.coinImage} />
          <Text style={styles.coinName}>{coin.name}</Text>
          <Text style={styles.coinSymbol}>{coin.symbol.toUpperCase()}</Text>
        </View>

        <View style={styles.priceBlock}>
          <Text style={styles.price}>{formatUsd(currentPrice)}</Text>
          <View style={styles.changesRow}>
            <Text style={[styles.change, { color: isPositive24h ? '#22C55E' : '#EF4444' }]}>
              24h {formatPercentChange(change24h)}
            </Text>
            <Text style={[styles.change, { color: isPositive7d ? '#22C55E' : '#EF4444', marginLeft: 16 }]}>
              7d {formatPercentChange(change7d)}
            </Text>
          </View>
        </View>

        <View style={styles.statsBlock}>
          {stats.map(({ label, value }) => (
            <View key={label} style={styles.statRow}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          ))}
        </View>

        {description ? (
          <View style={styles.descBlock}>
            <Text style={styles.descTitle}>About {coin.name}</Text>
            <Text style={styles.descText}>{description}.</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03b0ea',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  backBtn: {
    padding: 8,
  },
  favBtn: {
    padding: 8,
  },
  identity: {
    alignItems: 'center',
    marginBottom: 20,
  },
  coinImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
  },
  coinName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  coinSymbol: {
    fontSize: 15,
    color: '#e0f0ff',
    marginTop: 4,
  },
  priceBlock: {
    backgroundColor: '#A8D5E2',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f92020',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  changesRow: {
    flexDirection: 'row',
  },
  change: {
    fontSize: 15,
    fontWeight: '600',
  },
  statsBlock: {
    backgroundColor: '#A8D5E2',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f92020',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#c0dce8',
  },
  statLabel: {
    fontSize: 14,
    color: '#444',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  descBlock: {
    backgroundColor: '#A8D5E2',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f92020',
  },
  descTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 21,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 40,
  },
  retryBtn: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f92020',
  },
  retryText: {
    color: '#f92020',
    fontSize: 16,
  },
  offlineText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
});

export default DetailsScreen;
