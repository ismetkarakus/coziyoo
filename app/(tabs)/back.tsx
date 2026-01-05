import React, { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

// Bu sayfa yanlışlıkla açılırsa otomatik geri döner
export default function BackScreen() {
  useEffect(() => {
    // Sayfa yüklendiğinde otomatik geri dön
    router.back();
  }, []);

  return <View />;
}
