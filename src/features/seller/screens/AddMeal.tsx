import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing, commonStyles } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

export const AddMeal: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    dailyStock: '',
    deliveryFee: '',
    maxDistance: '',
  });

  const [deliveryOptions, setDeliveryOptions] = useState({
    pickup: true,
    delivery: false,
  });

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDeliveryOption = (option: keyof typeof deliveryOptions) => {
    setDeliveryOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleImageUpload = () => {
    Alert.alert('Fotoğraf Ekle', 'Fotoğraf ekleme özelliği yakında gelecek.');
  };

  const handlePublish = () => {
    // Mock publish
    Alert.alert(
      'Başarılı!',
      'Yemeğiniz başarıyla yayınlandı.',
      [
        {
          text: 'Tamam',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="" 
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        }
        rightComponent={
          <Text variant="heading" weight="bold" color="primary" style={{ fontSize: 20 }}>
            Yemek Ekle
          </Text>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Photo Upload */}
          <View style={styles.photoSection}>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Yemek Fotoğrafı
            </Text>
            <TouchableOpacity 
              onPress={handleImageUpload}
              style={[styles.photoPlaceholder, { backgroundColor: colors.surface }]}
            >
              <Text variant="title" color="textSecondary">
                📸
              </Text>
              <Text variant="caption" color="textSecondary" style={styles.photoText}>
                Fotoğraf Ekle
              </Text>
            </TouchableOpacity>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Temel Bilgiler
            </Text>
            
            <FormField
              label="Yemek Adı"
              value={formData.name}
              onChangeText={handleInputChange('name')}
              placeholder="Örn: Ev Yapımı Mantı"
              required
            />

            <FormField
              label="Açıklama"
              value={formData.description}
              onChangeText={handleInputChange('description')}
              placeholder="Yemeğinizin özelliklerini açıklayın..."
              required
            />

            <FormField
              label="Fiyat (₺)"
              value={formData.price}
              onChangeText={handleInputChange('price')}
              placeholder="25"
              keyboardType="numeric"
              required
            />

            <FormField
              label="Günlük Stok"
              value={formData.dailyStock}
              onChangeText={handleInputChange('dailyStock')}
              placeholder="10"
              keyboardType="numeric"
              helperText="Günde kaç porsiyon hazırlayabilirsiniz?"
              required
            />
          </View>

          {/* Delivery Options */}
          <View style={styles.section}>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Teslimat Seçenekleri
            </Text>
            
            <View style={styles.deliveryOptions}>
              <Button
                variant={deliveryOptions.pickup ? "primary" : "outline"}
                onPress={() => toggleDeliveryOption('pickup')}
                style={styles.deliveryButton}
              >
                {deliveryOptions.pickup ? "✓ " : ""}Pickup (Gel Al)
              </Button>
              
              <Button
                variant={deliveryOptions.delivery ? "primary" : "outline"}
                onPress={() => toggleDeliveryOption('delivery')}
                style={styles.deliveryButton}
              >
                {deliveryOptions.delivery ? "✓ " : ""}Delivery (Teslimat)
              </Button>
            </View>

            {deliveryOptions.delivery && (
              <View style={styles.deliverySettings}>
                <FormField
                  label="Teslimat Ücreti (₺)"
                  value={formData.deliveryFee}
                  onChangeText={handleInputChange('deliveryFee')}
                  placeholder="5"
                  keyboardType="numeric"
                />

                <FormField
                  label="Maksimum Teslimat Mesafesi (km)"
                  value={formData.maxDistance}
                  onChangeText={handleInputChange('maxDistance')}
                  placeholder="3"
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          <Button
            variant="primary"
            fullWidth
            onPress={handlePublish}
            style={styles.publishButton}
          >
            Yemeği Yayınla
          </Button>
        </View>
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
  },
  form: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: commonStyles.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  photoText: {
    marginTop: Spacing.sm,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  deliveryOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  deliveryButton: {
    flex: 1,
  },
  deliverySettings: {
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  publishButton: {
    marginTop: Spacing.lg,
  },
});

