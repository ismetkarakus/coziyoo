import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

interface Meal {
  id: string;
  name: string;
  cookName?: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  availableDates: string;
  currentStock: number;
  dailyStock: number;
  hasPickup: boolean;
  hasDelivery: boolean;
  createdAt: string;
  startDate?: string;
  endDate?: string;
}

export const ManageMeals: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [meals, setMeals] = useState<Meal[]>([]);
  const [expiredMeals, setExpiredMeals] = useState<Meal[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [sellerProfile, setSellerProfile] = useState<any>(null);

  // Load meals and profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMeals();
      loadSellerProfile();
    }, [])
  );

  const loadSellerProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('sellerProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setSellerProfile(profile);
      }
    } catch (error) {
      console.error('Error loading seller profile:', error);
    }
  };

  const loadMeals = async () => {
    try {
      const publishedMealsJson = await AsyncStorage.getItem('publishedMeals');
      const expiredMealsJson = await AsyncStorage.getItem('expiredMeals');
      
      let allMeals: Meal[] = [];
      
      // Load published meals from AsyncStorage
      if (publishedMealsJson) {
        const publishedMeals = JSON.parse(publishedMealsJson);
        allMeals = [...publishedMeals];
      }
      
      // Add MOCK_FOODS for demo purposes (Ayşe Hanım'ın yemekleri)
      const mockMealsForDemo = [
        {
          id: 'mock_1',
          name: 'Ev Yapımı Mantı',
          cookName: 'Ayşe Hanım',
          price: 35,
          category: 'Ana Yemek',
          description: 'El açması hamur ile hazırlanmış geleneksel mantı',
          imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
          availableDates: '15-20 Ocak',
          currentStock: 8,
          dailyStock: 10,
          hasPickup: true,
          hasDelivery: true,
          createdAt: new Date().toISOString(),
          startDate: '15/01/2024',
          endDate: '20/01/2024',
        },
        {
          id: 'mock_9',
          name: 'Menemen',
          cookName: 'Ayşe Hanım',
          price: 22,
          category: 'Kahvaltı',
          description: 'Taze sebzeler ve yumurta ile hazırlanmış menemen',
          imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
          availableDates: '17-24 Ocak',
          currentStock: 7,
          dailyStock: 10,
          hasPickup: true,
          hasDelivery: true,
          createdAt: new Date().toISOString(),
          startDate: '17/01/2024',
          endDate: '24/01/2024',
        },
        {
          id: 'mock_17',
          name: 'Vejetaryen Köfte',
          cookName: 'Ayşe Hanım',
          price: 24,
          category: 'Vejetaryen',
          description: 'Mercimek ve sebze karışımı ile hazırlanmış köfte',
          imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop',
          availableDates: '17-24 Ocak',
          currentStock: 8,
          dailyStock: 10,
          hasPickup: true,
          hasDelivery: true,
          createdAt: new Date().toISOString(),
          startDate: '17/01/2024',
          endDate: '24/01/2024',
        },
        {
          id: 'mock_23',
          name: 'Ev Yapımı Sütlaç',
          cookName: 'Ayşe Hanım',
          price: 16,
          category: 'Tatlı/Kek',
          description: 'Geleneksel tarif ile hazırlanmış sütlaç',
          imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
          availableDates: '18-25 Ocak',
          currentStock: 12,
          dailyStock: 15,
          hasPickup: true,
          hasDelivery: true,
          createdAt: new Date().toISOString(),
          startDate: '18/01/2024',
          endDate: '25/01/2024',
        },
      ];
      
      // Add mock meals for demo (in real app, this would be user-specific)
      allMeals = [...allMeals, ...mockMealsForDemo];
      
      // Check for expired meals
      const currentDate = new Date();
      const activeMeals: Meal[] = [];
      const newExpiredMeals: Meal[] = [];
      
      allMeals.forEach((meal: Meal) => {
        if (meal.endDate) {
          const [day, month, year] = meal.endDate.split('/').map(Number);
          const endDate = new Date(year, month - 1, day);
          
          if (endDate < currentDate) {
            newExpiredMeals.push(meal);
          } else {
            activeMeals.push(meal);
          }
        } else {
          activeMeals.push(meal);
        }
      });
      
      setMeals(activeMeals);
      
      // Load existing expired meals and add new ones
      if (expiredMealsJson) {
        const existingExpired = JSON.parse(expiredMealsJson);
        const allExpiredMeals = [...existingExpired, ...newExpiredMeals];
        setExpiredMeals(allExpiredMeals);
      } else {
        setExpiredMeals(newExpiredMeals);
      }
      
    } catch (error) {
      console.error('Error loading meals:', error);
      setMeals([]);
      setExpiredMeals([]);
    }
  };

  const handleDeleteMeal = (mealId: string) => {
    Alert.alert(
      'Yemeği Sil',
      'Bu yemeği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteMeal(mealId),
        },
      ]
    );
  };

  const deleteMeal = async (mealId: string) => {
    try {
      const updatedMeals = meals.filter(meal => meal.id !== mealId);
      setMeals(updatedMeals);
      await AsyncStorage.setItem('publishedMeals', JSON.stringify(updatedMeals));
      
      Alert.alert('Başarılı', 'Yemek başarıyla silindi.');
    } catch (error) {
      console.error('Error deleting meal:', error);
      Alert.alert('Hata', 'Yemek silinirken bir hata oluştu.');
    }
  };

  const handleEditMeal = (meal: Meal) => {
    // Navigate to edit meal screen with meal data
    const mealData = encodeURIComponent(JSON.stringify(meal));
    router.push(`/(seller)/edit-meal?mealData=${mealData}`);
  };

  const handleMealPress = (meal: Meal) => {
    // Get seller name from profile (nickname preferred)
    let cookName = 'Satıcı';
    if (sellerProfile && sellerProfile.formData) {
      cookName = sellerProfile.formData.nickname || sellerProfile.formData.name || 'Satıcı';
    }

    // Navigate to food detail page
    const foodImageUrl = meal.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=160&h=140&fit=crop';
    const route = `/food-detail?id=${meal.id}&name=${encodeURIComponent(meal.name)}&cookName=${encodeURIComponent(cookName)}&imageUrl=${encodeURIComponent(foodImageUrl)}&deliveryType=Pickup&availableDates=${encodeURIComponent(meal.availableDates || '')}&currentStock=${meal.currentStock || 0}&dailyStock=${meal.dailyStock || 0}`;
    router.push(route);
  };

  const renderMealCard = (meal: Meal, isExpired: boolean = false) => (
    <TouchableOpacity key={meal.id} onPress={() => handleMealPress(meal)} activeOpacity={0.7}>
      <Card variant="default" padding="md" style={styles.mealCard}>
        <View style={styles.mealHeader}>
          <View style={styles.mealImageContainer}>
            <Image
              source={
                meal.imageUrl && (meal.imageUrl.startsWith('http') || meal.imageUrl.startsWith('file://'))
                  ? { uri: meal.imageUrl }
                  : { uri: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=160&h=140&fit=crop' }
              }
              style={styles.mealImage}
              defaultSource={{ uri: 'https://via.placeholder.com/80x80/f5f5f5/cccccc?text=📸' }}
            />
          </View>
        
        <View style={styles.mealInfo}>
          <Text variant="subheading" weight="semibold" numberOfLines={1}>
            {meal.name}
          </Text>
          <Text variant="body" color="primary" weight="semibold">
            ₺{meal.price}
          </Text>
          <Text variant="caption" color="textSecondary">
            {meal.category} • {meal.availableDates}
          </Text>
          <Text variant="caption" color="textSecondary">
            Stok: {meal.currentStock}/{meal.dailyStock}
          </Text>
        </View>
        
        {!isExpired && (
          <View style={styles.mealActions}>
            <TouchableOpacity
              onPress={() => handleEditMeal(meal)}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
            >
              <FontAwesome name="edit" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteMeal(meal.id)}
              style={[styles.actionButton, { backgroundColor: colors.error }]}
            >
              <FontAwesome name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {meal.description && (
        <Text variant="caption" color="textSecondary" style={styles.mealDescription} numberOfLines={2}>
          {meal.description}
        </Text>
      )}
      
      <View style={styles.mealTags}>
        {meal.hasPickup && (
          <View style={[styles.tag, { backgroundColor: colors.success + '20' }]}>
            <Text variant="caption" style={{ color: colors.success }}>Pickup</Text>
          </View>
        )}
        {meal.hasDelivery && (
          <View style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
            <Text variant="caption" style={{ color: colors.primary }}>Delivery</Text>
          </View>
        )}
        {isExpired && (
          <View style={[styles.tag, { backgroundColor: colors.error + '20' }]}>
            <Text variant="caption" style={{ color: colors.error }}>Süresi Dolmuş</Text>
          </View>
        )}
      </View>
    </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Yemeklerimi Yönet" 
        leftComponent={
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'active' ? colors.primary : 'transparent',
              borderBottomColor: activeTab === 'active' ? colors.primary : colors.border,
            }
          ]}
        >
          <Text
            variant="body"
            weight="medium"
            style={{
              color: activeTab === 'active' ? 'white' : colors.textSecondary,
            }}
          >
            Aktif Yemekler ({meals.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('expired')}
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'expired' ? colors.primary : 'transparent',
              borderBottomColor: activeTab === 'expired' ? colors.primary : colors.border,
            }
          ]}
        >
          <Text
            variant="body"
            weight="medium"
            style={{
              color: activeTab === 'expired' ? 'white' : colors.textSecondary,
            }}
          >
            Eski Yemekler ({expiredMeals.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'active' ? (
          meals.length > 0 ? (
            meals.map(meal => renderMealCard(meal))
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome name="cutlery" size={48} color={colors.textSecondary} />
              <Text variant="subheading" weight="semibold" color="textSecondary" style={styles.emptyTitle}>
                Henüz yemek eklenmemiş
              </Text>
              <Text variant="body" color="textSecondary" style={styles.emptyDescription}>
                Yemek Ekle butonuna tıklayarak ilk yemeğinizi ekleyin.
              </Text>
              <Button
                variant="primary"
                onPress={() => router.push('/(seller)/add-meal')}
                style={styles.addMealButton}
              >
                Yemek Ekle
              </Button>
            </View>
          )
        ) : (
          expiredMeals.length > 0 ? (
            expiredMeals.map(meal => renderMealCard(meal, true))
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome name="clock-o" size={48} color={colors.textSecondary} />
              <Text variant="subheading" weight="semibold" color="textSecondary" style={styles.emptyTitle}>
                Eski yemek bulunmuyor
              </Text>
              <Text variant="body" color="textSecondary" style={styles.emptyDescription}>
                Tarihi geçen yemekler burada görünecek.
              </Text>
            </View>
          )
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
  backButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 6,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  mealCard: {
    marginBottom: Spacing.md,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  mealImageContainer: {
    marginRight: Spacing.md,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  mealInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  mealActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealDescription: {
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  mealTags: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    maxWidth: 250,
    lineHeight: 20,
  },
  addMealButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
