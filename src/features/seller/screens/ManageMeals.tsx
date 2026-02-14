import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, PanResponder } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { useTranslation } from '../../../hooks/useTranslation';
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
  isActive?: boolean;
}

interface ManageMealsProps {
  embedded?: boolean;
}

export const ManageMeals: React.FC<ManageMealsProps> = ({ embedded = false }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [expiredMeals, setExpiredMeals] = useState<Meal[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({});
  const tabSwipeResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          Math.abs(gestureState.dx) > 14 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 22 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2,
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: (_, gestureState) => {
          if (Math.abs(gestureState.dx) < 70) return;

          if (gestureState.dx > 0 && activeTab !== 'expired') {
            setActiveTab('expired');
            return;
          }

          if (gestureState.dx < 0 && activeTab !== 'active') {
            setActiveTab('active');
          }
        },
      }),
    [activeTab]
  );

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

      const normalizeMeal = (meal: any): Meal => ({
        ...meal,
        currentStock: Number(meal.currentStock ?? 0),
        dailyStock: Number(meal.dailyStock ?? 0),
        isActive: meal.isActive !== false,
      });
      
      // Demo meals are used only as an initial seed, then persisted.
      const mockMealsForDemo = [
        {
          id: 'mock_1',
          name: t('manageMealsScreen.mock.mantiName'),
          cookName: t('manageMealsScreen.mock.cookName'),
          price: 35,
          category: t('manageMealsScreen.mock.mainDishCategory'),
          description: t('manageMealsScreen.mock.mantiDesc'),
          imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
          availableDates: t('manageMealsScreen.mock.mantiDates'),
          currentStock: 8,
          dailyStock: 10,
          hasPickup: true,
          hasDelivery: true,
          createdAt: new Date().toISOString(),
          startDate: '15/01/2026',
          endDate: '31/12/2099',
          isActive: true,
        },
        {
          id: 'mock_9',
          name: t('manageMealsScreen.mock.menemenName'),
          cookName: t('manageMealsScreen.mock.cookName'),
          price: 22,
          category: t('manageMealsScreen.mock.breakfastCategory'),
          description: t('manageMealsScreen.mock.menemenDesc'),
          imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
          availableDates: t('manageMealsScreen.mock.menemenDates'),
          currentStock: 7,
          dailyStock: 10,
          hasPickup: true,
          hasDelivery: true,
          createdAt: new Date().toISOString(),
          startDate: '17/01/2026',
          endDate: '31/12/2099',
          isActive: true,
        },
        {
          id: 'mock_17',
          name: t('manageMealsScreen.mock.veggieKofteName'),
          cookName: t('manageMealsScreen.mock.cookName'),
          price: 24,
          category: t('manageMealsScreen.mock.vegetarianCategory'),
          description: t('manageMealsScreen.mock.veggieKofteDesc'),
          imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop',
          availableDates: t('manageMealsScreen.mock.veggieKofteDates'),
          currentStock: 8,
          dailyStock: 10,
          hasPickup: true,
          hasDelivery: true,
          createdAt: new Date().toISOString(),
          startDate: '17/01/2026',
          endDate: '31/12/2099',
          isActive: true,
        },
        {
          id: 'mock_23',
          name: t('manageMealsScreen.mock.sutlacName'),
          cookName: t('manageMealsScreen.mock.cookName'),
          price: 16,
          category: t('manageMealsScreen.mock.dessertCategory'),
          description: t('manageMealsScreen.mock.sutlacDesc'),
          imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
          availableDates: t('manageMealsScreen.mock.sutlacDates'),
          currentStock: 12,
          dailyStock: 15,
          hasPickup: true,
          hasDelivery: true,
          createdAt: new Date().toISOString(),
          startDate: '18/01/2026',
          endDate: '31/12/2099',
          isActive: true,
        },
      ];

      const publishedMeals: Meal[] = publishedMealsJson
        ? JSON.parse(publishedMealsJson).map(normalizeMeal)
        : [];

      if (publishedMeals.length > 0) {
        allMeals = publishedMeals;
      } else {
        allMeals = mockMealsForDemo.map(normalizeMeal);
        await AsyncStorage.setItem('publishedMeals', JSON.stringify(allMeals));
      }
      
      // Check for expired meals
      const currentDate = new Date();
      const activeMeals: Meal[] = [];
      const newExpiredMeals: Meal[] = [];
      
      allMeals.forEach((meal: Meal) => {
        if (meal.endDate) {
          const [day, month, year] = meal.endDate.split('/').map(Number);
          const endDate = new Date(year, month - 1, day);
          
          if (endDate < currentDate || meal.isActive === false) {
            newExpiredMeals.push(meal);
          } else {
            activeMeals.push(meal);
          }
        } else {
          if (meal.isActive === false) {
            newExpiredMeals.push(meal);
          } else {
            activeMeals.push(meal);
          }
        }
      });
      
      setMeals(activeMeals);
      
      // Load existing expired meals and add new ones
      if (expiredMealsJson) {
        const existingExpired = JSON.parse(expiredMealsJson);
        const allExpiredMeals = [...existingExpired.map(normalizeMeal), ...newExpiredMeals];
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

  const handleEditMeal = (meal: Meal) => {
    const mealData = encodeURIComponent(JSON.stringify(meal));
    router.push(`/(seller)/edit-meal?mealData=${mealData}`);
  };

  const updateMealState = (mealId: string, updater: (meal: Meal) => Meal): Meal[] => {
    const updatedMeals = meals.map((meal) => (meal.id === mealId ? updater(meal) : meal));
    setMeals(updatedMeals);
    return updatedMeals;
  };

  const persistMealPatch = async (mealId: string, patch: Partial<Meal>) => {
    const existingMeals = await AsyncStorage.getItem('publishedMeals');
    if (!existingMeals) return;

    const parsed = JSON.parse(existingMeals);
    const updatedStoredMeals = parsed.map((meal: Meal) =>
      meal.id === mealId ? { ...meal, ...patch } : meal
    );
    await AsyncStorage.setItem('publishedMeals', JSON.stringify(updatedStoredMeals));
  };

  const getDraftStock = (meal: Meal) => {
    const draft = stockDrafts[meal.id];
    return typeof draft === 'number' ? draft : meal.currentStock;
  };

  const handleStockChange = (meal: Meal, delta: number) => {
    const baseStock = getDraftStock(meal);
    const nextStock = Math.max(0, baseStock + delta);
    setStockDrafts((prev) => ({ ...prev, [meal.id]: nextStock }));
  };

  const handleCancelStockDraft = (mealId: string) => {
    setStockDrafts((prev) => {
      const next = { ...prev };
      delete next[mealId];
      return next;
    });
  };

  const handleApplyStockDraft = async (meal: Meal) => {
    const nextStock = getDraftStock(meal);
    if (nextStock === meal.currentStock) {
      handleCancelStockDraft(meal.id);
      return;
    }

    updateMealState(meal.id, (currentMeal) => ({ ...currentMeal, currentStock: nextStock }));
    handleCancelStockDraft(meal.id);

    try {
      await persistMealPatch(meal.id, { currentStock: nextStock });
    } catch (error) {
      console.error('Error updating stock:', error);
      loadMeals();
      Alert.alert(t('manageMealsScreen.alerts.errorTitle'), t('manageMealsScreen.alerts.errorMessage'));
    }
  };

  const toggleMealAvailability = async (meal: Meal) => {
    const nextIsActive = meal.isActive === false;
    Alert.alert(
      t('manageMealsScreen.alerts.availabilityTitle'),
      t('manageMealsScreen.alerts.availabilityMessage', {
        name: meal.name,
        status: nextIsActive
          ? t('manageMealsScreen.tags.onSale')
          : t('manageMealsScreen.tags.paused'),
      }),
      [
        { text: t('manageMealsScreen.alerts.cancel'), style: 'cancel' },
        {
          text: t('manageMealsScreen.alerts.confirmUpdate'),
          onPress: async () => {
            updateMealState(meal.id, (currentMeal) => ({ ...currentMeal, isActive: nextIsActive }));
            if (!nextIsActive) {
              setMeals((prev) => prev.filter((item) => item.id !== meal.id));
              setExpiredMeals((prev) => [{ ...meal, isActive: false }, ...prev.filter((item) => item.id !== meal.id)]);
              setStockDrafts((prev) => {
                const next = { ...prev };
                delete next[meal.id];
                return next;
              });
              setActiveTab('expired');
            }

            try {
              await persistMealPatch(meal.id, { isActive: nextIsActive });
            } catch (error) {
              console.error('Error updating meal availability:', error);
              loadMeals();
              Alert.alert(t('manageMealsScreen.alerts.errorTitle'), t('manageMealsScreen.alerts.errorMessage'));
            }
          },
        },
      ]
    );
  };


  const renderMealCard = (meal: Meal, isExpired: boolean = false) => (
    <Card key={meal.id} variant="default" padding="md" style={styles.mealCard}>
        {(() => {
          const draftStock = getDraftStock(meal);
          const hasPendingStockUpdate = draftStock !== meal.currentStock;

          return (
            <>
        <View style={styles.mealHeader}>
          <View style={styles.mealImageContainer}>
            <Image
              source={
                meal.imageUrl && (meal.imageUrl.startsWith('http') || meal.imageUrl.startsWith('file://'))
                  ? { uri: meal.imageUrl }
                  : { uri: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=160&h=140&fit=crop' }
              }
              style={styles.mealImage}
              defaultSource={{ uri: 'https://placehold.co/80x80/f5f5f5/cccccc?text=IMG' }}
            />
          </View>

        <View style={styles.mealInfo}>
          <View style={styles.mealTitleRow}>
            <Text variant="subheading" weight="semibold" numberOfLines={1} style={styles.mealTitle}>
              {meal.name}
            </Text>
            <Text variant="body" color="primary" weight="semibold" numberOfLines={1}>
              ₺{meal.price}
            </Text>
          </View>
          <View style={styles.mealMetaRow}>
            <Text variant="caption" color="textSecondary">
              {meal.category} • {meal.availableDates}
            </Text>
            <Text variant="caption" color="textSecondary">
              {t('manageMealsScreen.stockLabel')} {draftStock}/{meal.dailyStock}
            </Text>
          </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleEditMeal(meal)}
          style={styles.editFloatingButton}
        >
          <MaterialIcons name="edit" size={16} color={colors.primary} />
        </TouchableOpacity>

        {meal.description && (
          <Text variant="caption" color="textSecondary" style={styles.mealDescription} numberOfLines={2}>
            {meal.description}
          </Text>
        )}

	        <View style={styles.mealTags}>
            {!isExpired && (
              <View style={[styles.tag, { backgroundColor: (meal.isActive === false ? colors.error : colors.success) + '20' }]}>
                <Text
                  variant="caption"
                  style={{ color: meal.isActive === false ? colors.error : colors.success }}
                >
                  {meal.isActive === false
                    ? t('manageMealsScreen.tags.paused')
                    : t('manageMealsScreen.tags.onSale')}
                </Text>
              </View>
            )}
	          {meal.hasPickup && (
	            <View style={[styles.tag, { backgroundColor: colors.success + '20' }]}>
	              <Text variant="caption" style={{ color: colors.success }}>
                {t('manageMealsScreen.tags.pickup')}
              </Text>
            </View>
          )}
          {meal.hasDelivery && (
            <View style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
              <Text variant="caption" style={{ color: colors.primary }}>
                {t('manageMealsScreen.tags.delivery')}
              </Text>
            </View>
          )}
	          {isExpired && (
	            <View style={[styles.tag, { backgroundColor: colors.error + '20' }]}>
	              <Text variant="caption" style={{ color: colors.error }}>
	                {t('manageMealsScreen.tags.expired')}
	              </Text>
	            </View>
	          )}
	        </View>
          {!isExpired && (
            <View style={styles.controlsRow}>
              <Text variant="caption" color="textSecondary">
                {t('manageMealsScreen.manualStockControl')}
              </Text>
              <View style={styles.stockStepper}>
                <TouchableOpacity
                  onPress={() => handleStockChange(meal, -1)}
                  style={[styles.stockButton, { borderColor: colors.border }]}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text variant="body" weight="semibold" style={styles.stockValue}>
                  {draftStock}
                </Text>
                <TouchableOpacity
                  onPress={() => handleStockChange(meal, 1)}
                  style={[styles.stockButton, { borderColor: colors.border }]}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
              {hasPendingStockUpdate && (
                <View style={styles.stockActionsRow}>
                  <TouchableOpacity
                    onPress={() => handleCancelStockDraft(meal.id)}
                    style={[styles.stockActionButton, { borderColor: colors.border }]}
                    activeOpacity={0.8}
                  >
                    <Text variant="caption" weight="semibold" style={{ color: colors.textSecondary }}>
                      {t('manageMealsScreen.alerts.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleApplyStockDraft(meal)}
                    style={[styles.stockActionButton, { backgroundColor: colors.success }]}
                    activeOpacity={0.8}
                  >
                    <Text variant="caption" weight="semibold" style={{ color: '#FFFFFF' }}>
                      {t('manageMealsScreen.alerts.confirmUpdate')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          {!isExpired && (
            <TouchableOpacity
              onPress={() => toggleMealAvailability(meal)}
              style={[
                styles.availabilityFloatingButton,
                { backgroundColor: meal.isActive === false ? colors.success : colors.error },
              ]}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={meal.isActive === false ? 'play-arrow' : 'pause'}
                size={14}
                color="#FFFFFF"
              />
              <Text variant="caption" weight="semibold" style={styles.availabilityButtonText}>
                {meal.isActive === false
                  ? t('manageMealsScreen.resumeSale')
                  : t('manageMealsScreen.pauseSale')}
              </Text>
            </TouchableOpacity>
          )}
            </>
          );
        })()}
    </Card>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      {...tabSwipeResponder.panHandlers}
    >
      {!embedded && (
        <TopBar 
          title={t('manageMealsScreen.title')} 
          leftComponent={
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          }
        />
      )}

      <View style={styles.manageMealsActions}>
        <Button
          variant="primary"
          onPress={() => router.push('/(seller)/add-meal')}
          style={[styles.addMealButtonTop, { backgroundColor: colors.secondary }]}
          textStyle={{ fontSize: 16 }}
        >
          {t('manageMealsScreen.addMeal')}
        </Button>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          style={[
            styles.tab,
            {
              borderBottomColor: activeTab === 'active' ? colors.primary : 'transparent',
            }
          ]}
        >
          <Text
            variant="body"
            weight="medium"
            style={{
              color: activeTab === 'active' ? colors.text : colors.textSecondary,
            }}
          >
            {t('manageMealsScreen.tabs.active', { count: meals.length })}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('expired')}
          style={[
            styles.tab,
            {
              borderBottomColor: activeTab === 'expired' ? colors.primary : 'transparent',
            }
          ]}
        >
          <Text
            variant="body"
            weight="medium"
            style={{
              color: activeTab === 'expired' ? colors.text : colors.textSecondary,
            }}
          >
            {t('manageMealsScreen.tabs.expired', { count: expiredMeals.length })}
          </Text>
        </TouchableOpacity>
      </View>

      {embedded && activeTab === 'expired' && (
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          activeOpacity={1}
          style={styles.collapseTapArea}
          accessible={false}
        />
      )}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'active' ? (
          meals.length > 0 ? (
            meals.map(meal => renderMealCard(meal))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="restaurant" size={48} color={colors.textSecondary} />
              <Text variant="subheading" weight="semibold" color="textSecondary" style={styles.emptyTitle}>
                {t('manageMealsScreen.emptyActiveTitle')}
              </Text>
              <Text variant="body" color="textSecondary" style={styles.emptyDescription}>
                {t('manageMealsScreen.emptyActiveDesc')}
              </Text>
            </View>
          )
        ) : (
          expiredMeals.length > 0 ? (
            expiredMeals.map(meal => renderMealCard(meal, true))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="schedule" size={48} color={colors.textSecondary} />
              <Text variant="subheading" weight="semibold" color="textSecondary" style={styles.emptyTitle}>
                {t('manageMealsScreen.emptyExpiredTitle')}
              </Text>
              <Text variant="body" color="textSecondary" style={styles.emptyDescription}>
                {t('manageMealsScreen.emptyExpiredDesc')}
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
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  manageMealsActions: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    alignItems: 'stretch',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  collapseTapArea: {
    height: Spacing.sm,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  mealCard: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
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
    paddingTop: Spacing.sm,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  mealMetaRow: {
    marginTop: Spacing.xs,
    gap: 2,
  },
  mealTitle: {
    flex: 1,
  },
  editFloatingButton: {
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
  mealDescription: {
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  mealTags: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  controlsRow: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  stockStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stockButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockValue: {
    minWidth: 24,
    textAlign: 'center',
  },
  stockActionsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  stockActionButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  availabilityFloatingButton: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 2,
  },
  availabilityButtonText: {
    color: '#FFFFFF',
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
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
  addMealButtonTop: {
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
