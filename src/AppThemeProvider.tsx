import { useCurrentUserStore } from '@hooks';
import { createAppTheme } from './muitheme';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';

const getInitialSystemMode = (): PaletteMode => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const settings = useCurrentUserStore((state) => state.settings);
  const [systemMode, setSystemMode] = useState<PaletteMode>(getInitialSystemMode);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      setSystemMode(event.matches ? 'dark' : 'light');
    };

    setSystemMode(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const resolvedMode: PaletteMode =
    settings.theme.mode === 'system' ? systemMode : settings.theme.mode;

  const theme = useMemo(
    () => createAppTheme(resolvedMode, settings.theme.accentPreset),
    [resolvedMode, settings.theme.accentPreset]
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.theme = resolvedMode;
    document.documentElement.dataset.accent = settings.theme.accentPreset;
  }, [resolvedMode, settings.theme.accentPreset]);

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};
