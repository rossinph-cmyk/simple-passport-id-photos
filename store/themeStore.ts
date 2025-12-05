import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = 'american' | 'indian';

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  buttonGradient: string[];
}

export const getThemeColors = (theme: AppTheme): ThemeColors => {
  if (theme === 'american') {
    return {
      primary: '#DC143C',    // Pure Crimson Red
      secondary: '#FFFFFF',  // White
      tertiary: '#0000FF',   // Pure Blue
      buttonGradient: ['#DC143C', '#0000FF'],
    };
  } else {
    return {
      primary: '#FF9933',    // Saffron
      secondary: '#FFFFFF',  // White
      tertiary: '#138808',   // Green
      buttonGradient: ['#FF9933', '#138808'],
    };
  }
};

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => Promise<void>;
  loadTheme: () => Promise<void>;
  getColors: () => ThemeColors;
}

const THEME_STORAGE_KEY = '@app_theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
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

  getColors: () => {
    return getThemeColors(get().theme);
  },
}));
