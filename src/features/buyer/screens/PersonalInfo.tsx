import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { WebSafeIcon } from '../../../components/ui';

interface PersonalInfoData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  avatar: string;
}

export const PersonalInfo: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PersonalInfoData>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    avatar: '',
  });

  useEffect(() => {
    loadPersonalInfo();
  }, []);

  const loadPersonalInfo = async () => {
    try {
      const data = await AsyncStorage.getItem('personalInfo');
      if (data) {
        setFormData(JSON.parse(data));
      } else {
        // Default data
        setFormData({
          name: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          phone: '+90 555 123 4567',
          birthDate: '15/03/1990',
          gender: 'Erkek',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        });
      }
    } catch (error) {
      console.error('Error loading personal info:', error);
    }
  };

  const savePersonalInfo = async () => {
    try {
      await AsyncStorage.setItem('personalInfo', JSON.stringify(formData));
      
      // Ana profil sayfası için de avatar'ı kaydet
      const buyerProfile = {
        avatarUri: formData.avatar,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('buyerProfile', JSON.stringify(buyerProfile));
      
      setIsEditing(false);
      Alert.alert('Başarılı', 'Kişisel bilgileriniz güncellendi.');
    } catch (error) {
      console.error('Error saving personal info:', error);
      Alert.alert('Hata', 'Bilgiler kaydedilirken bir sorun oluştu.');
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Kişisel Bilgiler"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <WebSafeIcon name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={() => isEditing ? savePersonalInfo() : setIsEditing(true)}>
            <Text variant="body" color="primary" weight="medium">
              {isEditing ? 'Kaydet' : 'Düzenle'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                    defaultSource={{ uri: 'https://via.placeholder.com/100x100/7FAF9A/FFFFFF?text=A' }}
                  />
                ) : (
                  <WebSafeIcon name="user" size={40} color={colors.textSecondary} />
                )}
              </View>
              {isEditing && (
                <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                  <WebSafeIcon name="edit" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
            <Text variant="body" color="textSecondary" style={styles.avatarHint}>
              {isEditing ? 'Fotoğrafı değiştirmek için dokunun' : 'Profil Fotoğrafı'}
            </Text>
          </View>
        </Card>

        {/* Personal Info Form */}
        <Card style={styles.formCard}>
          <View style={styles.formSection}>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Temel Bilgiler
            </Text>
            
            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>Ad Soyad</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isEditing ? colors.surface : colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={isEditing}
                placeholder="Adınızı ve soyadınızı girin"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>E-posta</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isEditing ? colors.surface : colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                editable={isEditing}
                placeholder="E-posta adresinizi girin"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>Telefon</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isEditing ? colors.surface : colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                editable={isEditing}
                placeholder="Telefon numaranızı girin"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>Doğum Tarihi</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isEditing ? colors.surface : colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                value={formData.birthDate}
                onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
                editable={isEditing}
                placeholder="GG/AA/YYYY"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>Cinsiyet</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isEditing ? colors.surface : colors.background,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                value={formData.gender}
                onChangeText={(text) => setFormData({ ...formData, gender: text })}
                editable={isEditing}
                placeholder="Cinsiyet"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </Card>
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
  sectionTitle: {
    marginBottom: Spacing.md,
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
});










