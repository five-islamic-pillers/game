import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

/**
 * Detect system dark mode preference
 */
export function getSystemTheme(): ThemeMode {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Get the initial theme: checks localStorage first, falls back to system preference
 */
export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('app-theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {
    // Ignore storage access error
  }
  return getSystemTheme();
}

/**
 * Apply the theme class to documentElement
 */
export function applyThemeClass(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
}

/**
 * Custom React hook for theme management
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const initial = getInitialTheme();
    applyThemeClass(initial);
    return initial;
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    applyThemeClass(newTheme);
    try {
      localStorage.setItem('app-theme', newTheme);
    } catch {}
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  useEffect(() => {
    // Apply current theme on mount
    applyThemeClass(theme);

    // If user has not explicitly set a theme in localStorage, listen to system color changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem('app-theme');
        if (!saved) {
          const sysTheme: ThemeMode = e.matches ? 'dark' : 'light';
          setThemeState(sysTheme);
          applyThemeClass(sysTheme);
        }
      } catch {}
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, [theme]);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };
}
