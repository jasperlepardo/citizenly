'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

import { logger } from '@/lib/logging';

// Types
interface User {
  id: string;
  email: string;
  role: string;
  barangay_code?: string;
}

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Theme state
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;

  // UI state
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  notifications: Notification[];

  // App settings
  locale: string;
  timezone: string;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_PRIMARY_COLOR'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_MOBILE_MENU' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_LOCALE'; payload: string }
  | { type: 'SET_TIMEZONE'; payload: string }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  theme: 'system',
  primaryColor: '#3b82f6',
  sidebarOpen: true,
  mobileMenuOpen: false,
  notifications: [],
  locale: 'en-PH',
  timezone: 'Asia/Manila',
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'SET_PRIMARY_COLOR':
      return {
        ...state,
        primaryColor: action.payload,
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case 'TOGGLE_MOBILE_MENU':
      return {
        ...state,
        mobileMenuOpen: !state.mobileMenuOpen,
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            ...action.payload,
            id: `notif-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
          },
        ].slice(-10), // Keep only last 10 notifications
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case 'SET_LOCALE':
      return {
        ...state,
        locale: action.payload,
      };

    case 'SET_TIMEZONE':
      return {
        ...state,
        timezone: action.payload,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context
interface AppContextValue extends AppState {
  // Auth actions
  login: (user: User) => void;
  logout: () => void;

  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setPrimaryColor: (color: string) => void;

  // UI actions
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;

  // Notification actions
  notify: (type: Notification['type'], message: string) => void;
  dismissNotification: (id: string) => void;

  // Settings actions
  setLocale: (locale: string) => void;
  setTimezone: (timezone: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
    },
  },
});

// Provider component
interface AppProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export function AppProvider({ children, initialUser = null }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: false,
  });

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;

    if (state.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', state.theme === 'dark');
    }

    // Set primary color CSS variable
    root.style.setProperty('--color-primary', state.primaryColor);
  }, [state.theme, state.primaryColor]);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      const settings = {
        theme: state.theme,
        primaryColor: state.primaryColor,
        locale: state.locale,
        timezone: state.timezone,
      };
      localStorage.setItem('app-settings', JSON.stringify(settings));
    } catch (error) {
      logger.error('Failed to save settings', { error });
    }
  }, [state.theme, state.primaryColor, state.locale, state.timezone]);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('app-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.theme) dispatch({ type: 'SET_THEME', payload: settings.theme });
        if (settings.primaryColor)
          dispatch({ type: 'SET_PRIMARY_COLOR', payload: settings.primaryColor });
        if (settings.locale) dispatch({ type: 'SET_LOCALE', payload: settings.locale });
        if (settings.timezone) dispatch({ type: 'SET_TIMEZONE', payload: settings.timezone });
      }
    } catch (error) {
      logger.error('Failed to load settings', { error });
    }
  }, []);

  // Auto-dismiss old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oldNotifications = state.notifications.filter(
        n => now - n.timestamp > 10000 // 10 seconds
      );
      oldNotifications.forEach(n => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: n.id });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.notifications]);

  // Context value
  const contextValue: AppContextValue = {
    ...state,

    // Auth actions
    login: (user: User) => {
      dispatch({ type: 'SET_USER', payload: user });
      logger.info('User logged in', { userId: user.id });
    },

    logout: () => {
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'RESET_STATE' });
      logger.info('User logged out');
    },

    // Theme actions
    setTheme: theme => dispatch({ type: 'SET_THEME', payload: theme }),
    setPrimaryColor: color => dispatch({ type: 'SET_PRIMARY_COLOR', payload: color }),

    // UI actions
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    toggleMobileMenu: () => dispatch({ type: 'TOGGLE_MOBILE_MENU' }),

    // Notification actions
    notify: (type, message) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type, message } });
    },

    dismissNotification: id => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    },

    // Settings actions
    setLocale: locale => dispatch({ type: 'SET_LOCALE', payload: locale }),
    setTimezone: timezone => dispatch({ type: 'SET_TIMEZONE', payload: timezone }),
  };

  return (
    <AppContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </AppContext.Provider>
  );
}

// Hook to use app context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Convenience hooks
export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout } = useApp();
  return { user, isAuthenticated, isLoading, login, logout };
}

export function useTheme() {
  const { theme, primaryColor, setTheme, setPrimaryColor } = useApp();
  return { theme, primaryColor, setTheme, setPrimaryColor };
}

export function useNotifications() {
  const { notifications, notify, dismissNotification } = useApp();
  return { notifications, notify, dismissNotification };
}

export function useUI() {
  const { sidebarOpen, mobileMenuOpen, toggleSidebar, toggleMobileMenu } = useApp();
  return { sidebarOpen, mobileMenuOpen, toggleSidebar, toggleMobileMenu };
}

export default AppProvider;
