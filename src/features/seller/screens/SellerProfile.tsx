import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text, Button, Card, Input } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Mock Seller Data
const SELLER_DATA = {
  name: 'Ayşe Hanım',
  email: 'ayse@example.com',
  phone: '+90 532 123 45 67',
  location: 'Kadıköy, İstanbul',
  address: 'Moda Caddesi No: 123, Kadıköy/İstanbul',
  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  description: 'Ev yemekleri konusunda 15 yıllık deneyimim var. Geleneksel Türk mutfağının lezzetlerini sizlerle paylaşmaktan mutluluk duyuyorum.',
  specialties: ['Türk Mutfağı', 'Ev Yemekleri', 'Hamur İşleri', 'Çorbalar'],
  rating: 4.8,
  totalOrders: 156,
  joinDate: 'Ocak 2023',
};

export const SellerProfile: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: SELLER_DATA.name,
    email: SELLER_DATA.email,
    phone: SELLER_DATA.phone,
    location: SELLER_DATA.location,
    address: SELLER_DATA.address,
    description: SELLER_DATA.description,
  });

  const handleBackPress = () => {
    console.log('Back button pressed from SellerProfile');
    router.back(); // Go back to previous page
  };

  const handleSave = () => {
    Alert.alert(
      'Profil Güncellendi',
      'Profil bilgileriniz başarıyla güncellendi.',
      [{ text: 'Tamam', onPress: () => setIsEditing(false) }]
    );
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: SELLER_DATA.name,
      email: SELLER_DATA.email,
      phone: SELLER_DATA.phone,
      location: SELLER_DATA.location,
      address: SELLER_DATA.address,
      description: SELLER_DATA.description,
    });
    setIsEditing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Satıcı Profili"
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
        rightComponent={
          !isEditing ? (
            <TouchableOpacity 
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
              activeOpacity={0.7}
            >
              <FontAwesome name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : null
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card variant="default" padding="lg" style={styles.headerCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: SELLER_DATA.avatar }}
                style={styles.avatar}
                defaultSource={{ uri: 'https://via.placeholder.com/100x100/7FAF9A/FFFFFF?text=S' }}
              />
              {isEditing && (
                <TouchableOpacity style={styles.avatarEditButton}>
                  <FontAwesome name="camera" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <Text variant="heading" weight="bold" style={styles.profileName}>
                {formData.name}
              </Text>
              <Text variant="body" color="textSecondary">
                {SELLER_DATA.joinDate} tarihinden beri üye
              </Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text variant="subheading" weight="bold" color="primary">
                    ⭐ {SELLER_DATA.rating}
                  </Text>
                  <Text variant="caption" color="textSecondary">Puan</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="subheading" weight="bold" color="primary">
                    {SELLER_DATA.totalOrders}
                  </Text>
                  <Text variant="caption" color="textSecondary">Sipariş</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Contact Information */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            İletişim Bilgileri
          </Text>
          
          {isEditing ? (
            <View style={styles.formContainer}>
              <FormField
                label="Ad Soyad"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Adınızı ve soyadınızı girin"
              />
              <FormField
                label="E-posta"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="E-posta adresinizi girin"
                keyboardType="email-address"
              />
              <FormField
                label="Telefon"
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Telefon numaranızı girin"
                keyboardType="phone-pad"
              />
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <FontAwesome name="envelope" size={16} color={colors.textSecondary} />
                <Text variant="body" style={styles.infoText}>{formData.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <FontAwesome name="phone" size={16} color={colors.textSecondary} />
                <Text variant="body" style={styles.infoText}>{formData.phone}</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Location Information */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Konum Bilgileri
          </Text>
          
          {isEditing ? (
            <View style={styles.formContainer}>
              <FormField
                label="Şehir/İlçe"
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                placeholder="Şehir ve ilçe bilginizi girin"
              />
              <FormField
                label="Adres"
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                placeholder="Detaylı adres bilginizi girin"
                multiline
                numberOfLines={3}
              />
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <FontAwesome name="map-marker" size={16} color={colors.textSecondary} />
                <Text variant="body" style={styles.infoText}>{formData.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <FontAwesome name="home" size={16} color={colors.textSecondary} />
                <Text variant="body" style={styles.infoText}>{formData.address}</Text>
              </View>
            </View>
          )}
        </Card>

        {/* About Section */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Hakkımda
          </Text>
          
          {isEditing ? (
            <FormField
              label="Açıklama"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Kendinizi ve mutfak deneyiminizi tanıtın"
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text variant="body" style={styles.description}>
              {formData.description}
            </Text>
          )}
        </Card>

        {/* Specialties */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Uzmanlık Alanları
          </Text>
          
          <View style={styles.specialtiesContainer}>
            {SELLER_DATA.specialties.map((specialty, index) => (
              <View key={index} style={[styles.specialtyTag, { backgroundColor: colors.primary }]}>
                <Text variant="caption" style={styles.specialtyText}>
                  {specialty}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <Button
              variant="outline"
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              İptal
            </Button>
            <Button
              variant="primary"
              onPress={handleSave}
              style={styles.saveButton}
            >
              Kaydet
            </Button>
          </View>
        )}

        <View style={styles.bottomSpace} />
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
  backButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  editButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  headerCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    marginBottom: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  sectionCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  formContainer: {
    gap: Spacing.md,
  },
  infoContainer: {
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
  },
  description: {
    lineHeight: 22,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  specialtyTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
  },
  specialtyText: {
    color: 'white',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
