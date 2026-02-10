import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Text, Button, Card, Input } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { TopBar } from '../../../components/layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import sellerMock from '../../../mock/seller.json';
import { useCountry } from '../../../context/CountryContext';

export const SellerProfile: React.FC = () => {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const { currentCountry } = useCountry();
  const localizedMock = (sellerMock as any)[currentLanguage] ?? sellerMock.tr;
  const complianceCopy = currentCountry.code === 'TR' ? localizedMock.panel.compliance.tr : localizedMock.panel.compliance.uk;
  const sellerData = {
    name: localizedMock.profile.name,
    email: localizedMock.profile.email,
    phone: localizedMock.profile.phone,
    location: localizedMock.profile.location,
    address: localizedMock.profile.address,
    avatar: localizedMock.profile.avatar,
    description: localizedMock.profile.description,
    specialties: localizedMock.profile.specialties,
    rating: localizedMock.profile.rating,
    totalOrders: localizedMock.profile.totalOrders,
    joinDate: localizedMock.profile.joinDate,
  };
  const [editingSection, setEditingSection] = useState<
    null | 'contact' | 'location' | 'about' | 'identity' | 'bank'
  >(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [formData, setFormData] = useState({
    firstName: sellerData.name.split(' ')[0] || sellerData.name,
    lastName: sellerData.name.split(' ').slice(1).join(' ').trim(),
    nickname: localizedMock.profile.nickname || '', // Nickname alanı eklendi
    email: sellerData.email,
    phone: sellerData.phone,
    location: sellerData.location,
    address: sellerData.address,
    description: sellerData.description,
    deliveryDistance: '',
  });

  const getFullName = (data = formData) => {
    const first = data.firstName?.trim() || '';
    const last = data.lastName?.trim() || '';
    return [first, last].filter(Boolean).join(' ') || sellerData.name;
  };

  // Uzmanlık alanları state'i
  const [specialties, setSpecialties] = useState(sellerData.specialties);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [complianceExpanded, setComplianceExpanded] = useState(false);
  const isContactEditing = editingSection === 'contact';
  const isLocationEditing = editingSection === 'location';
  const isAboutEditing = editingSection === 'about';
  const isIdentityEditing = editingSection === 'identity';
  const isBankEditing = editingSection === 'bank';

  const isComplianceComplete = () => {
    const complianceStatus = {
      councilRegistered: true,
      hygieneCertificate: true,
      allergensDeclared: true,
      hygieneRating: true,
      insurance: true,
      termsAccepted: true,
      approved: true,
    };

    return Object.values(complianceStatus).every(status => status === true);
  };

  const complianceComplete = isComplianceComplete();

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

  useEffect(() => {
    if (section === 'bank') {
      setEditingSection('bank');
    }
  }, [section]);

  // Debug avatar changes
  useEffect(() => {
    console.log('Avatar URI changed:', avatarUri);
  }, [avatarUri]);

  const loadProfileData = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('sellerProfile');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        if (profileData.formData) {
          const incoming = profileData.formData;
          setFormData({
            firstName: incoming.firstName || incoming.name?.split(' ')[0] || sellerData.name.split(' ')[0],
            lastName: incoming.lastName || incoming.name?.split(' ').slice(1).join(' ').trim() || sellerData.name.split(' ').slice(1).join(' '),
            nickname: incoming.nickname || '',
            email: incoming.email || sellerData.email,
            phone: incoming.phone || sellerData.phone,
            location: incoming.location || sellerData.location,
            address: incoming.address || sellerData.address,
            description: incoming.description || sellerData.description,
            deliveryDistance: incoming.deliveryDistance || '',
          });
        } else {
          setFormData(formData);
        }
        setAvatarUri(profileData.avatarUri || null);
        setSpecialties(profileData.specialties || sellerData.specialties);
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
        formData: {
          ...formData,
          name: getFullName(formData),
        },
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

  const handleSaveSection = async () => {
    try {
      await saveProfileData();
      setEditingSection(null);
      Alert.alert(
        t('sellerProfileScreen.alerts.profileUpdatedTitle'),
        t('sellerProfileScreen.alerts.profileUpdatedMessage'),
        [{ text: t('sellerProfileScreen.alerts.ok') }]
      );
    } catch (error) {
      Alert.alert(
        t('sellerProfileScreen.alerts.errorTitle'),
        t('sellerProfileScreen.alerts.profileSaveError'),
        [{ text: t('sellerProfileScreen.alerts.ok') }]
      );
    }
  };

  const handleCancelSection = () => {
    // Reset form data
    loadProfileData(); // Reload saved data
    setEditingSection(null);
  };

  // Avatar image picker
  const handleAvatarImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(t('sellerProfileScreen.alerts.permissionTitle'), t('sellerProfileScreen.alerts.galleryPermission'));
      return;
    }

    Alert.alert(
      t('sellerProfileScreen.alerts.profilePhotoTitle'),
      t('sellerProfileScreen.alerts.profilePhotoMessage'),
      [
        { text: t('sellerProfileScreen.alerts.cancel'), style: 'cancel' },
        { text: t('sellerProfileScreen.alerts.takePhoto'), onPress: () => takeAvatarPhoto() },
        { text: t('sellerProfileScreen.alerts.pickFromGallery'), onPress: () => pickAvatarImage() },
      ]
    );
  };

  const takeAvatarPhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(t('sellerProfileScreen.alerts.permissionTitle'), t('sellerProfileScreen.alerts.cameraPermission'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newAvatarUri = result.assets[0].uri;
      console.log('New avatar from camera:', newAvatarUri);
      setAvatarUri(newAvatarUri);
      setForceUpdate(prev => prev + 1); // Force component re-render
    }
  };

  const pickAvatarImage = async () => {
    console.log('Opening image picker...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    console.log('Image picker result:', result);

    if (!result.canceled && result.assets && result.assets[0]) {
      const newAvatarUri = result.assets[0].uri;
      console.log('Setting new avatar URI:', newAvatarUri);
      console.log('Current avatar URI before:', avatarUri);
      
      setAvatarUri(newAvatarUri);
      setForceUpdate(prev => prev + 1); // Force component re-render
      
      console.log('Avatar URI set, force update triggered');
    } else {
      console.log('Image picker was canceled or no assets');
    }
  };

  // Kimlik belgesi fotoğrafı çekme/seçme
  const handleIdentityImagePicker = async (side: 'front' | 'back') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(t('sellerProfileScreen.alerts.permissionTitle'), t('sellerProfileScreen.alerts.galleryPermission'));
      return;
    }

    Alert.alert(
      t('sellerProfileScreen.alerts.identityPhotoTitle'),
      t('sellerProfileScreen.alerts.identityPhotoMessage'),
      [
        { text: t('sellerProfileScreen.alerts.cancel'), style: 'cancel' },
        { text: t('sellerProfileScreen.alerts.takePhoto'), onPress: () => takeIdentityPhoto(side) },
        { text: t('sellerProfileScreen.alerts.pickFromGallery'), onPress: () => pickIdentityImage(side) },
      ]
    );
  };

  const takeIdentityPhoto = async (side: 'front' | 'back') => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(t('sellerProfileScreen.alerts.permissionTitle'), t('sellerProfileScreen.alerts.cameraPermission'));
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
    if (!getFullName(formData).trim()) {
      Alert.alert(t('sellerProfileScreen.alerts.errorTitle'), t('sellerProfileScreen.alerts.realNameRequired'));
      return;
    }

    if (!identityImages.front || !identityImages.back) {
      Alert.alert(t('sellerProfileScreen.alerts.errorTitle'), t('sellerProfileScreen.alerts.identityImagesRequired'));
      return;
    }

    Alert.alert(
      t('sellerProfileScreen.alerts.submitIdentityTitle'),
      t('sellerProfileScreen.alerts.submitIdentityMessage'),
      [
        { text: t('sellerProfileScreen.alerts.cancel'), style: 'cancel' },
        {
          text: t('sellerProfileScreen.alerts.submit'),
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
      t('sellerProfileScreen.alerts.successTitle'),
      t('sellerProfileScreen.alerts.identitySubmitted'),
      [{ text: t('sellerProfileScreen.alerts.ok') }]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TopBar 
        title={t('sellerProfileScreen.title')}
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
        rightComponent={null}
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Header */}
        <View style={styles.avatarHero}>
          <View style={styles.avatarOnlyContainer}>
            <View style={styles.avatarContainer}>
              <Image
                key={`${avatarUri || 'default'}-${forceUpdate}`} // Force re-render when avatar changes
                source={avatarUri ? { uri: avatarUri } : { uri: sellerData.avatar }}
                style={styles.avatar}
                defaultSource={{ uri: 'https://via.placeholder.com/100x100/7FAF9A/FFFFFF?text=S' }}
                onLoad={() => console.log('Avatar loaded:', avatarUri)}
                onError={(error) => console.log('Avatar error:', error)}
              />
              <TouchableOpacity 
                style={styles.avatarEditButton}
                onPress={handleAvatarImagePicker}
              >
                <FontAwesome name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {currentCountry.code === 'TR' && (
          <View style={styles.complianceWrapper}>
            <TouchableOpacity
              nativeID="mandatory-documents"
              testID="mandatory-documents"
              onPress={() => setComplianceExpanded(!complianceExpanded)}
              activeOpacity={0.7}
            >
              <Card variant="default" padding="md" style={styles.complianceCard}>
                <View style={styles.complianceHeader}>
                  <Text
                    variant="subheading"
                    weight="semibold"
                    style={[styles.complianceTitle, { color: colors.text }]}
                  >
                    {complianceCopy.title}
                  </Text>
                  <View style={styles.complianceHeaderRight}>
                    <Text
                      variant="caption"
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: complianceComplete ? '#28A745' : '#17A2B8',
                          color: 'white',
                        },
                      ]}
                    >
                      {complianceComplete ? complianceCopy.statusComplete : complianceCopy.statusOptional}
                    </Text>
                    <Text variant="body" style={[styles.expandIcon, { color: colors.textSecondary }]}>
                      {complianceExpanded ? '▼' : '▶'}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>

            {complianceExpanded && (
              <Card variant="default" padding="sm" style={[styles.complianceCard, styles.complianceExpandedCard]}>
                <View style={styles.complianceItems}>
                  {complianceCopy.items.map((item: any) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.complianceItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => router.push(item.route)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.complianceItemContent}>
                        <Text variant="body" style={[styles.complianceLabel, { color: colors.text }]}>
                          {item.title}
                        </Text>
                        <Text variant="caption" color="primary" style={styles.editLink}>
                          {complianceCopy.edit}
                        </Text>
                      </View>
                      <Text variant="caption" color="textSecondary">
                        {item.sub}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={[styles.complianceButton, { backgroundColor: colors.primary + '20' }]}
                    onPress={() => router.push('/terms-and-conditions')}
                  >
                    <Text variant="body" color="primary" style={styles.complianceButtonText}>
                      {complianceCopy.terms}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}
          </View>
        )}

        {/* Contact Information */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                {t('sellerProfileScreen.sections.contact')}
              </Text>
              {!isContactEditing && (
                <TouchableOpacity
                  onPress={() => setEditingSection('contact')}
                  style={styles.sectionEditButton}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="edit" size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            
            {isContactEditing ? (
              <View style={styles.formContainer}>
                <FormField
                  label={t('sellerProfileScreen.fields.nickname')}
                  value={formData.nickname}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, nickname: text }))}
                  placeholder={t('sellerProfileScreen.placeholders.nickname')}
                />
                
                <FormField
                  label={t('sellerProfileScreen.fields.firstName')}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                  placeholder={t('sellerProfileScreen.placeholders.firstName')}
                />

                <FormField
                  label={t('sellerProfileScreen.fields.lastName')}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                  placeholder={t('sellerProfileScreen.placeholders.lastName')}
                />
                
                <FormField
                  label={t('sellerProfileScreen.fields.email')}
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder={t('sellerProfileScreen.placeholders.email')}
                  keyboardType="email-address"
                />
                <FormField
                  label={t('sellerProfileScreen.fields.phone')}
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  placeholder={t('sellerProfileScreen.placeholders.phone')}
                  keyboardType="phone-pad"
                />
              </View>
            ) : (
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <FontAwesome name="user" size={16} color={colors.textSecondary} />
                  <Text variant="body" style={styles.infoText}>
                    {getFullName()}
                    {identityVerification.status === 'verified' && (
                      <Text style={styles.verifiedBadge}> ✓ {t('sellerProfileScreen.identity.status.verified')}</Text>
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
            {isContactEditing && (
              <View style={styles.sectionActions}>
                <Button
                  variant="outline"
                  onPress={handleCancelSection}
                  style={styles.cancelButton}
                >
                  {t('sellerProfileScreen.actions.cancel')}
                </Button>
                <Button
                  variant="primary"
                  onPress={handleSaveSection}
                  style={styles.saveButton}
                >
                  {t('sellerProfileScreen.actions.save')}
                </Button>
              </View>
            )}
        </Card>

        {/* Location Information */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                {t('sellerProfileScreen.sections.location')}
              </Text>
              {!isLocationEditing && (
                <TouchableOpacity
                  onPress={() => setEditingSection('location')}
                  style={styles.sectionEditButton}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="edit" size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            
            {isLocationEditing ? (
              <View style={styles.formContainer}>
                <FormField
                  label={t('sellerProfileScreen.fields.city')}
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                  placeholder={t('sellerProfileScreen.placeholders.city')}
                />
                <FormField
                  label={t('sellerProfileScreen.fields.address')}
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                  placeholder={t('sellerProfileScreen.placeholders.address')}
                  multiline
                  numberOfLines={3}
                />
                <FormField
                  label={t('sellerProfileScreen.fields.deliveryDistance')}
                  value={formData.deliveryDistance}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, deliveryDistance: text }))}
                  placeholder={t('sellerProfileScreen.placeholders.deliveryDistance')}
                  keyboardType="numeric"
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
                {formData.deliveryDistance ? (
                  <View style={styles.infoRow}>
                    <FontAwesome name="truck" size={16} color={colors.textSecondary} />
                    <Text variant="body" style={styles.infoText}>
                      {t('sellerProfileScreen.fields.deliveryDistance')}: {formData.deliveryDistance} km
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
            {isLocationEditing && (
              <View style={styles.sectionActions}>
                <Button
                  variant="outline"
                  onPress={handleCancelSection}
                  style={styles.cancelButton}
                >
                  {t('sellerProfileScreen.actions.cancel')}
                </Button>
                <Button
                  variant="primary"
                  onPress={handleSaveSection}
                  style={styles.saveButton}
                >
                  {t('sellerProfileScreen.actions.save')}
                </Button>
              </View>
            )}
        </Card>


        {/* About Section */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              {t('sellerProfileScreen.sections.about')}
            </Text>
            {!isAboutEditing && (
              <TouchableOpacity
                onPress={() => setEditingSection('about')}
                style={styles.sectionEditButton}
                activeOpacity={0.7}
              >
                <FontAwesome name="edit" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          {isAboutEditing ? (
            <View style={styles.aboutEditContainer}>
              <FormField
                label={t('sellerProfileScreen.fields.about')}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder={t('sellerProfileScreen.placeholders.about')}
                multiline
                numberOfLines={3}
                style={styles.aboutTextArea}
                textAlignVertical="top"
              />
              
              {/* Uzmanlık Alanları Düzenleme */}
              <View style={styles.specialtiesEditSection}>
                <Text variant="body" weight="medium" style={styles.specialtiesEditTitle}>
                  {t('sellerProfileScreen.sections.specialties')}
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
                    {t('sellerProfileScreen.labels.addSpecialty')}
                  </Text>
                  <View style={styles.addSpecialtyInputContainer}>
                    <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                      <Input
                        value={newSpecialty}
                        onChangeText={setNewSpecialty}
                        placeholder={t('sellerProfileScreen.placeholders.specialty')}
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
                  {t('sellerProfileScreen.sections.specialties')}
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
          {isAboutEditing && (
            <View style={styles.sectionActions}>
              <Button
                variant="outline"
                onPress={handleCancelSection}
                style={styles.cancelButton}
              >
                {t('sellerProfileScreen.actions.cancel')}
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveSection}
                style={styles.saveButton}
              >
                {t('sellerProfileScreen.actions.save')}
              </Button>
            </View>
          )}
        </Card>


        {/* Identity Documents */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          {!isIdentityEditing && (
            <TouchableOpacity
              onPress={() => setEditingSection('identity')}
              style={styles.sectionEditFloating}
              activeOpacity={0.7}
            >
              <FontAwesome name="edit" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
          <View style={styles.identityHeader}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              {t('sellerProfileScreen.sections.identity')}
            </Text>
          </View>
          
          {identityVerification.status === 'rejected' && identityVerification.rejectionReason && (
            <View style={[styles.rejectionNote, { backgroundColor: colors.error + '10', borderColor: colors.error }]}>
              <Text variant="caption" color="error">
                {t('sellerProfileScreen.identity.rejectionReason', { reason: identityVerification.rejectionReason })}
              </Text>
            </View>
          )}
      
          {isIdentityEditing ? (
            <View style={styles.identityContainer}>
              {/* Kimlik Ön Yüz */}
              <View style={styles.identitySection}>
                <Text variant="body" weight="medium" style={styles.identityLabel}>
                  {t('sellerProfileScreen.identity.frontLabel')}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.identityImageContainer,
                    { borderColor: colors.border },
                  ]}
                  onPress={() => handleIdentityImagePicker('front')}
                  activeOpacity={0.7}
                >
                  {identityImages.front ? (
                    <Image source={{ uri: identityImages.front }} style={styles.identityImage} />
                  ) : (
                    <View style={styles.identityPlaceholder}>
                      <FontAwesome name="id-card" size={40} color={colors.textSecondary} />
                      <Text variant="caption" color="textSecondary" style={styles.identityPlaceholderText}>
                        {t('sellerProfileScreen.identity.addFront')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Kimlik Arka Yüz */}
              <View style={styles.identitySection}>
                <Text variant="body" weight="medium" style={styles.identityLabel}>
                  {t('sellerProfileScreen.identity.backLabel')}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.identityImageContainer,
                    { borderColor: colors.border },
                  ]}
                  onPress={() => handleIdentityImagePicker('back')}
                  activeOpacity={0.7}
                >
                  {identityImages.back ? (
                    <Image source={{ uri: identityImages.back }} style={styles.identityImage} />
                  ) : (
                    <View style={styles.identityPlaceholder}>
                      <FontAwesome name="id-card-o" size={40} color={colors.textSecondary} />
                      <Text variant="caption" color="textSecondary" style={styles.identityPlaceholderText}>
                        {t('sellerProfileScreen.identity.addBack')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.identityStatusRow}>
              <Text variant="body" style={styles.infoText}>
                Kimlik Bilgileri
              </Text>
              <View
                style={[
                  styles.identityStatusPill,
                  {
                    backgroundColor:
                      identityVerification.status === 'verified'
                        ? colors.success + '20'
                        : identityImages.front && identityImages.back
                        ? colors.warning + '20'
                        : colors.textSecondary + '20',
                  },
                ]}
              >
                <Text
                  variant="caption"
                  style={{
                    color:
                      identityVerification.status === 'verified'
                        ? colors.success
                        : identityImages.front && identityImages.back
                        ? colors.warning
                        : colors.textSecondary,
                  }}
                >
                  {identityVerification.status === 'verified'
                    ? 'Onaylandı'
                    : identityImages.front && identityImages.back
                    ? 'Onay Bekleniyor'
                    : 'Yükleme Bekleniyor'}
                </Text>
              </View>
            </View>
          )}
          {!isIdentityEditing && (
            <Text variant="caption" color="textSecondary" style={styles.identityNote}>
              Düzenle butonuna tıklayarak ekleyebilirsiniz.
            </Text>
          )}

          {/* Submit Identity Verification */}
          {isIdentityEditing && identityImages.front && identityImages.back && identityVerification.status === 'pending' && (
            <View style={styles.submitSection}>
              <Button
                variant="primary"
                onPress={handleSubmitIdentityVerification}
                style={styles.submitButton}
              >
                {t('sellerProfileScreen.identity.submit')}
              </Button>
            </View>
          )}

          <View style={[styles.warningBox, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
            <FontAwesome name="info-circle" size={16} color={colors.warning} />
            <Text variant="caption" color="warning" style={styles.warningText}>
              {t('sellerProfileScreen.identity.warning')}
            </Text>
          </View>
          {isIdentityEditing && (
            <View style={styles.sectionActions}>
              <Button
                variant="outline"
                onPress={handleCancelSection}
                style={styles.cancelButton}
              >
                {t('sellerProfileScreen.actions.cancel')}
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveSection}
                style={styles.saveButton}
              >
                {t('sellerProfileScreen.actions.save')}
              </Button>
            </View>
          )}
        </Card>

        {/* Bank Details */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <View style={styles.bankHeader}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              {t('sellerProfileScreen.sections.bank')}
            </Text>
            <View style={styles.headerRight}>
              {!isBankEditing && (
                <TouchableOpacity
                  onPress={() => setEditingSection('bank')}
                  style={styles.sectionEditButton}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="edit" size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {isBankEditing ? (
            <View style={styles.formContainer}>
              <FormField
                label={t('sellerProfileScreen.fields.bankName')}
                value={bankDetails.bankName}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, bankName: text }))}
                placeholder={t('sellerProfileScreen.placeholders.bankName')}
              />
              <FormField
                label={t('sellerProfileScreen.fields.accountHolder')}
                value={bankDetails.accountHolderName}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountHolderName: text }))}
                placeholder={t('sellerProfileScreen.placeholders.accountHolder')}
              />
              <FormField
                label={t('sellerProfileScreen.fields.iban')}
                value={bankDetails.iban}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, iban: text }))}
                placeholder={t('sellerProfileScreen.placeholders.iban')}
                maxLength={32}
              />
              <FormField
                label={t('sellerProfileScreen.fields.accountNumber')}
                value={bankDetails.accountNumber}
                onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountNumber: text }))}
                placeholder={t('sellerProfileScreen.placeholders.accountNumber')}
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
                  {t('sellerProfileScreen.bankEmpty')}
                </Text>
              )}
            </View>
          )}
          {isBankEditing && (
            <View style={styles.sectionActions}>
              <Button
                variant="outline"
                onPress={handleCancelSection}
                style={styles.cancelButton}
              >
                {t('sellerProfileScreen.actions.cancel')}
              </Button>
              <Button
                variant="primary"
                onPress={handleSaveSection}
                style={styles.saveButton}
              >
                {t('sellerProfileScreen.actions.save')}
              </Button>
            </View>
          )}
        </Card>

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
  avatarHero: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOnlyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  sectionCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  sectionEditButton: {
    padding: Spacing.xs,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionEditFloating: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    padding: Spacing.xs,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    zIndex: 2,
  },
  complianceWrapper: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  complianceCard: {
    borderWidth: 2,
    borderColor: '#28A745',
    backgroundColor: 'rgba(40, 167, 69, 0.05)',
  },
  complianceExpandedCard: {
    marginTop: 2,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  complianceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  complianceHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  expandIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  complianceTitle: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold',
  },
  complianceItems: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  complianceItem: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  complianceItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  editLink: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  complianceLabel: {
    marginBottom: 2,
  },
  complianceButton: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(127, 175, 154, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  complianceButtonText: {
    fontWeight: '500',
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
  sectionActions: {
    flexDirection: 'row',
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
  identityImageDisabled: {
    opacity: 0.6,
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
  verifiedBadge: {
    color: Colors.light.success,
    fontWeight: 'bold',
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
  identityStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  identityNote: {
    marginTop: Spacing.xs,
  },
  identityStatusPill: {
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
