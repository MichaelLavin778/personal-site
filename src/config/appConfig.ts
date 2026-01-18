import { type AppEnv, BASE_URLS, coerceAppEnv, normalizeBaseUrl } from './envUrls';

export interface AppConfig {
	env: AppEnv;
	baseUrl: string;
}

export const getAppEnv = (): AppEnv => {
	type ViteMetaEnv = {
		VITE_APP_ENV?: string;
		MODE?: string;
	};

	const metaEnv = (import.meta as unknown as { env?: ViteMetaEnv }).env;
	return coerceAppEnv(metaEnv?.VITE_APP_ENV ?? metaEnv?.MODE);
};

export const getAppConfig = (): AppConfig => {
	const env = getAppEnv();
	const baseUrl = normalizeBaseUrl(BASE_URLS[env]);
	return { env, baseUrl };
};
