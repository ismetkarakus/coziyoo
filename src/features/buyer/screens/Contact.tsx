import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { WebSafeIcon } from '../../../components/ui';

export const Contact: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  const contactInfo = [
    {
      title: 'Adres',
      value: 'Kadıköy Mah. Bağdat Cad. No:123\nKadıköy/İstanbul',
      icon: '📍',
      action: () => Linking.openURL('https://maps.google.com/?q=Kadıköy,İstanbul'),
    },
    {
      title: 'Telefon',
      value: '0850 123 45 67',
      icon: '📞',
      action: () => Linking.openURL('tel:08501234567'),
    },
    {
      title: 'E-posta',
      value: 'info@cazi.com',
      icon: '✉️',
      action: () => Linking.openURL('mailto:info@cazi.com'),
    },
    {
      title: 'Çalışma Saatleri',
      value: 'Pazartesi - Pazar\n09:00 - 22:00',
      icon: '🕘',
      action: null,
    },
  ];

  const socialMedia = [
    {
      name: 'Instagram',
      icon: '📷',
      action: () => Linking.openURL('https://instagram.com/cazi'),
    },
    {
      name: 'Twitter',
      icon: '🐦',
      action: () => Linking.openURL('https://twitter.com/cazi'),
    },
    {
      name: 'Facebook',
      icon: '📘',
      action: () => Linking.openURL('https://facebook.com/cazi'),
    },
    {
      name: 'WhatsApp',
      icon: '📱',
      action: () => Linking.openURL('https://wa.me/905551234567'),
    },
  ];

  const handleSendMessage = () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      Alert.alert('Hata', 'Lütfen konu ve mesaj alanlarını doldurun.');
      return;
    }

    Alert.alert(
      'Mesaj Gönderildi',
      'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      [{ text: 'Tamam', onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="İletişim"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <WebSafeIcon name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Form */}
        <Card style={styles.formCard}>
          <Text variant="subheading" weight="bold" style={styles.sectionTitle}>
            Bize Mesaj Gönderin
          </Text>
          
          <View style={styles.inputGroup}>
            <Text variant="body" color="textSecondary" style={styles.label}>Konu</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
              placeholder="Mesajınızın konusunu girin"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text variant="body" color="textSecondary" style={styles.label}>Mesaj</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              placeholder="Mesajınızı buraya yazın..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={handleSendMessage}
          >
            <Text variant="body" weight="medium" style={{ color: 'white' }}>
              Mesaj Gönder
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Contact Information */}
        <Card style={styles.infoCard}>
          <Text variant="subheading" weight="bold" style={styles.sectionTitle}>
            İletişim Bilgileri
          </Text>
          
          {contactInfo.map((info, index) => (
            <TouchableOpacity
              key={index}
              style={styles.infoItem}
              onPress={info.action}
              disabled={!info.action}
            >
              <Text style={styles.infoIcon}>{info.icon}</Text>
              <View style={styles.infoText}>
                <Text variant="body" weight="medium" style={styles.infoTitle}>
                  {info.title}
                </Text>
                <Text variant="body" color="textSecondary" style={styles.infoValue}>
                  {info.value}
                </Text>
              </View>
              {info.action && (
                <WebSafeIcon name="chevron-right" size={16} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Social Media */}
        <Card style={styles.socialCard}>
          <Text variant="subheading" weight="bold" style={styles.sectionTitle}>
            Sosyal Medya
          </Text>
          
          <View style={styles.socialGrid}>
            {socialMedia.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.socialButton, { borderColor: colors.border }]}
                onPress={social.action}
              >
                <Text style={styles.socialIcon}>{social.icon}</Text>
                <Text variant="caption" color="textSecondary" style={styles.socialName}>
                  {social.name}
                </Text>
              </TouchableOpacity>
            ))}
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
    padding: Spacing.md,
  },
  infoCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  socialCard: {
    marginBottom: Spacing.md,
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
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: 16,
    height: 120,
  },
  sendButton: {
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    marginBottom: 2,
  },
  infoValue: {
    lineHeight: 18,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  socialButton: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  socialIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  socialName: {
    textAlign: 'center',
  },
});

