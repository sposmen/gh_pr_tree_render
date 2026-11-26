import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext(null);
const modes = ['system', 'light', 'dark'];

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return modes.includes(saved) ? saved : 'system';
    } catch { return 'system'; }
  });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const theme = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    update();
    return () => media.removeEventListener('change', update);
  }, []);

  useLayoutEffect(() => {
    document.documentElement.dataset.bsTheme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const changeMode = (value) => {
    if (!modes.includes(value)) return;
    setMode(value);
    try { localStorage.setItem('theme', value); } catch { /* Storage may be disabled. */ }
  };

  return <ThemeContext.Provider value={{ mode, theme, setMode: changeMode }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
