import React, { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppContext } from '../context/AppContext';
import { RootStackParamList } from '../../App';
import RenderCoin from '../components/RenderCoin';
import { getApiErrorMessage, isRequestCanceled } from '../api/errors';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { getMarketCoins } from '../services/coinService';
import { Coin } from '../types/coin';

type HomeNavProp = StackNavigationProp<RootStackParamList, 'Home'>;

const PAGE_SIZE = 20;

const HomeScreen = ({navigation}: { navigation: HomeNavProp }) => {
  const { favorites, addFavorite, removeFavorite } = useContext(AppContext);
  const { isOffline } = useNetworkStatus();
  const activeRequestRef = useRef<AbortController | null>(null);

  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
    };
  }, []);

  const fetchCoins = useCallback(async (pageNum: number, replace: boolean) => {
    console.log('fetchCoins START', pageNum);
    if (activeRequestRef.current) {
      console.log('aborting previous request');
      activeRequestRef.current.abort();
    }

    const controller = new AbortController();
    activeRequestRef.current = controller;

    try {
      setError('');
      console.log('before getMarketCoins');
      const data = await getMarketCoins({
        page: pageNum,
        perPage: PAGE_SIZE,
        signal: controller.signal,
      });
      console.log('after getMarketCoins, data length:', data.length);
      console.log('isMounted:', 'aborted:', controller.signal.aborted);

      if (controller.signal.aborted) {
        console.log('RETURNING EARLY - mounted or aborted');
        return;
      }

      setCoins((prev) => (replace ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.log('CATCH:', err);
      if (isRequestCanceled(err)) return;
      setError(getApiErrorMessage(err, 'Failed to load data. Pull down to retry.'));
    } finally {
      console.log('FINALLY');
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;

      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      await fetchCoins(1, true);
      if (!cancelled) setLoading(false);
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [fetchCoins]);


  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setSearch('');
    await fetchCoins(1, true);
    setRefreshing(false);
  };

  const onLoadMore = async () => {
    if (loadingMore || !hasMore || search.trim()) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchCoins(nextPage, false);
    setPage(nextPage);
    setLoadingMore(false);
  };


  const toggleFavorite = useCallback(
    (coinId: string) => {
      if (favorites.includes(coinId)) {
        removeFavorite(coinId);
      } else {
        addFavorite(coinId);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const filteredCoins = useMemo(
    () =>
      search.trim()
        ? coins.filter(
            (c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.symbol.toLowerCase().includes(search.toLowerCase())
          )
        : coins,
    [coins, search]
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <ActivityIndicator size="small" color="#f92020" style={{ marginVertical: 20 }} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Live Cryptocurrency Rates</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or ticker..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      {isOffline ? <Text style={styles.offlineText}>No internet connection.</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#f92020" style={{ marginTop: 30 }} />
      ) : error ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Text style={styles.refreshText}>Tap to refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCoins}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RenderCoin
              item={item} 
              navigation={navigation}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
              />
            )}
          initialNumToRender={10}
          windowSize={5}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#f92020"
              colors={['#f92020']}
            />
          }
          ListEmptyComponent={() => {
            return (
              <View style={{ alignItems: 'center', marginTop: 60 }}>
                <Image source={require('../../assets/empty.png')} style={styles.emptyIcon} />
                <Text style={styles.errorText}>No coins found.</Text>
              </View>
            )
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03b0ea',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    color: '#f92020',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f92020',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    height: 80,
    width: 80,
    marginBottom: 20,
  },
  refreshBtn: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f92020',
  },
  refreshText: {
    color: '#f92020',
    fontSize: 16,
  },
  offlineText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default HomeScreen;
