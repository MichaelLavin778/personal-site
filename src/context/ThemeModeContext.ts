import { createContext, useContext } from 'react';
import type { Mode } from '../model/common';


interface ThemeModeContextValue {
    mode: Mode;
    toggleMode: () => void;
    // eslint-disable-next-line no-unused-vars
    setMode: (mode: Mode) => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue>({
    mode: 'dark',
    toggleMode: () => {},
    setMode: () => {}
});

export const useThemeMode = () => useContext(ThemeModeContext);

export default ThemeModeContext;
