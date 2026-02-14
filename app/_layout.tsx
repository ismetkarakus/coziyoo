import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import Toast, { BaseToast, ToastConfig } from 'react-native-toast-message';

import { ThemePreferenceProvider } from '@/src/context/ThemeContext';
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
    ...MaterialIcons.font,
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
  const toastConfig: ToastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: 'transparent',
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        text1Style={{ fontSize: 14, fontWeight: '700' }}
        text2Style={{ fontSize: 12, color: '#6B7280' }}
      />
    ),
  };

  return (
    <ThemePreferenceProvider>
      <CountryProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <AuthGuard>
                <WalletProvider>
                  <CartProvider>
              <Stack screenOptions={{ gestureEnabled: false }}>
          <Stack.Screen name="(buyer)" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(seller)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="food-detail" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="food-detail-order" options={{ headerShown: false, presentation: 'card' }} />
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
          <Stack.Screen name="seller-public-profile" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="admin-panel" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="terms-and-conditions" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="council-registration" options={{ headerShown: true, presentation: 'card' }} />
          <Stack.Screen name="hygiene-certificate" options={{ headerShown: true, presentation: 'card' }} />
          <Stack.Screen name="allergen-declaration" options={{ headerShown: true, presentation: 'card' }} />
          <Stack.Screen name="insurance-details" options={{ headerShown: true, presentation: 'card' }} />
          <Stack.Screen name="hygiene-rating" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="checkout" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="wallet" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="country-selection" options={{ headerShown: false }} />
              </Stack>
              <Toast config={toastConfig} />
                  </CartProvider>
                </WalletProvider>
              </AuthGuard>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </CountryProvider>
    </ThemePreferenceProvider>
  );
}
