import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { WebSafeIcon } from '../../../components/ui';

interface Address {
  id: string;
  title: string;
  address: string;
  isDefault: boolean;
}

export const Addresses: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await AsyncStorage.getItem('addresses');
      if (data) {
        setAddresses(JSON.parse(data));
      } else {
        // Default addresses
        const defaultAddresses: Address[] = [
          {
            id: '1',
            title: 'Ev',
            address: 'Kadıköy Mah. Bağdat Cad. No:123 Kadıköy/İstanbul',
            isDefault: true,
          },
          {
            id: '2',
            title: 'İş',
            address: 'Levent Mah. Büyükdere Cad. No:456 Şişli/İstanbul',
            isDefault: false,
          },
        ];
        setAddresses(defaultAddresses);
        await AsyncStorage.setItem('addresses', JSON.stringify(defaultAddresses));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    setAddresses(updatedAddresses);
    await AsyncStorage.setItem('addresses', JSON.stringify(updatedAddresses));
  };

  const deleteAddress = (addressId: string) => {
    Alert.alert(
      'Adresi Sil',
      'Bu adresi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
            setAddresses(updatedAddresses);
            await AsyncStorage.setItem('addresses', JSON.stringify(updatedAddresses));
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Adreslerim"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <WebSafeIcon name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={() => Alert.alert('Yakında', 'Yeni adres ekleme özelliği yakında gelecek.')}>
            <WebSafeIcon name="plus" size={20} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.map((address) => (
          <Card key={address.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressTitleRow}>
                <Text variant="subheading" weight="medium">
                  {address.title}
                </Text>
                {address.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                    <Text variant="caption" style={{ color: 'white' }}>
                      Varsayılan
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.addressActions}>
                <TouchableOpacity
                  onPress={() => setDefaultAddress(address.id)}
                  disabled={address.isDefault}
                >
                  <WebSafeIcon 
                    name="check-circle" 
                    size={20} 
                    color={address.isDefault ? colors.primary : colors.textSecondary} 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteAddress(address.id)}
                  style={styles.deleteButton}
                >
                  <WebSafeIcon name="trash" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
            <Text variant="body" color="textSecondary" style={styles.addressText}>
              {address.address}
            </Text>
          </Card>
        ))}

        {addresses.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="body" color="textSecondary" style={styles.emptyText}>
              Henüz kayıtlı adresiniz bulunmuyor.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  addressCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  addressText: {
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    textAlign: 'center',
  },
});

