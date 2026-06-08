import axios, { AxiosError } from 'axios';

export type ApiErrorCode = 'offline' | 'timeout' | 'server' | 'network' | 'unknown';

export class ApiError extends Error {
  code: ApiErrorCode;
  status?: number;

  constructor(message: string, code: ApiErrorCode, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export const isRequestCanceled = (error: unknown) =>
  axios.isCancel(error) || (error instanceof AxiosError && error.code === 'ERR_CANCELED');

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong. Pull down to retry.') => {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallback;
};
