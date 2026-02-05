import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Card, Button, Checkbox } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { WebSafeIcon } from '../../../components/ui';
import { useTranslation } from '../../../hooks/useTranslation';
import { FormField } from '../../../components/forms';

interface Address {
  id: string;
  title: string;
  address: string;
  isDefault: boolean;
}

export const Addresses: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    address: '',
    isDefault: false,
  });

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
            title: t('addressesScreen.defaultAddresses.homeTitle'),
            address: t('addressesScreen.defaultAddresses.homeAddress'),
            isDefault: true,
          },
          {
            id: '2',
            title: t('addressesScreen.defaultAddresses.workTitle'),
            address: t('addressesScreen.defaultAddresses.workAddress'),
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
      t('addressesScreen.deleteTitle'),
      t('addressesScreen.deleteMessage'),
      [
        { text: t('addressesScreen.deleteCancel'), style: 'cancel' },
        {
          text: t('addressesScreen.deleteConfirm'),
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

  const openAddModal = () => {
    setNewAddress({ title: '', address: '', isDefault: false });
    setAddModalVisible(true);
  };

  const handleAddAddress = async () => {
    if (!newAddress.title.trim() || !newAddress.address.trim()) {
      Alert.alert(t('addressesScreen.addErrorTitle'), t('addressesScreen.addErrorMessage'));
      return;
    }

    const shouldBeDefault = newAddress.isDefault || addresses.every(addr => !addr.isDefault);
    const createdAddress: Address = {
      id: `addr_${Date.now()}`,
      title: newAddress.title.trim(),
      address: newAddress.address.trim(),
      isDefault: shouldBeDefault,
    };

    const updatedAddresses = shouldBeDefault
      ? [createdAddress, ...addresses.map(addr => ({ ...addr, isDefault: false }))]
      : [createdAddress, ...addresses];

    setAddresses(updatedAddresses);
    await AsyncStorage.setItem('addresses', JSON.stringify(updatedAddresses));
    setAddModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={t('addressesScreen.title')}
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <WebSafeIcon name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
        rightComponent={
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={openAddModal}>
              <WebSafeIcon name="plus" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
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
                      {t('addressesScreen.defaultLabel')}
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
              {t('addressesScreen.empty')}
            </Text>
          </View>
        )}

      </ScrollView>

      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <Card variant="default" padding="md" style={styles.modalCard}>
              <Text variant="subheading" weight="semibold" style={styles.modalTitle}>
                {t('addressesScreen.addTitle')}
              </Text>
              <FormField
                label={t('addressesScreen.addLabelTitle')}
                value={newAddress.title}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, title: text }))}
                placeholder={t('addressesScreen.addPlaceholderTitle')}
              />
              <FormField
                label={t('addressesScreen.addLabelAddress')}
                value={newAddress.address}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, address: text }))}
                placeholder={t('addressesScreen.addPlaceholderAddress')}
                multiline
                numberOfLines={3}
              />
              <Checkbox
                label={t('addressesScreen.addDefaultLabel')}
                checked={newAddress.isDefault}
                onPress={() => setNewAddress(prev => ({ ...prev, isDefault: !prev.isDefault }))}
              />
              <View style={styles.modalActions}>
                <Button
                  variant="ghost"
                  onPress={() => setAddModalVisible(false)}
                  style={styles.modalButton}
                >
                  {t('addressesScreen.addCancel')}
                </Button>
                <Button
                  variant="primary"
                  onPress={handleAddAddress}
                  style={styles.modalButton}
                >
                  {t('addressesScreen.addSave')}
                </Button>
              </View>
            </Card>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  headerRight: {
    width: '100%',
    alignItems: 'flex-end',
    paddingRight: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContainer: {
    width: '100%',
  },
  modalCard: {
    borderRadius: 16,
  },
  modalTitle: {
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  modalButton: {
    minWidth: 100,
  },
});


