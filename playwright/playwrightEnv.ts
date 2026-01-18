import { type AppEnv, BASE_URLS, coerceAppEnv, normalizeBaseUrl } from '../src/config/envUrls';

export const getPlaywrightEnv = (): AppEnv =>
	// eslint-disable-next-line no-undef
	coerceAppEnv(process.env.VITE_APP_ENV ?? process.env.APP_ENV);

export const getPlaywrightBaseUrl = (): string => normalizeBaseUrl(BASE_URLS[getPlaywrightEnv()]);
