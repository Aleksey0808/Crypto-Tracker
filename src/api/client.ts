import NetInfo from '@react-native-community/netinfo';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError, isRequestCanceled } from './errors';

export const apiClient = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (config.signal && (config.signal as AbortSignal).aborted) {
    throw new axios.Cancel('Request cancelled before start');
  }

  try {
    const state = await NetInfo.fetch();
    const isOffline =
      state.isConnected === false || state.isInternetReachable === false;

    if (isOffline) {
      throw new ApiError(
        'No internet connection. Check your network and try again.',
        'offline'
      );
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isRequestCanceled(error)) {
      return Promise.reject(error);
    }

    if (error instanceof ApiError) {
      return Promise.reject(error);
    }

    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(
          new ApiError('Request timed out. Pull down to retry.', 'timeout')
        );
      }

      if (error.response) {
        return Promise.reject(
          new ApiError(
            'Server error. Please try again in a moment.',
            'server',
            error.response.status
          )
        );
      }

      return Promise.reject(
        new ApiError('Network error. Check your connection and try again.', 'network')
      );
    }

    return Promise.reject(
      new ApiError('Unexpected error. Please try again.', 'unknown')
    );
  }
);