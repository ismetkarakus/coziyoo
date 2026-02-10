import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, useRootNavigationState, useSegments } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Text } from '../ui';
import { Colors, Spacing } from '../../theme';
import { useTranslation } from '../../hooks/useTranslation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, userData, loading, profileLoading } = useAuth();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const group = segments[0];
  const { t } = useTranslation();
  
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

    if (loading || !rootNavigationState?.key) {
      console.log('⏳ Auth still loading, waiting...');
      return; // Auth durumu henüz yükleniyor
    }

    const inAuthGroup = segments[0] === '(auth)';

    // ZORLA REDIRECT - Kullanıcı yoksa auth'a git
    if (!user && !inAuthGroup) {
      console.log('🚨 FORCING REDIRECT: No user, going to sign-in');
      router.replace('/(auth)/sign-in');
      return;
    }

    // Kullanıcı varsa ve auth'daysa role göre yönlendir
    if (user && inAuthGroup) {
      if (!userData) {
        console.log('⏳ Waiting for user profile data before redirect...');
        return;
      }

      const isSeller =
        userData.userType === 'seller' ||
        userData.userType === 'both' ||
        (userData as any).sellerEnabled === true;
      console.log('✅ User logged in, redirecting by role', { isSeller });
      router.replace(isSeller ? '/(seller)/seller-panel' : '/(buyer)');
      return;
    }

    if (user && !inAuthGroup) {
      console.log('✅ User logged in and in correct section');
    } else if (!user && inAuthGroup) {
      console.log('👤 No user but in auth section - OK');
    }
  }, [user, userData, loading, segments, rootNavigationState?.key]);

  // Loading state
  if (loading || !rootNavigationState?.key) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body" color="textSecondary">
          {t('authGuard.loading')}
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
          {t('authGuard.loginRequired')}
        </Text>
        <Text variant="caption" color="textSecondary" style={{ marginTop: 8 }}>
          {t('authGuard.redirectingToLogin')}
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
          {t('authGuard.redirectingHome')}
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
