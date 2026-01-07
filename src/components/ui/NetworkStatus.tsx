import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

interface NetworkStatusProps {
  showWhenOnline?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  showWhenOnline = false 
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // React Native için NetInfo kullan
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online ?? true);
      
      // Offline olduğunda her zaman göster
      // Online olduğunda sadece showWhenOnline true ise göster
      setShowStatus(!online || showWhenOnline);
    });

    // İlk durumu kontrol et
    NetInfo.fetch().then(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online ?? true);
      setShowStatus(!online || showWhenOnline);
    });

    return () => {
      unsubscribe();
    };
  }, [showWhenOnline]);

  if (!showStatus) return null;

  return (
    <View style={[
      styles.container,
      isOnline ? styles.online : styles.offline
    ]}>
      <Ionicons 
        name={isOnline ? "wifi" : "wifi-outline"} 
        size={16} 
        color={isOnline ? "#4CAF50" : "#FF5722"} 
      />
      <Text style={[
        styles.text,
        isOnline ? styles.onlineText : styles.offlineText
      ]}>
        {isOnline ? "🟢 Çevrimiçi" : "🔴 Çevrimdışı - Bazı özellikler sınırlı"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  online: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  offline: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF5722',
    borderWidth: 1,
  },
  text: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  onlineText: {
    color: '#2E7D32',
  },
  offlineText: {
    color: '#D84315',
  },
});
