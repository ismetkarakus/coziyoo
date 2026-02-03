import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useColorScheme } from '@/components/useColorScheme';
import { CartProvider } from '@/src/context/CartContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { NotificationProvider } from '@/src/context/NotificationContext';
import { WalletProvider } from '@/src/context/WalletContext';
import { CountryProvider } from '@/src/context/CountryContext';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { AuthGuard } from '@/src/components/auth/AuthGuard';
import { initDatabase } from '@/src/api/utils/db';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Start with auth flow
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <CountryProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <AuthGuard>
              <WalletProvider>
                <CartProvider>
            <Stack screenOptions={{ gestureEnabled: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(seller)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="food-detail" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="personal-info" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="change-password" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="addresses" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="location-settings" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="favorites" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="notification-settings" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="help-center" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="contact" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="about" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="order-history" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="seller-profile" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="admin-panel" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="terms-and-conditions" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="council-registration" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="hygiene-certificate" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="allergen-declaration" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="insurance-details" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="hygiene-rating" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="checkout" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="wallet" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="country-selection" options={{ headerShown: false }} />
            </Stack>
                </CartProvider>
              </WalletProvider>
            </AuthGuard>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </CountryProvider>
  );
}
