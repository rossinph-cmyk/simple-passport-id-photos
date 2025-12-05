import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = 'american' | 'indian' | 'filipino' | 'chinese' | 'spanish' | 'arabic';

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  buttonGradient: string[];
}

export const getThemeColors = (theme: AppTheme): ThemeColors => {
  switch (theme) {
    case 'american':
      return {
        primary: '#DC143C',    // Pure Crimson Red
        secondary: '#FFFFFF',  // White
        tertiary: '#0000FF',   // Pure Blue
        buttonGradient: ['#DC143C', '#0000FF'],
      };
    case 'indian':
      return {
        primary: '#FF9933',    // Saffron
        secondary: '#FFFFFF',  // White
        tertiary: '#138808',   // Green
        buttonGradient: ['#FF9933', '#138808'],
      };
    case 'filipino':
      return {
        primary: '#0038A8',    // Blue
        secondary: '#FFFFFF',  // White
        tertiary: '#CE1126',   // Red
        buttonGradient: ['#0038A8', '#CE1126'],
      };
    case 'chinese':
      return {
        primary: '#DE2910',    // Red
        secondary: '#FFDE00',  // Yellow
        tertiary: '#DE2910',   // Red
        buttonGradient: ['#DE2910', '#FFDE00'],
      };
    case 'spanish':
      return {
        primary: '#C60B1E',    // Red
        secondary: '#FFC400',  // Yellow
        tertiary: '#C60B1E',   // Red
        buttonGradient: ['#C60B1E', '#FFC400'],
      };
    case 'arabic':
      return {
        primary: '#EE161F',    // Red (UAE)
        secondary: '#00732F',  // Green (UAE)
        tertiary: '#000000',   // Black (UAE)
        buttonGradient: ['#EE161F', '#00732F'],
      };
    default:
      return {
        primary: '#DC143C',
        secondary: '#FFFFFF',
        tertiary: '#0000FF',
        buttonGradient: ['#DC143C', '#0000FF'],
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
      if (savedTheme === 'american' || savedTheme === 'indian' || savedTheme === 'filipino' ||
          savedTheme === 'chinese' || savedTheme === 'spanish' || savedTheme === 'arabic') {
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
