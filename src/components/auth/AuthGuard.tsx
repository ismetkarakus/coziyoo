import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { Text } from '../ui';
import { Colors, Spacing } from '../../theme';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, userData, loading, profileLoading } = useAuth();
  const segments = useSegments();
  const group = segments[0];
  
  // ✅ Çok akıllı bekleme - cache varsa hiç bekleme
  const shouldWait = loading && !userData;

  useEffect(() => {
    console.log('🔐 AuthGuard Check:', {
      user: user ? `${user.email} (${user.uid})` : 'null',
      loading,
      segments,
      inAuthGroup: segments[0] === '(auth)',
      currentPath: segments.join('/')
    });

    if (loading) {
      console.log('⏳ Auth still loading, waiting...');
      return; // Auth durumu henüz yükleniyor
    }

    const inAuthGroup = segments[0] === '(auth)';

    // ZORLA REDIRECT - Kullanıcı yoksa auth'a git
    if (!user && !inAuthGroup) {
      console.log('🚨 FORCING REDIRECT: No user, going to sign-in');
      router.replace('/sign-in');
      return;
    }

    // Kullanıcı varsa ve auth'daysa tabs'a git
    if (user && inAuthGroup) {
      console.log('✅ User logged in, redirecting to tabs');
      router.replace('/(tabs)');
      return;
    }

    if (user && !inAuthGroup) {
      console.log('✅ User logged in and in correct section');
    } else if (!user && inAuthGroup) {
      console.log('👤 No user but in auth section - OK');
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

  // GÜÇLÜ KONTROL: Kullanıcı yoksa erişimi engelle
  const inAuthGroup = segments[0] === '(auth)';
  
  if (!user && !inAuthGroup) {
    console.log('🚫 BLOCKING ACCESS - no user and not in auth');
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body" color="textSecondary">
          🔐 Giriş yapmanız gerekiyor...
        </Text>
        <Text variant="caption" color="textSecondary" style={{ marginTop: 8 }}>
          Giriş sayfasına yönlendiriliyor...
        </Text>
      </View>
    );
  }

  // Kullanıcı varsa ama auth sayfasındaysa loading göster (useEffect yönlendirecek)
  if (user && inAuthGroup) {
    console.log('🔄 User exists but in auth, redirecting to tabs');
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body" color="textSecondary">
          Ana sayfaya yönlendiriliyor...
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

