import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPreset } from '@/config/designPresets';
import type { DesignPreset } from '@/config/designPresets';

type Theme = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  designPreset: string;
  setDesignPreset: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
  designPreset: 'midnight',
  setDesignPreset: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyPresetColors(preset: DesignPreset, resolved: ResolvedTheme) {
  const root = document.documentElement;
  const palette = resolved === 'light'
    ? { ...preset.colors, ...preset.light }
    : preset.colors;

  for (const [key, value] of Object.entries(palette)) {
    root.style.setProperty(`--color-${key}`, value);
  }

  // Apply visual style properties
  const { style } = preset;

  // Border radius
  const radiusMap: Record<string, string> = { sharp: '4px', rounded: '12px', pill: '9999px' };
  const radiusSmMap: Record<string, string> = { sharp: '2px', rounded: '8px', pill: '9999px' };
  root.style.setProperty('--radius-card', radiusMap[style.radius] ?? '12px');
  root.style.setProperty('--radius-sm', radiusSmMap[style.radius] ?? '8px');

  // Font weight
  const weightMap: Record<string, string> = { normal: '400', medium: '500', bold: '600' };
  root.style.setProperty('--font-weight-heading', weightMap[style.fontWeight] ?? '400');

  // Card border
  root.dataset.cardBorder = style.cardBorder ? 'true' : 'false';

  // Sidebar style
  root.dataset.sidebarStyle = style.sidebarStyle;

  // Glow accent
  root.dataset.glowAccent = style.glowAccent ? 'true' : 'false';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('orchestrix_theme') as Theme) || 'dark';
  });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));
  const [designPreset, setDesignPresetState] = useState<string>(() => {
    return localStorage.getItem('orchestrix_design') || 'midnight';
  });

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem('orchestrix_theme', newTheme);
    setThemeState(newTheme);
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
  }, []);

  const setDesignPreset = useCallback((id: string) => {
    localStorage.setItem('orchestrix_design', id);
    setDesignPresetState(id);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    applyPresetColors(getPreset(designPreset), resolvedTheme);
  }, [resolvedTheme, designPreset]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, designPreset, setDesignPreset }}>
      {children}
    </ThemeContext.Provider>
  );
}
