import React, { useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { Mode } from '../model/common';
import { createAppTheme } from './theme';
import ThemeModeContext from './ThemeModeContext';


const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const getPreferredMode = (): Mode => {
		try {
			if (typeof window !== 'undefined' && window.matchMedia)
				return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		} catch {
			// ignore
		}
		return 'dark';
	};

	const [mode, setMode] = useState<Mode>(() => getPreferredMode());
	const theme = useMemo(() => createAppTheme(mode), [mode]);
	const toggleMode = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));

	return (
		<ThemeModeContext.Provider value={{ mode, toggleMode, setMode }}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ThemeModeContext.Provider>
	);
};

export default ThemeModeProvider;
