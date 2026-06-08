import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextType {
  favorites: string[];
  addFavorite: (item: string) => Promise<void>;
  removeFavorite: (item: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType>({
  favorites: [],
  addFavorite: async () => {},
  removeFavorite: async () => {},
});

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      } catch (error) {
        console.error('Error loading settings from AsyncStorage:', error);
      }
    };

    loadSettings();
  }, []);

  const addFavorite = useCallback(async (item: string) => {
    try {
      const updated = [...favorites, item];
      setFavorites(updated);
      await AsyncStorage.setItem('favorites', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving favorite to AsyncStorage:', error);
    }
  }, [favorites]);

  const removeFavorite = useCallback(async (item: string) => {
    try {
      const updated = favorites.filter((f) => f !== item);
      setFavorites(updated);
      await AsyncStorage.setItem('favorites', JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing favorite from AsyncStorage:', error);
    }
  }, [favorites]);

  const contextValue = useMemo(
    () => ({ favorites, addFavorite, removeFavorite }),
    [favorites, addFavorite, removeFavorite]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;