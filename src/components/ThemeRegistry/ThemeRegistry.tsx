'use client';

import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme, darkTheme } from '@/theme/theme';
import { ReactNode, useState, createContext, useContext, useMemo, useEffect } from 'react';
import { PaletteMode } from '@mui/material';

// Script to prevent flash of wrong theme
const themeScript = `
  (function() {
    function getThemePreference() {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme');
      }
      // Default to dark theme
      return 'dark';
    }
    
    document.documentElement.dataset.theme = getThemePreference();
  })();
`;

type ThemeContextType = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark', // Set default context value to dark
  toggleColorMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  // Initialize theme - start with dark theme to match SSR default
  const [mode, setMode] = useState<PaletteMode>('dark');
  const [isMounted, setIsMounted] = useState(false);

  // Sync with localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as PaletteMode;
    if (savedTheme && savedTheme !== mode) {
      setMode(savedTheme);
    }
    setIsMounted(true);
  }, [mode]);

  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'mui' });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  // Add listener for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!localStorage.getItem('theme')) {
        setMode('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('theme', newMode);
      },
    }),
    [mode]
  );

  const currentTheme = useMemo(
    () => (mode === 'light' ? theme : darkTheme),
    [mode]
  );

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <style
          key={cache.key}
          data-emotion={`${cache.key} ${names.join(' ')}`}
          dangerouslySetInnerHTML={{
            __html: styles,
          }}
        />
      </>
    );
  });

  return (
    <ThemeContext.Provider value={colorMode}>
      <CacheProvider value={cache}>
        <ThemeProvider theme={currentTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
} 