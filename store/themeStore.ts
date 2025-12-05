import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = 'american' | 'indian';

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => Promise<void>;
  loadTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = '@app_theme';

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'american',

  setTheme: async (theme: AppTheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      set({ theme });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },

  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'american' || savedTheme === 'indian') {
        set({ theme: savedTheme });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  },
}));
