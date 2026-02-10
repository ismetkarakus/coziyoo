import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { TopBar } from '../../../components/layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { translations } from '../../../i18n/translations';
import { Colors, Spacing, commonStyles } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../../context/AuthContext';
import { foodService } from '../../../services/foodService';
import { storageService } from '../../../services/storageService';
import categoriesData from '../../../mock/categories.json';

export const AddMeal: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const locale = currentLanguage === 'en' ? 'en-GB' : 'tr-TR';
  const { user } = useAuth();

  // Countries list for autocomplete
  const COUNTRIES =
    (translations[currentLanguage]?.addMealScreen?.countries ??
      translations.tr.addMealScreen.countries) as string[];

  // Format date range for display (e.g., "1-3 Ocak")
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return t('addMealScreen.date.unknown');
    
    try {
      // Parse dates (assuming DD/MM/YYYY format)
      const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
      const [endDay, endMonth, endYear] = endDate.split('/').map(Number);
      const startDateObj = new Date(startYear, startMonth - 1, startDay);
      const endDateObj = new Date(endYear, endMonth - 1, endDay);
      
      // Same month and year
      if (startMonth === endMonth && startYear === endYear) {
        const monthName = startDateObj.toLocaleString(locale, { month: 'long' });
        return `${startDay}-${endDay} ${monthName}`;
      }
      
      // Different months or years
      const startMonthName = startDateObj.toLocaleString(locale, { month: 'long' });
      const endMonthName = endDateObj.toLocaleString(locale, { month: 'long' });
      return `${startDay} ${startMonthName} - ${endDay} ${endMonthName}`;
    } catch (error) {
      return `${startDate} - ${endDate}`;
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    recipe: '',
    price: '',
    dailyStock: '',
    deliveryFee: '',
    maxDistance: '',
    startDate: '',
    endDate: '',
    category: '',
    country: '',
  });

  const [deliveryOptions, setDeliveryOptions] = useState({
    pickup: true,
    delivery: false,
  });

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState<'startDate' | 'endDate'>('startDate');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [descriptionHeight, setDescriptionHeight] = useState(60); // Başlangıç yüksekliği
  const [recipeHeight, setRecipeHeight] = useState(60); // Başlangıç yüksekliği
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const CATEGORIES = (categoriesData.items ?? [])
    .filter((item) => item.id !== 'all')
    .map((item) => ({
      label: currentLanguage === 'tr' ? item.tr : item.en,
      icon: item.icon,
    }));

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    // Açıklama alanı için karakter limiti kontrolü
    if (field === 'description' && value.length > 500) {
      Alert.alert(
        t('addMealScreen.alerts.characterLimitTitle'),
        t('addMealScreen.alerts.characterLimitMessage'),
        [{ text: t('addMealScreen.alerts.ok') }]
      );
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Filter countries for autocomplete
    if (field === 'country') {
      if (value.length > 0) {
        const filtered = COUNTRIES.filter(country => 
          country.toLowerCase().startsWith(value.toLowerCase())
        );
        setFilteredCountries(filtered);
        setCountryModalVisible(filtered.length > 0);
      } else {
        setFilteredCountries([]);
        setCountryModalVisible(false);
      }
    }
  };

  const handleDescriptionContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const minHeight = 60; // 3 satır için minimum
    const maxHeight = 220; // 10 satır için maksimum
    const padding = 24; // Üst + alt padding
    
    // Yüksekliği sınırla ve padding ekle
    const newHeight = Math.max(minHeight, Math.min(height + padding, maxHeight));
    setDescriptionHeight(newHeight);
  };

  const handleRecipeContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const minHeight = 60; // 3 satır için minimum
    const maxHeight = 220; // 10 satır için maksimum
    const padding = 24; // Üst + alt padding
    
    // Yüksekliği sınırla ve padding ekle
    const newHeight = Math.max(minHeight, Math.min(height + padding, maxHeight));
    setRecipeHeight(newHeight);
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleCountrySelect = (country: string) => {
    setFormData(prev => ({ ...prev, country }));
    setCountryModalVisible(false);
    setFilteredCountries([]);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.nameRequired'));
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.descriptionRequired'));
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.priceInvalid'));
      return;
    }
    if (!formData.category) {
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.categoryRequired'));
      return;
    }
    if (!user) {
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.loginRequired'));
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      let imageUrl = '';
      
      // Firebase Storage'ı skip et, local image kullan
      if (selectedImages.length > 0) {
        console.log('Using local image (Firebase Storage bypassed)');
        imageUrl = selectedImages[0]; // Local image URI kullan
      } else {
        imageUrl = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop';
      }

      // Firebase'i skip et, direkt local storage kullan
      const foodId = 'local_' + Date.now();
      console.log('Using local storage only, foodId:', foodId);

      // AsyncStorage'a da kaydet (backward compatibility için)
      const mealData = {
        id: foodId,
        ...formData,
        recipe: formData.recipe,
        images: selectedImages,
        deliveryOptions,
        createdAt: new Date().toISOString(),
        sellerId: user.uid,
        sellerName: user.displayName || t('addMealScreen.defaults.sellerName'),
        cookName: user.displayName || t('addMealScreen.defaults.sellerName'), // Usta ismi için
        imageUrl,
        // Tarih bilgileri
        availableDates: formData.startDate && formData.endDate ? 
          formatDateRange(formData.startDate, formData.endDate) : 
          t('addMealScreen.date.unknown'),
        startDate: formData.startDate,
        endDate: formData.endDate,
        // Diğer eksik alanlar
        currentStock: parseInt(formData.dailyStock) || 0,
        hasPickup: deliveryOptions.pickup,
        hasDelivery: deliveryOptions.delivery,
      };

      const existingMeals = await AsyncStorage.getItem('publishedMeals');
      const meals = existingMeals ? JSON.parse(existingMeals) : [];
      meals.push(mealData);
      await AsyncStorage.setItem('publishedMeals', JSON.stringify(meals));

      Alert.alert(
        t('addMealScreen.alerts.successTitle'),
        t('addMealScreen.alerts.successMessage'),
        [
          {
            text: t('addMealScreen.alerts.ok'),
            onPress: () => {
              // Form'u temizle
              setFormData({
                name: '',
                description: '',
                recipe: '',
                price: '',
                dailyStock: '',
                deliveryFee: '',
                maxDistance: '',
                startDate: '',
                endDate: '',
                category: '',
                country: '',
              });
              setSelectedImages([]);
              setDeliveryOptions({ pickup: true, delivery: false });
              
              // Ana sayfaya dön
              router.replace('/(seller)/dashboard');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.publishError'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageSelection = async () => {
    // İzin kontrolü
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('addMealScreen.alerts.permissionTitle'),
        t('addMealScreen.alerts.galleryPermission'),
        [
          { text: t('addMealScreen.alerts.cancel'), style: 'cancel' },
          { text: t('addMealScreen.alerts.goToSettings'), onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
        ]
      );
      return;
    }

    // Kalan resim sayısını hesapla
    const remainingSlots = 5 - selectedImages.length;
    if (remainingSlots <= 0) {
      Alert.alert(t('addMealScreen.alerts.imageLimitTitle'), t('addMealScreen.alerts.imageLimitMessage'));
      return;
    }

    // Çoklu resim seçimi
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Çoklu seçim aktif
      selectionLimit: remainingSlots, // Kalan slot kadar seçim
      quality: 0.8,
      aspect: [4, 3],
      allowsEditing: false, // Çoklu seçimde editing kapalı
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...prev, ...newImages]);
      
      // Başarı mesajı
      Alert.alert(
        t('addMealScreen.alerts.imagesAddedTitle'),
        t('addMealScreen.alerts.imagesAddedMessage', { count: newImages.length, total: selectedImages.length + newImages.length })
      );
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    Alert.alert(
      t('addMealScreen.alerts.deleteImageTitle'),
      t('addMealScreen.alerts.deleteImageMessage'),
      [
        { text: t('addMealScreen.alerts.cancel'), style: 'cancel' },
        {
          text: t('addMealScreen.alerts.delete'),
          style: 'destructive',
          onPress: () => {
            setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
          }
        }
      ]
    );
  };

  const handleImageAdd = async () => {
    // İzin kontrolü
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('addMealScreen.alerts.permissionTitle'),
        t('addMealScreen.alerts.galleryPermission'),
        [
          { text: t('addMealScreen.alerts.cancel'), style: 'cancel' },
          { 
            text: t('addMealScreen.alerts.goToSettings'), 
            onPress: async () => {
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            }
          }
        ]
      );
      return;
    }

    // Kalan resim sayısını hesapla
    const remainingSlots = 5 - selectedImages.length;
    if (remainingSlots <= 0) {
      Alert.alert(t('addMealScreen.alerts.imageLimitTitle'), t('addMealScreen.alerts.imageLimitMessage'));
      return;
    }

    // Resim seçme seçenekleri
    Alert.alert(
      t('addMealScreen.alerts.addPhotoTitle'),
      t('addMealScreen.alerts.addPhotoMessage'),
      [
        { text: t('addMealScreen.alerts.cancel'), style: 'cancel' },
        { text: t('addMealScreen.alerts.pickSingle'), onPress: () => pickSingleImage() },
        { text: t('addMealScreen.alerts.pickMultiple'), onPress: () => pickMultipleImages() },
        { text: t('addMealScreen.alerts.takePhoto'), onPress: () => takePhoto() },
      ]
    );
  };

  const pickSingleImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = result.assets[0].uri;
        setSelectedImages(prev => [...prev, newImage]);
        
        Alert.alert(
          t('addMealScreen.alerts.successTitle'),
          t('addMealScreen.alerts.imageAdded'),
          [{ text: t('addMealScreen.alerts.ok') }]
        );
      }
    } catch (error) {
      console.error('Error picking single image:', error);
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.imagePickError'));
    }
  };

  const pickMultipleImages = async () => {
    try {
      const remainingSlots = 5 - selectedImages.length;
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newImages]);
        
        Alert.alert(
          t('addMealScreen.alerts.successTitle'),
          t('addMealScreen.alerts.imagesAddedMessage', { count: newImages.length, total: selectedImages.length + newImages.length }),
          [{ text: t('addMealScreen.alerts.ok') }]
        );
      }
    } catch (error) {
      console.error('Error picking multiple images:', error);
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.imagesPickError'));
    }
  };

  const takePhoto = async () => {
    try {
      // Kamera izni kontrolü
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('addMealScreen.alerts.permissionTitle'), t('addMealScreen.alerts.cameraPermission'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = result.assets[0].uri;
        setSelectedImages(prev => [...prev, newImage]);
        
        Alert.alert(
          t('addMealScreen.alerts.successTitle'),
          t('addMealScreen.alerts.photoTaken'),
          [{ text: t('addMealScreen.alerts.ok') }]
        );
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.photoError'));
    }
  };

  const handleImageRemove = (index: number) => {
    Alert.alert(
      t('addMealScreen.alerts.deleteImageTitle'),
      t('addMealScreen.alerts.deleteImageMessage'),
      [
        { text: t('addMealScreen.alerts.cancel'), style: 'cancel' },
        {
          text: t('addMealScreen.alerts.delete'),
          style: 'destructive',
          onPress: () => {
            setSelectedImages(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const openDatePicker = (field: 'startDate' | 'endDate') => {
    setSelectedDateField(field);
    setDatePickerVisible(true);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = formatDate(date);
    setFormData(prev => ({ ...prev, [selectedDateField]: formattedDate }));
    setDatePickerVisible(false);
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    const today = new Date();
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return { days, today };
  };


  const toggleDeliveryOption = (option: keyof typeof deliveryOptions) => {
    setDeliveryOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };


  const handlePreview = () => {
    console.log('Preview button pressed'); // Debug log
    
    // Basic validation for preview
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert(
        t('addMealScreen.alerts.missingInfoTitle'),
        t('addMealScreen.alerts.missingInfoMessage'),
        [{ text: t('addMealScreen.alerts.ok') }]
      );
      return;
    }

    // Tarih seçimi kontrolü
    if (!formData.startDate || !formData.endDate) {
      Alert.alert(
        t('addMealScreen.alerts.dateRequiredTitle'),
        t('addMealScreen.alerts.dateRequiredMessage'),
        [{ text: t('addMealScreen.alerts.ok') }]
      );
      return;
    }

    // Delivery seçilmişse teslimat mesafesi gerekli
    if (deliveryOptions.delivery && !formData.maxDistance) {
      Alert.alert(
        t('addMealScreen.alerts.distanceRequiredTitle'),
        t('addMealScreen.alerts.distanceRequiredMessage'),
        [{ text: t('addMealScreen.alerts.ok') }]
      );
      return;
    }

    // Navigate to preview screen with form data
    const previewData = {
      name: formData.name,
      price: formData.price,
      category: formData.category,
      country: formData.country,
      description: formData.description,
      recipe: formData.recipe,
      dailyStock: formData.dailyStock,
      maxDistance: formData.maxDistance,
      deliveryFee: formData.deliveryFee,
      startDate: formData.startDate,
      endDate: formData.endDate,
      availableDates: formatDateRange(formData.startDate, formData.endDate),
      hasPickup: deliveryOptions.pickup,
      hasDelivery: deliveryOptions.delivery,
      images: selectedImages,
    };

    console.log('Preview data:', previewData); // Debug log
    
    try {
      // URL encode the data to avoid issues with special characters
      const encodedData = encodeURIComponent(JSON.stringify(previewData));
      console.log('Navigating to preview with encoded data'); // Debug log
      router.push(`/(seller)/meal-preview?previewData=${encodedData}`);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        t('addMealScreen.alerts.navigationErrorTitle'),
        t('addMealScreen.alerts.navigationErrorMessage'),
        [{ text: t('addMealScreen.alerts.ok') }]
      );
    }
  };

  const handlePublish = async () => {
    // Detaylı validation
    const missingFields = [];
    if (!formData.name?.trim()) missingFields.push(t('addMealScreen.fields.name'));
    if (!formData.price?.trim()) missingFields.push(t('addMealScreen.fields.price'));
    if (!formData.dailyStock?.trim()) missingFields.push(t('addMealScreen.fields.dailyStock'));
    if (!formData.category?.trim()) missingFields.push(t('addMealScreen.fields.category'));
    
    if (missingFields.length > 0) {
      Alert.alert(
        t('addMealScreen.alerts.missingInfoTitle'),
        t('addMealScreen.alerts.missingFieldsMessage', { fields: missingFields.join('\n• ') }),
        [{ text: t('addMealScreen.alerts.ok') }]
      );
      return;
    }

    // Sayısal değer kontrolü
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.priceInvalid'));
      return;
    }

    if (isNaN(parseInt(formData.dailyStock)) || parseInt(formData.dailyStock) <= 0) {
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.stockInvalid'));
      return;
    }

    if (!user) {
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.loginRequired'));
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      let imageUrl = '';
      
      // Firebase Storage'ı skip et, local image kullan
      if (selectedImages.length > 0) {
        console.log('Using local image (Firebase Storage bypassed)');
        imageUrl = selectedImages[0]; // Local image URI kullan
      } else {
        imageUrl = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop';
      }

      // Firebase'i skip et, direkt local storage kullan
      const foodId = 'local_' + Date.now();
      console.log('Using local storage only, foodId:', foodId);

      // AsyncStorage'a da kaydet (backward compatibility için)
      const mealData = {
        id: foodId,
        ...formData,
        recipe: formData.recipe,
        images: selectedImages,
        deliveryOptions,
        createdAt: new Date().toISOString(),
        sellerId: user.uid,
        sellerName: user.displayName || t('addMealScreen.defaults.sellerName'),
        cookName: user.displayName || t('addMealScreen.defaults.sellerName'), // Usta ismi için
        imageUrl,
        // Tarih bilgileri
        availableDates: formData.startDate && formData.endDate ? 
          formatDateRange(formData.startDate, formData.endDate) : 
          t('addMealScreen.date.unknown'),
        startDate: formData.startDate,
        endDate: formData.endDate,
        // Diğer eksik alanlar
        currentStock: parseInt(formData.dailyStock) || 0,
        hasPickup: deliveryOptions.pickup,
        hasDelivery: deliveryOptions.delivery,
      };

      const existingMeals = await AsyncStorage.getItem('publishedMeals');
      const meals = existingMeals ? JSON.parse(existingMeals) : [];
      meals.push(mealData);
      await AsyncStorage.setItem('publishedMeals', JSON.stringify(meals));

      Alert.alert(
        t('addMealScreen.alerts.successTitle'),
        t('addMealScreen.alerts.successMessage'),
        [
          {
            text: t('addMealScreen.alerts.ok'),
            onPress: () => {
              // Form'u temizle
              setFormData({
                name: '',
                description: '',
                recipe: '',
                price: '',
                dailyStock: '',
                deliveryFee: '',
                maxDistance: '',
                startDate: '',
                endDate: '',
                category: '',
                country: '',
              });
              setSelectedImages([]);
              setDeliveryOptions({ pickup: true, delivery: false });
              
              // Ana sayfaya dön
              router.replace('/(seller)/dashboard');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error adding food:', error);
      
      // Daha detaylı hata mesajı
      let errorMessage = t('addMealScreen.alerts.publishError');
      
      Alert.alert(t('addMealScreen.alerts.errorTitle'), t('addMealScreen.alerts.publishErrorDetail', { message: errorMessage }));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={t('addMealScreen.title')} 
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
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          {/* Photo Upload */}
          <View style={styles.photoSection}>
            <Text variant="subheading" weight="medium" style={[styles.sectionTitle, { color: '#000000' }]}>
              {t('addMealScreen.sections.photos')}
            </Text>
            
            {/* Selected Images Preview */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    onPress={() => handleImageRemove(index)}
                    style={styles.removeImageButton}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                  <View style={styles.imageNumberBadge}>
                    <Text style={styles.imageNumber}>{index + 1}</Text>
                  </View>
                </View>
              ))}
              
              {/* Add Photo Button - Always visible if under limit */}
              {selectedImages.length < 5 && (
                <TouchableOpacity
                  onPress={handleImageAdd}
                  style={[styles.photoPlaceholder, { backgroundColor: colors.surface }]}
                >
                  <Text variant="title" style={{ color: colors.primary, fontSize: 32 }}>
                    📸
                  </Text>
                  <Text variant="caption" style={[styles.photoText, { color: colors.primary, fontWeight: '600' }]}>
                    {t('addMealScreen.photos.add')}
                  </Text>
                  <Text variant="caption" style={[styles.photoCounter, { color: colors.textSecondary }]}>
                    ({selectedImages.length}/5)
                  </Text>
                  <Text variant="caption" style={[styles.photoHint, { color: colors.textSecondary }]}>
                    {t('addMealScreen.photos.hint')}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>

          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            
            {/* Country Selection */}
            <View style={styles.countryContainer}>
              <FormField
                label={t('addMealScreen.fields.country')}
                value={formData.country}
                onChangeText={handleInputChange('country')}
                placeholder={t('addMealScreen.placeholders.country')}
                required
              />
              
              {/* Country Autocomplete Modal */}
              {countryModalVisible && (
                <View style={styles.autocompleteContainer}>
                  <ScrollView style={styles.autocompleteList} keyboardShouldPersistTaps="handled">
                    {filteredCountries.map((country, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleCountrySelect(country)}
                        style={styles.autocompleteItem}
                      >
                        <Text variant="body" style={styles.autocompleteText}>
                          {country}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            
            {/* Category Selection */}
            <View style={styles.categoryContainer}>
              <Text variant="body" weight="medium" style={[styles.categoryLabel, { color: '#000000' }]}>
                {t('addMealScreen.labels.categorySelect')}
              </Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(true)}
                style={[styles.categoryButton, { borderColor: colors.border }]}
              >
                <Text variant="body" style={{ color: formData.category ? '#000000' : '#666666', fontSize: 16 }}>
                  {formData.category || t('addMealScreen.placeholders.category')}
                </Text>
                <Text variant="body" style={{ color: '#666666' }}>📁</Text>
              </TouchableOpacity>
            </View>

            <FormField
              label={t('addMealScreen.fields.name')}
              value={formData.name}
              onChangeText={handleInputChange('name')}
              placeholder={t('addMealScreen.placeholders.name')}
              required
            />

            <View style={styles.descriptionContainer}>
              <FormField
                label={t('addMealScreen.fields.description')}
                value={formData.description}
                onChangeText={handleInputChange('description')}
                placeholder={t('addMealScreen.placeholders.description')}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                style={[styles.descriptionInput, { height: descriptionHeight }]}
                onContentSizeChange={handleDescriptionContentSizeChange}
                required
              />
              
              {/* Karakter Sayacı */}
              <View style={styles.characterCounter}>
                <Text variant="caption" style={[styles.counterText, { 
                  color: formData.description.length > 500 ? colors.error : colors.textSecondary 
                }]}>
                  {t('addMealScreen.labels.characterCount', { count: formData.description.length })}
                </Text>
                {formData.description.length > 0 && (
                  <Text variant="caption" style={[styles.lineCounter, { color: colors.textSecondary }]}>
                    {t('addMealScreen.labels.lineCount', { count: formData.description.split('\n').length })}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.descriptionContainer}>
              <FormField
                label={t('addMealScreen.fields.recipe')}
                value={formData.recipe}
                onChangeText={handleInputChange('recipe')}
                placeholder={t('addMealScreen.placeholders.recipe')}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                style={[styles.descriptionInput, { height: recipeHeight }]}
                onContentSizeChange={handleRecipeContentSizeChange}
              />
              
              {/* Karakter Sayacı */}
              <View style={styles.characterCounter}>
                <Text variant="caption" style={[styles.counterText, {
                  color: colors.textSecondary
                }]}>
                  {t('addMealScreen.labels.characterCount', { count: formData.recipe.length })}
                </Text>
                {formData.recipe.length > 0 && (
                  <Text variant="caption" style={[styles.lineCounter, { color: colors.textSecondary }]}>
                    {t('addMealScreen.labels.lineCount', { count: formData.recipe.split('\n').length })}
                  </Text>
                )}
              </View>
            </View>

            <FormField
              label={t('addMealScreen.fields.price')}
              value={formData.price}
              onChangeText={handleInputChange('price')}
              placeholder={t('addMealScreen.placeholders.price')}
              keyboardType="numeric"
              required
            />

            <FormField
              label={t('addMealScreen.fields.dailyStock')}
              value={formData.dailyStock}
              onChangeText={handleInputChange('dailyStock')}
              placeholder={t('addMealScreen.placeholders.dailyStock')}
              keyboardType="numeric"
              required
            />


            <View style={styles.dateInputs}>
              <View style={styles.dateInput}>
                <Text variant="caption" style={[styles.dateLabel, { color: '#666666', fontSize: 14 }]}>
                  {t('addMealScreen.fields.startDate')}
                </Text>
                <TouchableOpacity
                  onPress={() => openDatePicker('startDate')}
                  style={[styles.dateButton, { borderColor: colors.border }]}
                >
                  <Text variant="body" style={{ color: formData.startDate ? '#000000' : '#666666', fontSize: 16 }}>
                    {formData.startDate || t('addMealScreen.placeholders.date')}
                  </Text>
                  <Text variant="body" style={{ color: '#666666', fontSize: 18 }}>📅</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateInput}>
                <Text variant="caption" style={[styles.dateLabel, { color: '#666666', fontSize: 14 }]}>
                  {t('addMealScreen.fields.endDate')}
                </Text>
                <TouchableOpacity
                  onPress={() => openDatePicker('endDate')}
                  style={[styles.dateButton, { borderColor: colors.border }]}
                >
                  <Text variant="body" style={{ color: formData.endDate ? '#000000' : '#666666', fontSize: 16 }}>
                    {formData.endDate || t('addMealScreen.placeholders.date')}
                  </Text>
                  <Text variant="body" style={{ color: '#666666', fontSize: 18 }}>📅</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Delivery Options */}
          <View style={styles.section}>
            <Text variant="subheading" weight="medium" style={[styles.sectionTitle, { color: '#000000' }]}>
              {t('addMealScreen.sections.deliveryOptions')}
            </Text>
            
            <View style={styles.deliveryOptions}>
              <Button
                variant={deliveryOptions.pickup ? "primary" : "outline"}
                onPress={() => toggleDeliveryOption('pickup')}
                style={styles.deliveryButton}
              >
                {deliveryOptions.pickup ? `✓ ${t('addMealScreen.delivery.pickup')}` : t('addMealScreen.delivery.pickup')}
              </Button>
              
              <Button
                variant={deliveryOptions.delivery ? "primary" : "outline"}
                onPress={() => toggleDeliveryOption('delivery')}
                style={styles.deliveryButton}
              >
                {deliveryOptions.delivery ? `✓ ${t('addMealScreen.delivery.delivery')}` : t('addMealScreen.delivery.delivery')}
              </Button>
            </View>

            {deliveryOptions.delivery && (
              <View style={styles.deliverySettings}>
                <FormField
                  label={t('addMealScreen.fields.maxDistance')}
                  value={formData.maxDistance}
                  onChangeText={handleInputChange('maxDistance')}
                  placeholder={t('addMealScreen.placeholders.maxDistance')}
                  keyboardType="numeric"
                  required
                />

                <FormField
                  label={t('addMealScreen.fields.deliveryFee')}
                  value={formData.deliveryFee}
                  onChangeText={handleInputChange('deliveryFee')}
                  placeholder={t('addMealScreen.placeholders.deliveryFee')}
                  keyboardType="numeric"
                  helperText={t('addMealScreen.labels.deliveryFeeHelper')}
                />
              </View>
            )}
          </View>

          <Button
            variant="outline"
            fullWidth
            onPress={handlePreview}
            style={styles.previewButton}
          >
            {t('addMealScreen.actions.preview')}
          </Button>

          <Button
            variant="primary"
            fullWidth
            onPress={handlePublish}
            style={styles.publishButton}
            loading={uploading}
          >
            {uploading
              ? t('addMealScreen.actions.uploading', { progress: uploadProgress.toFixed(0) })
              : t('addMealScreen.actions.publish')}
          </Button>
        </View>
        </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal
        visible={datePickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarContainer, { backgroundColor: colors.background }]}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                style={styles.navButton}
              >
                <Text variant="heading">‹</Text>
              </TouchableOpacity>
              
              <Text variant="subheading" weight="semibold">
                {currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
              </Text>
              
              <TouchableOpacity
                onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                style={styles.navButton}
              >
                <Text variant="heading">›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDays}>
              {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((dayKey) => (
                <Text key={dayKey} variant="caption" color="textSecondary" style={styles.weekDay}>
                  {t(`addMealScreen.weekDays.${dayKey}`)}
                </Text>
              ))}
            </View>

            <View style={styles.calendar}>
              {generateCalendar().days.map((date, index) => {
                const { today } = generateCalendar();
                const isToday = date && date.toDateString() === today.toDateString();
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => date && handleDateSelect(date)}
                    style={[
                      styles.dayButton,
                      isToday && { backgroundColor: colors.primary },
                      !date && { opacity: 0 }
                    ]}
                    disabled={!date}
                  >
                    {date && (
                      <Text
                        variant="body"
                        style={[
                          styles.dayText,
                          isToday && { color: 'white', fontWeight: 'bold' }
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.calendarActions}>
              <Button
                variant="outline"
                onPress={() => setDatePickerVisible(false)}
                style={styles.cancelButton}
              >
                {t('addMealScreen.actions.cancel')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.categoryModalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.categoryModalHeader}>
              <Text variant="heading" weight="bold" style={styles.categoryModalTitle}>
                {t('addMealScreen.modals.categoryTitle')}
              </Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                style={styles.categoryCloseButton}
              >
                <Text variant="heading" style={{ color: colors.text, fontSize: 24 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text variant="body" color="textSecondary" style={styles.categoryModalSubtitle}>
              {t('addMealScreen.modals.categorySubtitle')}
            </Text>

            <View style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Picker
                selectedValue={formData.category || CATEGORIES[0]?.label}
                onValueChange={(value) => handleCategorySelect(String(value))}
                style={[styles.categoryPicker, { color: colors.text }]}
                itemStyle={[styles.categoryPickerItem, { color: colors.text }]}
              >
                {CATEGORIES.map((category) => (
                  <Picker.Item
                    key={category.label}
                    label={category.label}
                    value={category.label}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.categoryModalActions}>
              <Button
                variant="outline"
                onPress={() => setCategoryModalVisible(false)}
                style={styles.categoryCancelButton}
              >
                {t('addMealScreen.actions.cancel')}
              </Button>
              <Button
                variant="primary"
                onPress={() => setCategoryModalVisible(false)}
                style={styles.categoryConfirmButton}
              >
                {t('addMealScreen.actions.confirm')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

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
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  photoSection: {
    marginBottom: Spacing.md,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  imagePreview: {
    position: 'relative',
    marginRight: Spacing.sm,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  removeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageNumberBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageNumber: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    marginRight: Spacing.sm,
  },
  photoText: {
    marginTop: Spacing.xs,
    fontSize: 10,
    textAlign: 'center',
  },
  photoCounter: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  photoHint: {
    fontSize: 8,
    marginTop: 1,
    textAlign: 'center',
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  deliveryOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  deliveryButton: {
    flex: 1,
  },
  deliverySettings: {
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  previewButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  publishButton: {
    marginBottom: Spacing.xl,
  },
  dateInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    marginBottom: Spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: '90%',
    maxWidth: 350,
    borderRadius: 12,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
  dayText: {
    textAlign: 'center',
  },
  calendarActions: {
    alignItems: 'center',
  },
  cancelButton: {
    minWidth: 100,
  },
  categoryContainer: {
    marginTop: Spacing.md,
  },
  categoryLabel: {
    marginBottom: Spacing.sm,
    fontSize: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  categoryModalContainer: {
    width: '90%',
    maxWidth: 420,
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '80%',
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryModalTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#000000',
  },
  categoryCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  categoryModalSubtitle: {
    marginBottom: Spacing.md,
    color: '#666666',
    textAlign: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  categoryPicker: {
    width: '100%',
    height: 220,
  },
  categoryPickerItem: {
    fontSize: 18,
  },
  categoryModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  categoryCancelButton: {
    flex: 1,
    minWidth: 120,
  },
  categoryConfirmButton: {
    flex: 1,
  },
  selectedImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  selectedImageItem: {
    position: 'relative',
  },
  selectedImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  descriptionContainer: {
    marginBottom: Spacing.md,
  },
  descriptionInput: {
    paddingTop: 12, // Üst padding
    paddingBottom: 12, // Alt padding
    lineHeight: 22, // Satır yüksekliği
    fontSize: 16, // Font boyutu
    textAlignVertical: 'top', // Metin üstten başlasın
    color: '#000000', // Siyah renk
    borderRadius: 12, // Köşe yuvarlaklığı
    borderWidth: 1.5, // Kalın border
    borderColor: '#E0E0E0', // Açık gri border
    backgroundColor: '#FAFAFA', // Çok açık gri arka plan
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    // Dinamik yükseklik - state'den gelecek
  },
  characterCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lineCounter: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  // Country Autocomplete Styles
  countryContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  autocompleteContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  autocompleteList: {
    maxHeight: 200,
  },
  autocompleteItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  autocompleteText: {
    fontSize: 16,
    color: '#000000', // Siyah renk
  },
});
