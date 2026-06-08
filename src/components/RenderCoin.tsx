// src/components/Header.js
import React, { useContext } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type AnyNavProp = StackNavigationProp<RootStackParamList>;

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
}

const RenderCoin = React.memo(({ item, navigation, toggleFavorite, favorites }: { item: Coin; navigation: AnyNavProp; toggleFavorite: (id: string) => void; favorites: string[] }) => {
    const change = item.price_change_percentage_24h ?? 0;
    const price = item.current_price ?? 0;
    const isPositive = change >= 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Details', { coinId: item.id })}
      >
        <FastImage
          source={{
            uri: item.image,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          style={styles.coinImage}
          resizeMode={FastImage.resizeMode.contain}
          />

        <View style={styles.cardMiddle}>
          <Text style={styles.coinName}>{item.name}</Text>
          <Text style={styles.coinSymbol}>{item.symbol.toUpperCase()}</Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.price}>${price.toLocaleString()}</Text>
          <Text style={[styles.change, { color: isPositive ? '#22C55E' : '#EF4444' }]}>
            {isPositive ? '+' : ''}
            {change.toFixed(2)}%
          </Text>
        </View>

        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => toggleFavorite(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {favorites.includes(item.id) ? <MaterialIcons name="favorite" size={22} color={'#f10808'} /> : <MaterialIcons name="favorite-border" size={24} color="black" />}
          
        </TouchableOpacity>
      </TouchableOpacity>
    );
  });
  
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#A8D5E2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f92020',
  },
  coinImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  cardMiddle: {
    flex: 1,
  },
  coinName: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  coinSymbol: {
    color: '#444',
    fontSize: 13,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  price: {
    color: '#000',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteBtn: {
    paddingLeft: 4,
  },
});

export default RenderCoin;