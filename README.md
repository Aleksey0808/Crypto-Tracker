# Crypto Tracker

A React Native mobile application for tracking cryptocurrency prices in real time, built with Expo.

## Features

- Live cryptocurrency prices powered by CoinGecko API
- Search by coin name or ticker symbol
- Pagination
- Add/remove coins from favorites
- Detailed coin info — price, market cap, volume, supply, description
- Pull-to-refresh
- Offline detection
- Favorites persisted locally via AsyncStorage

## Tech Stack

- [React Native](https://reactnative.dev/) 0.81.4
- [Expo] SDK 54
- [TypeScript]
- [React Navigation]
- [Axios]
- [CoinGecko API]
- [AsyncStorage]
- [React Native Fast Image]

## Project Structure

    src/
    ├── components/
    │   └── RenderCoin        # Reusable coin card component
    ├── context/
    │   └── AppContext         # Global state — favorites
    ├── hooks/
    │   └── useNetworkStatus   # Online/offline detection
    ├── screens/
    │   ├── PreviewScreen      # Splash/loading screen
    │   ├── WelcomeScreen      # Onboarding screen
    │   ├── HomeScreen         # Coin list with search and pagination
    │   ├── FavoritesScreen    # Saved favorites
    │   └── DetailsScreen      # Detailed coin info
    ├── services/
    │   └── coinService        # CoinGecko API calls
    ├── types/
    │   └── coin               # TypeScript interfaces
    └── utils/
        └── formatters         # Number/price formatting helpers

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/crypto-tracker.git
cd crypto-tracker

# Install dependencies
npm install --legacy-peer-deps

# Prebuild native project
npx expo prebuild --platform android --clean

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

## API

This app uses the free tier of the [CoinGecko API](https://www.coingecko.com/en/api). No API key is required.

Key endpoints used:

- `GET /coins/markets` — paginated list of coins by market cap
- `GET /coins/{id}` — detailed info for a single coin

> Note: The free tier has rate limits. If you see request errors, wait a moment and pull to refresh.
