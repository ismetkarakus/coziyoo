import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

export default function FoodDetailSimple() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const foodName = params.name as string || 'Ev Yapımı Mantı';
  const cookName = params.cookName as string || 'Ayşe Hanım';
  const foodImageUrl = params.imageUrl as string || 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop';

  const handleBackPress = () => {
    router.push('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Yemek Detayı"
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content}>
        {/* Food Image */}
        <Image 
          source={{ uri: foodImageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Food Info */}
        <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
          <Text variant="heading" weight="bold" style={styles.title}>
            {foodName}
          </Text>
          
          {/* Satıcı Profil Kartı - Satıcı Panelinden */}
          <Card variant="default" padding="md" style={styles.sellerCard}>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerAvatarContainer}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face' }}
                  style={styles.sellerAvatarImage}
                  defaultSource={{ uri: 'https://via.placeholder.com/60x60/7FAF9A/FFFFFF?text=S' }}
                />
              </View>
              <View style={styles.sellerDetails}>
                <Text variant="subheading" weight="semibold">
                  {cookName}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Satıcı • Kadıköy, İstanbul
                </Text>
              </View>
              {/* Yıldız Değerlendirme - Sağ Üst Köşe */}
              <View style={styles.ratingCorner}>
                <Text variant="body" weight="bold" color="text">
                  ⭐ 4.8
                </Text>
              </View>
            </View>
          </Card>
          
          
          <View style={styles.priceContainer}>
            <Text variant="heading" weight="bold" color="primary">
              ₺25
            </Text>
            <Text variant="caption" color="textSecondary">
              / porsiyon
            </Text>
          </View>
          
          {/* İçindekiler/Baharatlar/Tarif */}
          <View style={styles.ingredientsSection}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              İçindekiler / Baharatlar / Tarif
            </Text>
            <Text variant="body" style={styles.ingredientsText}>
              • Un, yumurta, su, tuz (hamur için)
              • Kıyma, soğan, maydanoz (iç için)
              • Yoğurt, sarımsak, tereyağı (sos için)
              • Kırmızı biber, nane, karabiber
            </Text>
          </View>

          {/* Tarif */}
          <View style={styles.aboutSection}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              Tarif
            </Text>
            <Text variant="body" style={styles.description}>
              Geleneksel yöntemlerle hazırlanan, ince açılmış hamur ile sarılmış, 
              özel baharatlarla tatlandırılmış ev yapımı {foodName}. Taze malzemeler 
              kullanılarak özenle hazırlanmıştır.
            </Text>
          </View>

          {/* Hakkımda - Satıcı Hakkında */}
          <View style={styles.aboutSellerSection}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              Hakkımda
            </Text>
            <Text variant="body" style={styles.description}>
              15 yıldır ev yemekleri yapıyorum. Özellikle mantı, börek ve geleneksel 
              Türk mutfağının lezzetlerinde uzmanım. Her yemekte annemin tariflerini 
              kullanarak, aile sıcaklığını sofranıza taşıyorum. Hijyen ve kalite 
              benim için en önemli öncelikler.
            </Text>
          </View>
          
          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <Text variant="subheading" weight="semibold" style={styles.reviewsTitle}>
              ⭐ Değerlendirmeler (24)
            </Text>
            <View style={styles.reviewItem}>
              <Text variant="body" weight="medium">Ahmet K.</Text>
              <Text variant="caption" color="textSecondary">
                "Çok lezzetli ve taze. Kesinlikle tavsiye ederim!" ⭐⭐⭐⭐⭐
              </Text>
            </View>
            <View style={styles.reviewItem}>
              <Text variant="body" weight="medium">Zeynep M.</Text>
              <Text variant="caption" color="textSecondary">
                "Güzel bir deneyimdi, tekrar sipariş vereceğim." ⭐⭐⭐⭐
              </Text>
            </View>
          </View>
          
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                // Favorilere ekle
                alert('Favorilere eklendi! ❤️');
              }}
            >
              <Text variant="body" color="primary">❤️ Favoriye Ekle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.orderButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                // Sipariş ver ve siparişlerim sayfasına git
                alert('Sipariş verildi! 🎉');
                router.push('/(tabs)/orders');
              }}
            >
              <Text variant="body" weight="bold" style={{ color: 'white' }}>🛒 Sipariş Ver - ₺25</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
  },
  infoContainer: {
    padding: Spacing.lg,
    margin: Spacing.md,
    borderRadius: 12,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  description: {
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  orderButton: {
    flex: 2,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewsSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  reviewsTitle: {
    marginBottom: Spacing.md,
  },
  reviewItem: {
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  sellerCard: {
    marginBottom: Spacing.md,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  sellerAvatarContainer: {
    marginRight: Spacing.md,
  },
  sellerAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#7FAF9A',
  },
  sellerDetails: {
    flex: 1,
  },
  ratingCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  ingredientsSection: {
    marginBottom: Spacing.lg,
  },
  aboutSection: {
    marginBottom: Spacing.lg,
  },
  aboutSellerSection: {
    marginBottom: Spacing.lg,
  },
  ingredientsText: {
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
});
