import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { WebSafeIcon } from '../../../components/ui';

export const ChangePassword: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSave = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor.');
      return;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.', [
      { text: 'Tamam', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Şifre Değiştir"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <WebSafeIcon name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <View style={styles.formSection}>
            <Text variant="body" color="textSecondary" style={styles.description}>
              Güvenliğiniz için mevcut şifrenizi girin ve yeni şifrenizi belirleyin.
            </Text>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>Mevcut Şifre</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text 
                  }]}
                  value={formData.currentPassword}
                  onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
                  placeholder="Mevcut şifrenizi girin"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPasswords.current}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                >
                  <Text style={{ fontSize: 18 }}>{showPasswords.current ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>Yeni Şifre</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text 
                  }]}
                  value={formData.newPassword}
                  onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                  placeholder="Yeni şifrenizi girin"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPasswords.new}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  <Text style={{ fontSize: 18 }}>{showPasswords.new ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" color="textSecondary" style={styles.label}>Yeni Şifre Tekrar</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text 
                  }]}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  placeholder="Yeni şifrenizi tekrar girin"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPasswords.confirm}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  <Text style={{ fontSize: 18 }}>{showPasswords.confirm ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text variant="body" weight="medium" style={{ color: 'white' }}>
                Şifreyi Değiştir
              </Text>
            </TouchableOpacity>
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
  formCard: {
    marginBottom: Spacing.md,
  },
  formSection: {
    padding: Spacing.md,
  },
  description: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.sm,
    padding: Spacing.xs,
  },
  saveButton: {
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
});


