import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { WebSafeIcon } from '../../../components/ui';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../context/AuthContext';

interface PersonalInfoData {
  name: string;
  displayName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  avatar: string;
  cards: CardData[];
  addressLine1: string;
  city: string;
  postcode: string;
}

interface CardData {
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}

const normalizeCards = (value: unknown): CardData[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    cardNumber: String((item as any)?.cardNumber || ''),
    cardExpiry: String((item as any)?.cardExpiry || ''),
    cardCvv: String((item as any)?.cardCvv || ''),
  }));
};

const getDefaultPersonalInfo = (language: 'tr' | 'en'): PersonalInfoData => {
  if (language === 'tr') {
    return {
      name: 'Ahmet Yılmaz',
      displayName: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      phone: '+90 555 123 4567',
      birthDate: '15/03/1990',
      gender: 'Erkek',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      cards: [
        {
          cardNumber: '4111 1111 1111 1111',
          cardExpiry: '12/28',
          cardCvv: '123',
        },
      ],
      addressLine1: 'Moda Mah. Bahariye Cd. No: 12 D:3',
      city: 'Kadıköy / İstanbul',
      postcode: '34710',
    };
  }

  return {
    name: 'Ahmet Yilmaz',
    displayName: 'Ahmet Yilmaz',
    email: 'ahmet@example.com',
    phone: '+44 7700 900123',
    birthDate: '15/03/1990',
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    cards: [
      {
        cardNumber: '4111 1111 1111 1111',
        cardExpiry: '12/28',
        cardCvv: '123',
      },
    ],
    addressLine1: '221B Baker Street',
    city: 'London',
    postcode: 'NW1 6XE',
  };
};

export const PersonalInfo: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const cardHeaderDividerColor = colorScheme === 'dark' ? colors.textSecondary : colors.border;
  const { t, currentLanguage } = useTranslation();
  const { userData, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(true);
  const [showCards, setShowCards] = useState(false);
  const [formData, setFormData] = useState<PersonalInfoData>({
    name: '',
    displayName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    avatar: '',
    cards: [],
    addressLine1: '',
    city: '',
    postcode: '',
  });

  useEffect(() => {
    loadPersonalInfo();
  }, [currentLanguage, userData]);

  const loadPersonalInfo = () => {
    const defaults = getDefaultPersonalInfo(currentLanguage);
    const cardsFromApi = normalizeCards(userData?.paymentCards);
    const legacyPhone = (userData as any)?.phoneNumber;
    setFormData({
      name: userData?.fullName || userData?.displayName || defaults.name,
      displayName: userData?.displayName || defaults.displayName,
      email: userData?.email || defaults.email,
      phone: userData?.phone || legacyPhone || defaults.phone,
      birthDate: userData?.birthDate || defaults.birthDate,
      gender: userData?.gender || defaults.gender,
      avatar: userData?.avatarUri || defaults.avatar,
      cards: cardsFromApi.length > 0 ? cardsFromApi : defaults.cards,
      addressLine1: userData?.addressLine1 || defaults.addressLine1,
      city: userData?.city || defaults.city,
      postcode: userData?.postcode || defaults.postcode,
    });
  };

  const savePersonalInfo = async () => {
    try {
      if (userData?.uid) {
        await updateProfile({
          email: formData.email,
          fullName: formData.name,
          displayName: formData.displayName,
          phone: formData.phone,
          birthDate: formData.birthDate,
          gender: formData.gender,
          avatarUri: formData.avatar,
          addressLine1: formData.addressLine1,
          city: formData.city,
          postcode: formData.postcode,
          paymentCards: formData.cards.map((card) => ({
            cardNumber: card.cardNumber,
            cardExpiry: card.cardExpiry,
            cardCvv: card.cardCvv,
          })),
        });
      }
      
      setIsEditing(false);
      Alert.alert(t('personalInfoScreen.alerts.successTitle'), t('personalInfoScreen.alerts.successMessage'));
    } catch (error) {
      console.error('Error saving personal info:', error);
      Alert.alert(t('personalInfoScreen.alerts.errorTitle'), t('personalInfoScreen.alerts.errorMessage'));
    }
  };

  const selectAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, avatar: result.assets[0].uri });
    }
  };

  const handleCardButtonPress = () => {
    setShowCards(true);
    setIsEditing(true);
    if (!isEditing) {
      // allow edit mode when user taps "Kart Ekle"
    }
    setFormData((prev) => ({
      ...prev,
      cards: [
        ...prev.cards,
        {
          cardNumber: '',
          cardExpiry: '',
          cardCvv: '',
        },
      ],
    }));
  };

  const updateCard = (index: number, update: Partial<CardData>) => {
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.map((card, i) => (i === index ? { ...card, ...update } : card)),
    }));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TopBar 
        title={t('personalInfoScreen.title')}
        showThemeToggle={false}
        leftSideWidth={112}
        rightSideWidth={112}
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <WebSafeIcon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={() => isEditing ? savePersonalInfo() : setIsEditing(true)} style={styles.topBarAction}>
            <Text variant="body" color="primary" weight="medium" style={styles.topBarActionText} numberOfLines={1}>
              {isEditing ? t('personalInfoScreen.save') : t('personalInfoScreen.edit')}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <Card style={styles.avatarCard}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity 
              style={styles.avatarWrapper}
              onPress={isEditing ? selectAvatar : undefined}
              disabled={!isEditing}
            >
              <View style={[styles.avatar, { borderColor: colors.border }]}>
                {formData.avatar ? (
                  <Image 
                    source={{ uri: formData.avatar }}
                    style={styles.avatarImage}
                    defaultSource={{ uri: 'https://placehold.co/100x100/7FAF9A/FFFFFF?text=A' }}
                  />
                ) : (
                  <WebSafeIcon name="person" size={40} color={colors.textSecondary} />
                )}
              </View>
              {isEditing && (
                <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                  <WebSafeIcon name="edit" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
            <Text variant="body" color="textSecondary" style={styles.avatarHint}>
              {isEditing ? t('personalInfoScreen.avatarEditHint') : t('personalInfoScreen.avatarLabel')}
            </Text>
          </View>
        </Card>

        {/* Personal Info Form */}
        <Card style={styles.formCard}>
          <View style={styles.formSection}>
            <View
              style={[
                styles.cardHeader,
                { borderBottomColor: cardHeaderDividerColor },
              ]}
            >
              <Text variant="title" weight="semibold" style={styles.cardHeaderTitle}>
                {t('personalInfoScreen.sectionTitle')}
              </Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>
                {t('personalInfoScreen.labels.name')}
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isEditing ? colors.surface : colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={isEditing}
                placeholder={t('personalInfoScreen.placeholders.name')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>
                {currentLanguage === 'en' ? 'Display Name' : 'Gorunen Ad'}
              </Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: isEditing ? colors.surface : colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                value={formData.displayName}
                onChangeText={(text) => setFormData({ ...formData, displayName: text })}
                editable={isEditing}
                placeholder={currentLanguage === 'en' ? 'e.g. Cozy Kitchen' : 'or. Cozy Kitchen'}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>
                {t('personalInfoScreen.labels.email')}
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isEditing ? colors.surface : colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                editable={isEditing}
                placeholder={t('personalInfoScreen.placeholders.email')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>
                {t('personalInfoScreen.labels.phone')}
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isEditing ? colors.surface : colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                editable={isEditing}
                placeholder={t('personalInfoScreen.placeholders.phone')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>
                {t('personalInfoScreen.labels.birthDate')}
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isEditing ? colors.surface : colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                value={formData.birthDate}
                onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
                editable={isEditing}
                placeholder={t('personalInfoScreen.placeholders.birthDate')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>
                {t('personalInfoScreen.labels.gender')}
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isEditing ? colors.surface : colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                value={formData.gender}
                onChangeText={(text) => setFormData({ ...formData, gender: text })}
                editable={isEditing}
                placeholder={t('personalInfoScreen.placeholders.gender')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </Card>

        {/* Address Details */}
        <Card style={styles.formCard}>
          <View style={styles.formSection}>
            <View style={[styles.cardHeader, { borderBottomColor: cardHeaderDividerColor }]}>
              <Text variant="title" weight="semibold" style={styles.cardHeaderTitle}>
                {t('personalInfoScreen.addressSectionTitle')}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>
                {t('personalInfoScreen.labels.addressLine1')}
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isEditing ? colors.surface : colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                value={formData.addressLine1}
                onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
                editable={isEditing}
                placeholder={t('personalInfoScreen.placeholders.addressLine1')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text variant="body" color="textSecondary" style={styles.label}>
                  {t('personalInfoScreen.labels.city')}
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isEditing ? colors.surface : colors.background,
                    borderColor: colors.border,
                    color: colors.text 
                  }]}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  editable={isEditing}
                  placeholder={t('personalInfoScreen.placeholders.city')}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text variant="body" color="textSecondary" style={styles.label}>
                  {t('personalInfoScreen.labels.postcode')}
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isEditing ? colors.surface : colors.background,
                    borderColor: colors.border,
                    color: colors.text 
                  }]}
                  value={formData.postcode}
                  onChangeText={(text) => setFormData({ ...formData, postcode: text })}
                  editable={isEditing}
                  placeholder={t('personalInfoScreen.placeholders.postcode')}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Card Details */}
        <Card style={styles.formCard}>
          <View style={styles.formSection}>
            <View style={[styles.cardHeader, { borderBottomColor: cardHeaderDividerColor }]}>
              <Text variant="title" weight="semibold" style={styles.cardHeaderTitle}>
                {t('personalInfoScreen.cardSectionTitle')}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.cardActionButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.9}
              onPress={handleCardButtonPress}
            >
              <Text variant="body" weight="medium" style={styles.cardActionText}>
                {t('personalInfoScreen.addCard')}
              </Text>
            </TouchableOpacity>

            {(showCards || (formData.cards && formData.cards.length > 0)) && (
              <View style={styles.cardList}>
                {formData.cards?.map((card, index) => (
                  <View key={`card-${index}`} style={styles.cardItem}>
                    <Text variant="body" color="textSecondary" style={styles.cardItemTitle}>
                      {t('personalInfoScreen.cardItem', { number: index + 1 })}
                    </Text>

                    <View style={styles.inputGroup}>
                      <Text variant="body" color="textSecondary" style={styles.label}>
                        {t('personalInfoScreen.labels.cardNumber')}
                      </Text>
                      <TextInput
                        style={[styles.input, { 
                          backgroundColor: isEditing ? colors.surface : colors.background,
                          borderColor: colors.border,
                          color: colors.text 
                        }]}
                        value={card.cardNumber}
                        onChangeText={(text) => updateCard(index, { cardNumber: text })}
                        editable={isEditing}
                        placeholder={t('personalInfoScreen.placeholders.cardNumber')}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="number-pad"
                      />
                    </View>

                    <View style={styles.inputRow}>
                      <View style={[styles.inputGroup, styles.inputHalf]}>
                        <Text variant="body" color="textSecondary" style={styles.label}>
                          {t('personalInfoScreen.labels.cardExpiry')}
                        </Text>
                        <TextInput
                          style={[styles.input, { 
                            backgroundColor: isEditing ? colors.surface : colors.background,
                            borderColor: colors.border,
                            color: colors.text 
                          }]}
                          value={card.cardExpiry}
                          onChangeText={(text) => updateCard(index, { cardExpiry: text })}
                          editable={isEditing}
                          placeholder={t('personalInfoScreen.placeholders.cardExpiry')}
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="number-pad"
                        />
                      </View>

                      <View style={[styles.inputGroup, styles.inputHalf]}>
                        <Text variant="body" color="textSecondary" style={styles.label}>
                          {t('personalInfoScreen.labels.cardCvv')}
                        </Text>
                        <TextInput
                          style={[styles.input, { 
                            backgroundColor: isEditing ? colors.surface : colors.background,
                            borderColor: colors.border,
                            color: colors.text 
                          }]}
                          value={card.cardCvv}
                          onChangeText={(text) => updateCard(index, { cardCvv: text })}
                          editable={isEditing}
                          placeholder={t('personalInfoScreen.placeholders.cardCvv')}
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="number-pad"
                        />
                      </View>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.addAnotherCardButton, { borderColor: colors.primary }]}
                  activeOpacity={0.85}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      cards: [
                        ...prev.cards,
                        { cardNumber: '', cardExpiry: '', cardCvv: '' },
                      ],
                    }))
                  }
                >
                  <Text variant="body" weight="medium" style={[styles.addAnotherCardText, { color: colors.primary }]}>
                    {t('personalInfoScreen.addAnotherCard')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Card>
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
    padding: Spacing.md,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  avatarCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    textAlign: 'center',
  },
  formCard: {
    marginBottom: Spacing.md,
  },
  formSection: {
    padding: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  cardHeaderTitle: {
    letterSpacing: 0.2,
  },
  cardList: {
    marginTop: Spacing.md,
  },
  cardItem: {
    marginBottom: Spacing.md,
  },
  cardItemTitle: {
    marginBottom: Spacing.sm,
  },
  addAnotherCardButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAnotherCardText: {
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: 16,
  },
  cardActionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionText: {
    color: '#ffffff',
  },
  topBarAction: {
    paddingHorizontal: Spacing.xs,
    marginRight: Spacing.sm,
  },
  topBarActionText: {
    fontSize: 14,
  },
});
