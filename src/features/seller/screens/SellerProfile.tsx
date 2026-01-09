import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
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
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: SELLER_DATA.name,
    nickname: '', // Nickname alanı eklendi
    email: SELLER_DATA.email,
    phone: SELLER_DATA.phone,
    location: SELLER_DATA.location,
    address: SELLER_DATA.address,
    description: SELLER_DATA.description,
  });

  // Uzmanlık alanları state'i
  const [specialties, setSpecialties] = useState(SELLER_DATA.specialties);
  const [newSpecialty, setNewSpecialty] = useState('');

  // Katlanabilir bölümler state'leri
  const [identityExpanded, setIdentityExpanded] = useState(false);
  const [bankDetailsExpanded, setBankDetailsExpanded] = useState(false);

  // Kimlik ve banka bilgileri state'leri
  const [identityImages, setIdentityImages] = useState({
    front: null as string | null,
    back: null as string | null,
  });

  // Kimlik doğrulama durumu
  const [identityVerification, setIdentityVerification] = useState({
    status: 'pending', // pending, verified, rejected
    submittedAt: null as string | null,
    verifiedAt: null as string | null,
    rejectionReason: null as string | null,
  });
  
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountHolderName: '',
    iban: '',
    accountNumber: '',
  });


  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('sellerProfile');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setFormData(profileData.formData || formData);
        setAvatarUri(profileData.avatarUri || null);
        setSpecialties(profileData.specialties || SELLER_DATA.specialties);
        setBankDetails(profileData.bankDetails || bankDetails);
        setIdentityImages(profileData.identityImages || identityImages);
        setIdentityVerification(profileData.identityVerification || identityVerification);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const saveProfileData = async () => {
    try {
      const profileData = {
        formData,
        avatarUri,
        specialties,
        bankDetails,
        identityImages,
        identityVerification,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('sellerProfile', JSON.stringify(profileData));
      console.log('Profile data saved successfully');
    } catch (error) {
      console.error('Error saving profile data:', error);
      throw error;
    }
  };

  const handleBackPress = () => {
    console.log('Back button pressed from SellerProfile');
    router.back(); // Go back to previous page
  };

  const handleSave = async () => {
    try {
      await saveProfileData();
      Alert.alert(
        'Profil Güncellendi',
        'Profil bilgileriniz başarıyla güncellendi.',
        [{ text: 'Tamam', onPress: () => setIsEditing(false) }]
      );
    } catch (error) {
      Alert.alert(
        'Hata',
        'Profil bilgileri kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const handleCancel = () => {
    // Reset form data
    loadProfileData(); // Reload saved data
    setIsEditing(false);
  };

  // Avatar image picker
  const handleAvatarImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gerekli.');
      return;
    }

    Alert.alert(
      'Profil Fotoğrafı',
      'Nasıl eklemek istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kameradan Çek', onPress: () => takeAvatarPhoto() },
        { text: 'Galeriden Seç', onPress: () => pickAvatarImage() },
      ]
    );
  };

  const takeAvatarPhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera erişim izni gerekli.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const pickAvatarImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  // Kimlik belgesi fotoğrafı çekme/seçme
  const handleIdentityImagePicker = async (side: 'front' | 'back') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gerekli.');
      return;
    }

    Alert.alert(
      'Kimlik Belgesi Fotoğrafı',
      'Nasıl eklemek istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kameradan Çek', onPress: () => takeIdentityPhoto(side) },
        { text: 'Galeriden Seç', onPress: () => pickIdentityImage(side) },
      ]
    );
  };

  const takeIdentityPhoto = async (side: 'front' | 'back') => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera erişim izni gerekli.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIdentityImages(prev => ({
        ...prev,
        [side]: result.assets[0].uri,
      }));
    }
  };

  const pickIdentityImage = async (side: 'front' | 'back') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIdentityImages(prev => ({
        ...prev,
        [side]: result.assets[0].uri,
      }));
    }
  };


  // Uzmanlık alanı ekleme
  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties(prev => [...prev, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  // Uzmanlık alanı silme
  const handleRemoveSpecialty = (specialtyToRemove: string) => {
    setSpecialties(prev => prev.filter(specialty => specialty !== specialtyToRemove));
  };

  // Kimlik doğrulama gönderme
  const handleSubmitIdentityVerification = () => {
    if (!formData.name.trim()) {
      Alert.alert('Hata', 'Lütfen gerçek ad soyad bilginizi girin.');
      return;
    }

    if (!identityImages.front || !identityImages.back) {
      Alert.alert('Hata', 'Lütfen kimlik belgenizin ön ve arka yüzünü ekleyin.');
      return;
    }

    Alert.alert(
      'Kimlik Doğrulama Gönder',
      'Kimlik doğrulama talebiniz gönderilsin mi? Bu işlem sonrası belgeleriniz incelenecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Gönder',
          onPress: () => submitIdentityVerification(),
        },
      ]
    );
  };

  const submitIdentityVerification = () => {
    // Kimlik doğrulama durumunu güncelle
    setIdentityVerification({
      status: 'pending',
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
      rejectionReason: null,
    });

    Alert.alert(
      'Başarılı',
      'Kimlik doğrulama talebiniz gönderildi. 24-48 saat içinde sonuçlandırılacak.',
      [{ text: 'Tamam' }]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
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
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Header */}
        <Card variant="default" padding="lg" style={styles.headerCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: avatarUri || SELLER_DATA.avatar }}
                style={styles.avatar}
                defaultSource={{ uri: 'https://via.placeholder.com/100x100/7FAF9A/FFFFFF?text=S' }}
              />
              {isEditing && (
                <TouchableOpacity 
                  style={styles.avatarEditButton}
                  onPress={handleAvatarImagePicker}
                >
                  <FontAwesome name="camera" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              {/* Nickname Display */}
              {formData.nickname && (
                <Text variant="heading" weight="bold" style={styles.profileNickname}>
                  {formData.nickname}
                  {identityVerification.status === 'verified' && (
                    <Text style={styles.verifiedBadge}> ✓</Text>
                  )}
                </Text>
              )}
              
              <Text variant="caption" color="textSecondary">
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
                label="Nickname"
                value={formData.nickname}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nickname: text }))}
                placeholder="Kullanıcı adınızı girin"
              />
              
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
                <FontAwesome name="user" size={16} color={colors.textSecondary} />
                <Text variant="body" style={styles.infoText}>
                  {formData.name}
                  {identityVerification.status === 'verified' && (
                    <Text style={styles.verifiedBadge}> ✓ Doğrulandı</Text>
                  )}
                </Text>
              </View>
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
            <View style={styles.aboutEditContainer}>
              <FormField
                label="Açıklama"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Kendinizi ve mutfak deneyiminizi tanıtın"
                multiline
                numberOfLines={3}
                style={styles.aboutTextArea}
                textAlignVertical="top"
              />
              
              {/* Uzmanlık Alanları Düzenleme */}
              <View style={styles.specialtiesEditSection}>
                <Text variant="body" weight="medium" style={styles.specialtiesEditTitle}>
                  Uzmanlık Alanları
                </Text>
                
                {/* Mevcut Uzmanlık Alanları - 3 Sütun Düzeni */}
                <View style={styles.specialtiesGridContainer}>
                  {specialties.map((specialty, index) => (
                    <View key={index} style={styles.specialtyPlainItem}>
                      <Text style={[styles.specialtyPlainText, { color: colors.text }]}>
                        {specialty}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveSpecialty(specialty)}
                        style={[styles.removeSpecialtyPlainButton, { backgroundColor: colors.error }]}
                      >
                        <FontAwesome name="times" size={10} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                {/* Yeni Uzmanlık Alanı Ekleme */}
                <View style={styles.addSpecialtyContainer}>
                  <Text variant="body" weight="medium" style={styles.addSpecialtyLabel}>
                    Yeni Kategori Ekle
                  </Text>
                  <View style={styles.addSpecialtyInputContainer}>
                    <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                      <Input
                        value={newSpecialty}
                        onChangeText={setNewSpecialty}
                        placeholder="Örn: İtalyan Mutfağı, Vegan Yemekler, Gluten-Free Tarifler"
                        style={styles.addSpecialtyInput}
                        onSubmitEditing={handleAddSpecialty}
                        multiline={true}
                        numberOfLines={1}
                        textAlignVertical="top"
                      />
                    </View>
                    <TouchableOpacity
                      onPress={handleAddSpecialty}
                      style={[
                        styles.addSpecialtyModernButton, 
                        { 
                          backgroundColor: newSpecialty.trim() ? colors.primary : colors.textSecondary + '80',
                        }
                      ]}
                      disabled={!newSpecialty.trim()}
                    >
                      <FontAwesome name="plus" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.aboutViewContainer}>
              <Text variant="body" style={styles.description}>
                {formData.description}
              </Text>
              
              {/* Uzmanlık Alanları Görüntüleme */}
              {specialties.length > 0 && (
                <View style={styles.specialtiesViewSection}>
                  <Text variant="body" weight="medium" style={styles.specialtiesViewTitle}>
                    Uzmanlık Alanları
                  </Text>
                  <View style={styles.specialtiesViewGrid}>
                    {specialties.map((specialty, index) => (
                      <View key={index} style={styles.specialtyViewPlainItem}>
                        <FontAwesome name="check-circle" size={14} color={colors.primary} />
                        <Text style={[styles.specialtyViewPlainText, { color: colors.text }]}>
                          {specialty}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </Card>


        {/* Identity Documents */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <TouchableOpacity
            onPress={() => setIdentityExpanded(!identityExpanded)}
            style={styles.collapsibleHeader}
            activeOpacity={0.7}
          >
            <View style={styles.identityHeader}>
              <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                Kimlik Doğrulama
              </Text>
              <View style={styles.headerRight}>
                <View style={[
                  styles.verificationStatus,
                  {
                    backgroundColor: identityVerification.status === 'verified' ? colors.success + '20' :
                                   identityVerification.status === 'rejected' ? colors.error + '20' :
                                   colors.warning + '20'
                  }
                ]}>
                  <Text variant="caption" style={{
                    color: identityVerification.status === 'verified' ? colors.success :
                           identityVerification.status === 'rejected' ? colors.error :
                           colors.warning
                  }}>
                    {identityVerification.status === 'verified' ? '✓ Doğrulandı' :
                     identityVerification.status === 'rejected' ? '✗ Reddedildi' :
                     '⏳ Beklemede'}
                  </Text>
                </View>
                <FontAwesome 
                  name={identityExpanded ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={colors.textSecondary}
                  style={{ marginLeft: 8 }}
                />
              </View>
            </View>
          </TouchableOpacity>
          
          {identityExpanded && (
            <>
              {identityVerification.status === 'rejected' && identityVerification.rejectionReason && (
                <View style={[styles.rejectionNote, { backgroundColor: colors.error + '10', borderColor: colors.error }]}>
                  <Text variant="caption" color="error">
                    ❌ Red Sebebi: {identityVerification.rejectionReason}
                  </Text>
                </View>
              )}
          
          <View style={styles.identityContainer}>
            {/* Kimlik Ön Yüz */}
            <View style={styles.identitySection}>
              <Text variant="body" weight="medium" style={styles.identityLabel}>
                Kimlik Ön Yüzü
              </Text>
              <TouchableOpacity
                style={[styles.identityImageContainer, { borderColor: colors.border }]}
                onPress={() => handleIdentityImagePicker('front')}
              >
                {identityImages.front ? (
                  <Image source={{ uri: identityImages.front }} style={styles.identityImage} />
                ) : (
                  <View style={styles.identityPlaceholder}>
                    <FontAwesome name="id-card" size={40} color={colors.textSecondary} />
                    <Text variant="caption" color="textSecondary" style={styles.identityPlaceholderText}>
                      Kimlik ön yüzü ekle
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Kimlik Arka Yüz */}
            <View style={styles.identitySection}>
              <Text variant="body" weight="medium" style={styles.identityLabel}>
                Kimlik Arka Yüzü
              </Text>
              <TouchableOpacity
                style={[styles.identityImageContainer, { borderColor: colors.border }]}
                onPress={() => handleIdentityImagePicker('back')}
              >
                {identityImages.back ? (
                  <Image source={{ uri: identityImages.back }} style={styles.identityImage} />
                ) : (
                  <View style={styles.identityPlaceholder}>
                    <FontAwesome name="id-card-o" size={40} color={colors.textSecondary} />
                    <Text variant="caption" color="textSecondary" style={styles.identityPlaceholderText}>
                      Kimlik arka yüzü ekle
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Identity Verification */}
          {identityImages.front && identityImages.back && identityVerification.status === 'pending' && (
            <View style={styles.submitSection}>
              <Button
                variant="primary"
                onPress={handleSubmitIdentityVerification}
                style={styles.submitButton}
              >
                Kimlik Doğrulama Gönder
              </Button>
            </View>
          )}

              <View style={[styles.warningBox, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
                <FontAwesome name="info-circle" size={16} color={colors.warning} />
                <Text variant="caption" color="warning" style={styles.warningText}>
                  Kimlik belgeleriniz güvenlik amacıyla şifrelenerek saklanır ve sadece doğrulama için kullanılır. 
                  Gerçek adınız kimlik belgenizdeki isimle eşleşmelidir.
                </Text>
              </View>
            </>
          )}
        </Card>

        {/* Bank Details */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <TouchableOpacity
            onPress={() => setBankDetailsExpanded(!bankDetailsExpanded)}
            style={styles.collapsibleHeader}
            activeOpacity={0.7}
          >
            <View style={styles.bankHeader}>
              <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                Banka Bilgileri
              </Text>
              <FontAwesome 
                name={bankDetailsExpanded ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
          
          {bankDetailsExpanded && (
            <>
              {isEditing ? (
                <View style={styles.formContainer}>
                  <FormField
                    label="Banka Adı"
                    value={bankDetails.bankName}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, bankName: text }))}
                placeholder="Örn: Türkiye İş Bankası"
              />
              <FormField
                label="Hesap Sahibi Adı"
                value={bankDetails.accountHolderName}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountHolderName: text }))}
                placeholder="Hesap sahibinin tam adı"
              />
              <FormField
                label="IBAN"
                value={bankDetails.iban}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, iban: text }))}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                maxLength={32}
              />
              <FormField
                label="Hesap Numarası"
                value={bankDetails.accountNumber}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountNumber: text }))}
                placeholder="Hesap numaranız"
                keyboardType="numeric"
              />
            </View>
          ) : (
            <View style={styles.infoContainer}>
              {bankDetails.bankName ? (
                <View style={styles.infoRow}>
                  <FontAwesome name="bank" size={16} color={colors.textSecondary} />
                  <Text variant="body" style={styles.infoText}>{bankDetails.bankName}</Text>
                </View>
              ) : null}
              {bankDetails.accountHolderName ? (
                <View style={styles.infoRow}>
                  <FontAwesome name="user" size={16} color={colors.textSecondary} />
                  <Text variant="body" style={styles.infoText}>{bankDetails.accountHolderName}</Text>
                </View>
              ) : null}
              {bankDetails.iban ? (
                <View style={styles.infoRow}>
                  <FontAwesome name="credit-card" size={16} color={colors.textSecondary} />
                  <Text variant="body" style={styles.infoText}>{bankDetails.iban}</Text>
                </View>
              ) : null}
              {bankDetails.accountNumber ? (
                <View style={styles.infoRow}>
                  <FontAwesome name="hashtag" size={16} color={colors.textSecondary} />
                  <Text variant="body" style={styles.infoText}>{bankDetails.accountNumber}</Text>
                </View>
              ) : null}
              {!bankDetails.bankName && !bankDetails.accountHolderName && !bankDetails.iban && !bankDetails.accountNumber && (
                <Text variant="body" color="textSecondary" style={styles.emptyStateText}>
                  Banka bilgileri henüz eklenmemiş. Düzenle butonuna tıklayarak ekleyebilirsiniz.
                </Text>
                )}
              </View>
              )}
            </>
          )}

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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
    flexGrow: 1,
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
  profileNickname: {
    marginBottom: Spacing.xs,
    color: Colors.light.primary,
  },
  realName: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  verifiedBadge: {
    color: Colors.light.success,
    fontWeight: 'bold',
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
  // Kimlik bilgileri stilleri
  identityContainer: {
    gap: Spacing.lg,
  },
  identitySection: {
    alignItems: 'center',
  },
  identityLabel: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  identityImageContainer: {
    width: 200,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  identityImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  identityPlaceholder: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  identityPlaceholderText: {
    textAlign: 'center',
  },
  identityEditIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  warningText: {
    flex: 1,
    lineHeight: 18,
  },
  // Hakkımda bölümü stilleri
  aboutEditContainer: {
    gap: Spacing.lg,
  },
  aboutViewContainer: {
    gap: Spacing.md,
  },
  specialtiesEditSection: {
    gap: Spacing.md,
  },
  specialtiesEditTitle: {
    marginBottom: Spacing.sm,
  },
  specialtiesViewSection: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  specialtiesViewTitle: {
    marginBottom: Spacing.sm,
  },
  // 3 sütun düzeni - Düzenleme modu (oval yok)
  specialtiesGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'flex-start',
  },
  specialtyPlainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    width: '31%', // 3 sütun için
    minWidth: '31%',
  },
  specialtyPlainText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    flexShrink: 0,
  },
  removeSpecialtyPlainButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Görüntüleme modu 3 sütun (oval yok)
  specialtiesViewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'flex-start',
  },
  specialtyViewPlainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    width: '31%', // 3 sütun için
    minWidth: '31%',
  },
  specialtyViewPlainText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    flexShrink: 0,
  },
  // Modern ekleme bölümü stilleri
  addSpecialtyContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: Spacing.sm,
  },
  addSpecialtyLabel: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  addSpecialtyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
    minHeight: 44,
  },
  addSpecialtyInput: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    minHeight: 44,
    maxHeight: 120, // Maksimum yükseklik
    textAlignVertical: 'top',
  },
  addSpecialtyModernButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Hakkımda textarea stili
  aboutTextArea: {
    minHeight: 80,
    maxHeight: 200,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  // Boş durum metni
  emptyStateText: {
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: Spacing.lg,
  },
  // Nickname ve kimlik doğrulama stilleri
  realNameSection: {
    marginBottom: Spacing.md,
  },
  privacyNote: {
    padding: Spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  identityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  verificationStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  rejectionNote: {
    padding: Spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  submitSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
  },
  // Katlanabilir bölüm stilleri
  collapsibleHeader: {
    marginBottom: Spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});




