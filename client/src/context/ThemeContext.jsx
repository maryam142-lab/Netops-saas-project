import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

const getStoredTheme = () => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem('theme');
  return stored === 'light' || stored === 'dark' ? stored : null;
};

const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const storedTheme = getStoredTheme();
  const [theme, setTheme] = useState(storedTheme ?? getSystemTheme());
  const [hasStoredPreference, setHasStoredPreference] = useState(Boolean(storedTheme));

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    if (hasStoredPreference) {
      window.localStorage.setItem('theme', theme);
    }
  }, [theme, hasStoredPreference]);

  useEffect(() => {
    if (hasStoredPreference || typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      setTheme(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [hasStoredPreference]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
        if (!hasStoredPreference) {
          setHasStoredPreference(true);
        }
      },
    }),
    [theme, hasStoredPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
