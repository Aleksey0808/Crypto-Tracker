import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppContext } from '../context/AppContext';
import { RootStackParamList } from '../../App';
import RenderCoin from '../components/RenderCoin';
import { getApiErrorMessage, isRequestCanceled } from '../api/errors';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { getFavoriteCoins } from '../services/coinService';
import { Coin } from '../types/coin';

type FavoritesNavProp = StackNavigationProp<RootStackParamList, 'Favorites'>;

const FavoritesScreen = ({navigation}: { navigation: FavoritesNavProp }) => {
  const { favorites, addFavorite, removeFavorite } = useContext(AppContext);
  const { isOffline } = useNetworkStatus();
  const isMountedRef = useRef(true);
  const activeRequestRef = useRef<AbortController | null>(null);

  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      activeRequestRef.current?.abort();
    };
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (favorites.length === 0) {
      setCoins([]);
      setError('');
      return true;
    }

    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;

    try {
      setError('');
      const data = await getFavoriteCoins({ ids: favorites, signal: controller.signal });
      if (!isMountedRef.current || controller.signal.aborted) return false;
      setCoins(data);
      return true;
    } catch (err) {
      if (isRequestCanceled(err) || !isMountedRef.current) return false;
      setError(getApiErrorMessage(err, 'Failed to load favorites. Pull down to retry.'));
      console.error('Error fetching favorites:', err);
      return true;
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
      }
    }
  }, [favorites]);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      const completed = await fetchFavorites();
      if (isMountedRef.current && completed) setLoading(false);
    };
    load();
  }, [fetchFavorites]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    if (isMountedRef.current) setRefreshing(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Favorites</Text>

      {isOffline ? <Text style={styles.offlineText}>No internet connection.</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#f92020" style={{ marginTop: 30 }} />
      ) : error ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.errorText}>{error}</Text>
          <Text onPress={onRefresh} style={styles.retryText}>Tap to refresh</Text>
        </View>
      ) : (
        <FlatList
          data={coins}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RenderCoin
              item={item}
              navigation={navigation}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#f92020"
              colors={['#f92020']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image source={require('../../assets/empty.png')} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No favorites yet.</Text>
              <Text style={styles.emptySubText}>
                Tap the star on any coin to add it here.
              </Text>
            </View>
          }
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    height: 80,
    width: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 14,
    color: '#e0f0ff',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
  retryText: {
    color: '#f92020',
    fontSize: 16,
    marginTop: 12,
  },
  offlineText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default FavoritesScreen;
