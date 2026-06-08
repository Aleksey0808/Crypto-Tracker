import { StyleSheet, StatusBar } from "react-native";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import AppProvider from './src/context/AppContext';

import PreviewScreen from './src/screens/PreviewScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from "./src/screens/HomeScreen";

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export type RootStackParamList = {
  Preview: undefined;
  Welcome: undefined;
  Home: undefined;
};

type TabParamList = {
  HomeTab: undefined;
};

const Stack = createStackNavigator<RootStackParamList, undefined>();
const Tab = createBottomTabNavigator<TabParamList, undefined>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'HomeTab') {
            return <FontAwesome5 name="bitcoin" size={24} color={color} />
          } 
        },
        tabBarActiveTintColor: '#ead409ff', 
        tabBarInactiveTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#1f62d6ff',
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <Stack.Navigator id={undefined} initialRouteName="Preview">
          <Stack.Screen name="Preview" component={PreviewScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03b0ea',
  },
});
