import React, { useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { Mode } from '../model/common';
import { createAppTheme } from '../theme';
import ThemeModeContext from '../context/ThemeModeContext';


const THEME_MODE_STORAGE_KEY = 'THEME_MODE';


const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const getPreferredMode = (): Mode => {
		try {
			if (typeof window !== 'undefined') {
				const stored = window.localStorage?.getItem(THEME_MODE_STORAGE_KEY);
				if (stored === 'dark' || stored === 'light') return stored;

				if (window.matchMedia)
					return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}
		} catch {
			// ignore
		}
		return 'dark';
	};

	const [mode, setMode] = useState<Mode>(() => getPreferredMode());
	const theme = useMemo(() => createAppTheme(mode), [mode]);
	const setModePersisted = (nextMode: Mode) => {
		setMode(nextMode);
		try {
			if (typeof window !== 'undefined') window.localStorage?.setItem(THEME_MODE_STORAGE_KEY, nextMode);
		} catch {
			// ignore
		}
	};

	const toggleMode = () => setModePersisted(mode === 'dark' ? 'light' : 'dark');

	return (
		<ThemeModeContext.Provider value={{ mode, toggleMode, setMode: setModePersisted }}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ThemeModeContext.Provider>
	);
};

export default ThemeModeProvider;
