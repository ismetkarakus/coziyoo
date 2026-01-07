import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, useSegments } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Text } from '../ui';
import { Colors, Spacing } from '../../theme';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // Auth durumu henüz yükleniyor

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Kullanıcı giriş yapmamış ve auth sayfasında değil
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      // Kullanıcı giriş yapmış ama auth sayfasında
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body" color="textSecondary">
          Yükleniyor...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});
