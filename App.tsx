import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { supabase } from './src/lib/supabase';
import { useAuthStore } from './src/store/useAuthStore';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/utils/colorPalette';
import { StatusBar } from 'expo-status-bar';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    accent: Colors.accent,
    background: Colors.background,
    surface: Colors.surface,
    error: Colors.error,
  },
};

import { useSeedResources } from './src/hooks/useSeedResources';

export default function App() {
  const { session, setSession, loading } = useAuthStore();
  useSeedResources(session);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a splash screen
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        {session ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </PaperProvider>
  );
}
