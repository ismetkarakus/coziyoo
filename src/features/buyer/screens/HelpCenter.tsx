import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { WebSafeIcon } from '../../../components/ui';

export const HelpCenter: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const faqItems = [
    {
      question: 'Nasıl sipariş verebilirim?',
      answer: 'Ana sayfadan istediğiniz yemeği seçin, miktarını belirleyin ve sepete ekleyin. Sepetten siparişinizi tamamlayabilirsiniz.',
    },
    {
      question: 'Ödeme yöntemleri nelerdir?',
      answer: 'Kredi kartı, banka kartı ve kapıda ödeme seçeneklerini kullanabilirsiniz.',
    },
    {
      question: 'Siparişimi nasıl takip edebilirim?',
      answer: 'Siparişlerim bölümünden aktif siparişlerinizi takip edebilirsiniz.',
    },
    {
      question: 'İptal ve iade koşulları nelerdir?',
      answer: 'Sipariş hazırlanmaya başlamadan önce iptal edebilirsiniz. Sorunlu siparişler için müşteri hizmetleri ile iletişime geçin.',
    },
    {
      question: 'Teslimat süresi ne kadar?',
      answer: 'Ortalama teslimat süresi 30-45 dakikadır. Bu süre yoğunluğa göre değişebilir.',
    },
  ];

  const contactOptions = [
    {
      title: 'Canlı Destek',
      description: 'Anında yardım alın',
      icon: '💬',
      action: () => Alert.alert('Yakında', 'Canlı destek özelliği yakında gelecek.'),
    },
    {
      title: 'E-posta Gönder',
      description: 'destek@cazi.com',
      icon: '✉️',
      action: () => Linking.openURL('mailto:destek@cazi.com'),
    },
    {
      title: 'Telefon',
      description: '0850 123 45 67',
      icon: '📞',
      action: () => Linking.openURL('tel:08501234567'),
    },
    {
      title: 'WhatsApp',
      description: 'Hızlı destek için',
      icon: '📱',
      action: () => Linking.openURL('https://wa.me/905551234567'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Yardım Merkezi"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <WebSafeIcon name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* FAQ Section */}
        <Card style={styles.sectionCard}>
          <Text variant="subheading" weight="bold" style={styles.sectionTitle}>
            Sık Sorulan Sorular
          </Text>
          
          {faqItems.map((item, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.faqItem}
                onPress={() => Alert.alert(item.question, item.answer)}
              >
                <View style={styles.faqContent}>
                  <Text variant="body" weight="medium" style={styles.faqQuestion}>
                    {item.question}
                  </Text>
                  <WebSafeIcon name="chevron-right" size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
              {index < faqItems.length - 1 && (
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </Card>

        {/* Contact Options */}
        <Card style={styles.sectionCard}>
          <Text variant="subheading" weight="bold" style={styles.sectionTitle}>
            İletişim Seçenekleri
          </Text>
          
          {contactOptions.map((option, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.contactItem}
                onPress={option.action}
              >
                <View style={styles.contactContent}>
                  <Text style={styles.contactIcon}>{option.icon}</Text>
                  <View style={styles.contactText}>
                    <Text variant="body" weight="medium">
                      {option.title}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {option.description}
                    </Text>
                  </View>
                  <WebSafeIcon name="chevron-right" size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
              {index < contactOptions.length - 1 && (
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </Card>

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <Text variant="subheading" weight="bold" style={styles.sectionTitle}>
            Hızlı İşlemler
          </Text>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/order-history')}
          >
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionIcon}>📋</Text>
              <View style={styles.quickActionText}>
                <Text variant="body" weight="medium">
                  Siparişlerim
                </Text>
                <Text variant="caption" color="textSecondary">
                  Geçmiş siparişlerinizi görüntüleyin
                </Text>
              </View>
              <WebSafeIcon name="chevron-right" size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
          
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/personal-info')}
          >
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionIcon}>👤</Text>
              <View style={styles.quickActionText}>
                <Text variant="body" weight="medium">
                  Hesap Bilgileri
                </Text>
                <Text variant="caption" color="textSecondary">
                  Kişisel bilgilerinizi güncelleyin
                </Text>
              </View>
              <WebSafeIcon name="chevron-right" size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
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
  sectionCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  faqItem: {
    paddingVertical: Spacing.sm,
  },
  faqContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  contactItem: {
    paddingVertical: Spacing.sm,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  contactText: {
    flex: 1,
  },
  quickAction: {
    paddingVertical: Spacing.sm,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  quickActionText: {
    flex: 1,
  },
  separator: {
    height: 1,
    marginVertical: Spacing.xs,
  },
});
