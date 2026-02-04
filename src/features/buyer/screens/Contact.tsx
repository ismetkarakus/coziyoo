import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { WebSafeIcon } from '../../../components/ui';
import { useTranslation } from '../../../hooks/useTranslation';

export const Contact: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  const contactValues = currentLanguage === 'en'
    ? {
        address: '221B Baker Street\nLondon, UK',
        addressLink: 'https://maps.google.com/?q=221B%20Baker%20Street%20London',
        phone: '+44 20 7946 0958',
        phoneLink: 'tel:+442079460958',
        email: 'info@coziyoo.com',
        hours: 'Monday - Sunday\n09:00 - 22:00',
        whatsapp: 'https://wa.me/447700900123',
      }
    : {
        address: 'Kadıköy Mah. Bağdat Cad. No:123\nKadıköy/İstanbul',
        addressLink: 'https://maps.google.com/?q=Kadıköy,İstanbul',
        phone: '0850 123 45 67',
        phoneLink: 'tel:08501234567',
        email: 'info@coziyoo.com',
        hours: 'Pazartesi - Pazar\n09:00 - 22:00',
        whatsapp: 'https://wa.me/905551234567',
      };

  const contactInfo = [
    {
      title: t('contactScreen.info.address'),
      value: contactValues.address,
      icon: '📍',
      action: () => Linking.openURL(contactValues.addressLink),
    },
    {
      title: t('contactScreen.info.phone'),
      value: contactValues.phone,
      icon: '📞',
      action: () => Linking.openURL(contactValues.phoneLink),
    },
    {
      title: t('contactScreen.info.email'),
      value: contactValues.email,
      icon: '✉️',
      action: () => Linking.openURL('mailto:info@coziyoo.com'),
    },
    {
      title: t('contactScreen.info.hours'),
      value: contactValues.hours,
      icon: '🕘',
      action: undefined,
    },
  ];

  const socialMedia = [
    {
      name: t('contactScreen.social.instagram'),
      icon: '📷',
      action: () => Linking.openURL('https://instagram.com/coziyoo'),
    },
    {
      name: t('contactScreen.social.twitter'),
      icon: '🐦',
      action: () => Linking.openURL('https://twitter.com/coziyoo'),
    },
    {
      name: t('contactScreen.social.facebook'),
      icon: '📘',
      action: () => Linking.openURL('https://facebook.com/coziyoo'),
    },
    {
      name: t('contactScreen.social.whatsapp'),
      icon: '📱',
      action: () => Linking.openURL(contactValues.whatsapp),
    },
  ];

  const handleSendMessage = () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      Alert.alert(t('contactScreen.alerts.errorTitle'), t('contactScreen.alerts.errorMessage'));
      return;
    }

    Alert.alert(
      t('contactScreen.alerts.successTitle'),
      t('contactScreen.alerts.successMessage'),
      [{ text: t('contactScreen.alerts.ok'), onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={t('contactScreen.title')}
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
            {t('contactScreen.sections.form')}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text variant="body" color="textSecondary" style={styles.label}>
              {t('contactScreen.form.subjectLabel')}
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
              placeholder={t('contactScreen.form.subjectPlaceholder')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text variant="body" color="textSecondary" style={styles.label}>
              {t('contactScreen.form.messageLabel')}
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              placeholder={t('contactScreen.form.messagePlaceholder')}
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
              {t('contactScreen.form.send')}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Contact Information */}
        <Card style={styles.infoCard}>
          <Text variant="subheading" weight="bold" style={styles.sectionTitle}>
            {t('contactScreen.sections.info')}
          </Text>
          
          {contactInfo.map((info, index) => (
            <TouchableOpacity
              key={index}
              style={styles.infoItem}
              // @ts-ignore
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
            {t('contactScreen.sections.social')}
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








