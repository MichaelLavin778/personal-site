export type AppEnv = 'local' | 'main' | 'production';

export const BASE_URLS: Record<AppEnv, string> = {
	local: 'http://localhost:5173/',
	main: 'https://main.d1y82t1cx4u01s.amplifyapp.com/',
	production: 'https://production.d1y82t1cx4u01s.amplifyapp.com/',
};

export const normalizeBaseUrl = (url: string): string => (url.endsWith('/') ? url : `${url}/`);

export const coerceAppEnv = (raw: string | undefined): AppEnv => {
	const candidate = (raw ?? 'local').toLowerCase();
	if (candidate === 'local' || candidate === 'main' || candidate === 'production') return candidate;
	if (candidate === 'prod') return 'production';
	return 'local';
};
