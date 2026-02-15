import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardEvent,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCountry } from '../../../context/CountryContext';

export const BulkFoodDetailDemo: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentLanguage } = useTranslation();
  const { formatCurrency } = useCountry();
  const params = useLocalSearchParams();
  const { width: windowWidth } = useWindowDimensions();

  const cookName = String(params.cookName || (currentLanguage === 'en' ? 'Cook' : 'Usta'));

  const fallbackMeal = useMemo(
    () => ({
      id: String(params.id || 'bulk-demo'),
      title: String(params.name || (currentLanguage === 'en' ? 'Bulk Meal' : 'Toplu Yemek')),
      imageUrl: String(params.imageUrl || ''),
      price: Number(params.price || 0),
    }),
    [currentLanguage, params.id, params.imageUrl, params.name, params.price]
  );

  const meals = useMemo(() => {
    const rawMeals = Array.isArray(params.meals) ? params.meals[0] : params.meals;
    if (!rawMeals || typeof rawMeals !== 'string') {
      return [fallbackMeal];
    }

    try {
      const parsedMeals = JSON.parse(rawMeals);
      if (!Array.isArray(parsedMeals)) {
        return [fallbackMeal];
      }

      const normalized = parsedMeals
        .map((meal) => ({
          id: String(meal?.id ?? ''),
          title: String(meal?.title ?? '').trim(),
          imageUrl: String(meal?.imageUrl ?? ''),
          price: Number(meal?.price ?? 0),
        }))
        .filter((meal) => meal.id && meal.title);

      return normalized.length > 0 ? normalized : [fallbackMeal];
    } catch (error) {
      console.error('Error parsing bulk meals:', error);
      return [fallbackMeal];
    }
  }, [fallbackMeal, params.meals]);

  const [guestCount, setGuestCount] = useState(10);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeMinutes, setSelectedTimeMinutes] = useState<number>(12 * 60);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [note, setNote] = useState('');
  const [selectedMealIndex, setSelectedMealIndex] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [noteSectionY, setNoteSectionY] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const selectedMeal = meals[selectedMealIndex] ?? meals[0];
  const selectedMealTitle = selectedMeal?.title || fallbackMeal.title;
  const basePrice = selectedMeal?.price || fallbackMeal.price;
  const mealSlideWidth = Math.max(windowWidth - Spacing.md * 4, 220);

  useEffect(() => {
    if (selectedMealIndex >= meals.length) {
      setSelectedMealIndex(0);
    }
  }, [meals.length, selectedMealIndex]);

  const unitPrice = useMemo(() => {
    if (guestCount >= 30) return Math.max(basePrice * 0.85, 1);
    if (guestCount >= 20) return Math.max(basePrice * 0.9, 1);
    if (guestCount >= 10) return Math.max(basePrice * 0.95, 1);
    return Math.max(basePrice, 1);
  }, [basePrice, guestCount]);

  const totalPrice = useMemo(() => unitPrice * guestCount, [guestCount, unitPrice]);

  const increaseGuest = () => setGuestCount((prev) => Math.min(prev + 1, 300));
  const decreaseGuest = () => setGuestCount((prev) => Math.max(prev - 1, 1));

  const updateDate = (days: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + days);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      next.setHours(0, 0, 0, 0);
      if (next < today) {
        return today;
      }
      return next;
    });
  };

  const updateTime = (deltaMinutes: number) => {
    setSelectedTimeMinutes((prev) => {
      const next = (prev + deltaMinutes + 1440) % 1440;
      return next;
    });
  };

  const monthYearLabel = selectedDate.toLocaleDateString(currentLanguage === 'en' ? 'en-GB' : 'tr-TR', {
    month: 'long',
    year: 'numeric',
  });
  const dayLabel = selectedDate.toLocaleDateString(currentLanguage === 'en' ? 'en-GB' : 'tr-TR', {
    day: '2-digit',
    month: 'short',
  });
  const selectedHour = Math.floor(selectedTimeMinutes / 60);
  const selectedMinute = selectedTimeMinutes % 60;
  const timeLabel = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;

  useEffect(() => {
    const onShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };
    const onHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      onShow
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      onHide
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const submitDemo = () => {
    Alert.alert(
      currentLanguage === 'en' ? 'Demo Summary' : 'Demo Ozet',
      currentLanguage === 'en'
        ? `${selectedMealTitle}\nQuantity: ${guestCount}\nDate: ${dayLabel}\nTime: ${timeLabel}\nDelivery: ${deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}\nEstimated Total: ${totalPrice.toFixed(2)}`
        : `${selectedMealTitle}\nAdet: ${guestCount}\nTarih: ${dayLabel}\nSaat: ${timeLabel}\nTeslimat: ${deliveryType === 'pickup' ? 'Alirim' : 'Gelsin'}\nTahmini Toplam: ${totalPrice.toFixed(2)}`
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={currentLanguage === 'en' ? 'Bulk Demo' : 'Toplu Demo'}
        onBack={() => router.back()}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(Spacing.xl, keyboardHeight + Spacing.md) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <Card variant="default" padding="md">
          <Text variant="caption" color="textSecondary">
            Demo/izole yap, mevcut sistemi bozma, geri alinabilir olsun.
          </Text>
        </Card>

        <Card variant="default" padding="md" style={styles.mainCard}>
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {cookName}
          </Text>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.mealSlider}
            onMomentumScrollEnd={(event) => {
              const pageWidth = event.nativeEvent.layoutMeasurement.width;
              if (!pageWidth) return;
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
              setSelectedMealIndex(Math.max(0, Math.min(nextIndex, meals.length - 1)));
            }}
          >
            {meals.map((meal) => (
              <View key={meal.id} style={[styles.mealSlide, { width: mealSlideWidth }]}>
                {meal.imageUrl ? (
                  <Image source={{ uri: meal.imageUrl }} style={styles.image} />
                ) : (
                  <View style={[styles.image, styles.imagePlaceholder, { borderColor: colors.border }]}>
                    <Text variant="caption" color="textSecondary">
                      {currentLanguage === 'en' ? 'No image' : 'Gorsel yok'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {meals.length > 1 ? (
            <View style={styles.pagination}>
              {meals.map((meal, index) => (
                <View
                  key={meal.id}
                  style={[
                    styles.dot,
                    { backgroundColor: index === selectedMealIndex ? colors.primary : colors.border },
                  ]}
                />
              ))}
            </View>
          ) : null}

          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text variant="subheading" weight="semibold" numberOfLines={1}>
                {selectedMealTitle}
              </Text>
            </View>
            <Text variant="body" weight="semibold" color="primary">
              {formatCurrency(Math.max(basePrice, 0))}
            </Text>
          </View>
        </Card>

        <View style={styles.section}>
          <View style={styles.scheduleRow}>
            <View style={[styles.scheduleCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <View style={styles.scheduleHeader}>
                <MaterialIcons name="calendar-month" size={24} color={colors.primary} />
                <Text variant="body" weight="semibold" color="textSecondary" numberOfLines={1}>
                  {monthYearLabel}
                </Text>
              </View>
              <View style={styles.scheduleControlRow}>
                <TouchableOpacity
                  style={[styles.scheduleButton, { backgroundColor: colors.primary }]}
                  onPress={() => updateDate(-1)}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="remove" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text variant="subheading" weight="bold" center>
                  {dayLabel}
                </Text>
                <TouchableOpacity
                  style={[styles.scheduleButton, { backgroundColor: colors.primary }]}
                  onPress={() => updateDate(1)}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.scheduleCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <View style={styles.scheduleHeader}>
                <MaterialIcons name="schedule" size={24} color={colors.primary} />
                <Text variant="body" weight="semibold" color="textSecondary" numberOfLines={1}>
                  {currentLanguage === 'en' ? 'Time' : 'Saat'}
                </Text>
              </View>

              <View style={styles.timeControlRow}>
                <TouchableOpacity
                  style={[styles.scheduleButton, { backgroundColor: colors.primary }]}
                  onPress={() => updateTime(-30)}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="remove" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text variant="subheading" weight="bold">
                  {timeLabel}
                </Text>
                <TouchableOpacity
                  style={[styles.scheduleButton, { backgroundColor: colors.primary }]}
                  onPress={() => updateTime(30)}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <Card variant="default" padding="xs" style={[styles.section, styles.quantitySection]}>
          <Text variant="subheading" weight="semibold" center>
            {currentLanguage === 'en' ? 'Quantity' : 'Adet'}
          </Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={decreaseGuest}
              activeOpacity={0.85}
            >
              <MaterialIcons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text variant="heading" weight="bold">
              {guestCount}
            </Text>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={increaseGuest}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </Card>

        <Card variant="default" padding="sm" style={[styles.section, styles.deliverySection]}>
          <Text variant="subheading" weight="semibold" center>
            {currentLanguage === 'en' ? 'Delivery Type' : 'Teslimat Turu'}
          </Text>
          <View style={styles.deliveryRow}>
            <TouchableOpacity
              onPress={() => setDeliveryType('pickup')}
              activeOpacity={0.9}
              style={[
                styles.deliveryButton,
                {
                  borderColor: colors.border,
                  backgroundColor: deliveryType === 'pickup' ? colors.primary : colors.surface,
                },
              ]}
            >
              <Text
                variant="subheading"
                weight="bold"
                style={{ color: deliveryType === 'pickup' ? '#FFFFFF' : colors.text }}
              >
                {currentLanguage === 'en' ? 'Pickup' : 'Alirim'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDeliveryType('delivery')}
              activeOpacity={0.9}
              style={[
                styles.deliveryButton,
                {
                  borderColor: colors.border,
                  backgroundColor: deliveryType === 'delivery' ? colors.primary : colors.surface,
                },
              ]}
            >
              <Text
                variant="subheading"
                weight="bold"
                style={{ color: deliveryType === 'delivery' ? '#FFFFFF' : colors.text }}
              >
                {currentLanguage === 'en' ? 'Delivery' : 'Gelsin'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card
          variant="default"
          padding="md"
          style={styles.section}
          onLayout={(event) => setNoteSectionY(event.nativeEvent.layout.y)}
        >
          <Text variant="subheading" weight="semibold">
            {currentLanguage === 'en' ? 'Special Note' : 'Ozel Not'}
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            disableFullscreenUI
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollTo({
                  y: Math.max(noteSectionY - Spacing.md, 0),
                  animated: true,
                });
              }, 120);
            }}
            multiline
            placeholder={
              currentLanguage === 'en'
                ? 'Serving style, spice preference, package note...'
                : 'Sunum, aci seviyesi, paketleme notu...'
            }
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.noteInput,
              { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
            ]}
          />
        </Card>

        <Card variant="default" padding="md" style={styles.section}>
          <View style={styles.totalRow}>
            <Text variant="body" color="textSecondary">
              {currentLanguage === 'en' ? 'Estimated Total' : 'Tahmini Toplam'}
            </Text>
            <Text variant="subheading" weight="semibold" color="primary">
              {totalPrice.toFixed(2)}
            </Text>
          </View>
          <Button variant="primary" onPress={submitDemo} style={styles.submitButton}>
            {currentLanguage === 'en' ? 'Create Demo Bulk Request' : 'Demo Toplu Talep Olustur'}
          </Button>
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
  },
  contentContainer: {
    padding: Spacing.md,
  },
  mainCard: {
    marginTop: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerText: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  imagePlaceholder: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealSlider: {
    marginTop: Spacing.sm,
  },
  mealSlide: {
    flexShrink: 0,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  section: {
    marginTop: Spacing.sm,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  scheduleCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.sm,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  scheduleControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  scheduleButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  quantitySection: {
    paddingBottom: Spacing.md,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  deliveryRow: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  deliverySection: {
    paddingBottom: Spacing.sm,
  },
  deliveryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  noteInput: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 90,
    textAlignVertical: 'top',
    padding: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.xs,
  },
});
