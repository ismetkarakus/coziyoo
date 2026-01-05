import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing, commonStyles } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import * as ImagePicker from 'expo-image-picker';

export const AddMeal: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Format date range for display (e.g., "1-3 Ocak")
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'Tarih belirtilmemiş';
    
    try {
      const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ];
      
      // Parse dates (assuming DD/MM/YYYY format)
      const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
      const [endDay, endMonth, endYear] = endDate.split('/').map(Number);
      
      // Same month and year
      if (startMonth === endMonth && startYear === endYear) {
        return `${startDay}-${endDay} ${months[startMonth - 1]}`;
      }
      
      // Different months or years
      return `${startDay} ${months[startMonth - 1]} - ${endDay} ${months[endMonth - 1]}`;
    } catch (error) {
      return `${startDate} - ${endDate}`;
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    dailyStock: '',
    deliveryFee: '',
    maxDistance: '',
    startDate: '',
    endDate: '',
    category: '',
  });

  const [deliveryOptions, setDeliveryOptions] = useState({
    pickup: true,
    delivery: false,
  });

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState<'startDate' | 'endDate'>('startDate');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [descriptionHeight, setDescriptionHeight] = useState(60); // Başlangıç yüksekliği

  // Categories from Home page
  const CATEGORIES = [
    'Ana Yemek',
    'Çorba', 
    'Kahvaltı',
    'Salata',
  ];

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    // Açıklama alanı için karakter limiti kontrolü
    if (field === 'description' && value.length > 500) {
      Alert.alert(
        'Karakter Limiti',
        'Açıklama en fazla 500 karakter olabilir.',
        [{ text: 'Tamam' }]
      );
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    setCategoryModalVisible(false);
  };

  const handleImageSelection = async () => {
    // İzin kontrolü
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'İzin Gerekli',
        'Fotoğraf seçmek için galeri erişim izni gereklidir.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Ayarlara Git', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
        ]
      );
      return;
    }

    // Kalan resim sayısını hesapla
    const remainingSlots = 5 - selectedImages.length;
    if (remainingSlots <= 0) {
      Alert.alert('Resim Limiti', 'En fazla 5 resim ekleyebilirsiniz.');
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
        'Resimler Eklendi',
        `${newImages.length} resim başarıyla eklendi. Toplam: ${selectedImages.length + newImages.length}/5`
      );
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    Alert.alert(
      'Resmi Sil',
      'Bu resmi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
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
        'İzin Gerekli',
        'Fotoğraf seçmek için galeri erişim izni gereklidir.',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Ayarlara Git', 
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
      Alert.alert('Resim Limiti', 'En fazla 5 resim ekleyebilirsiniz.');
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
        'Resimler Eklendi',
        `${newImages.length} resim başarıyla eklendi. Toplam: ${selectedImages.length + newImages.length}/5`
      );
    }
  };

  const handleImageRemove = (index: number) => {
    Alert.alert(
      'Resmi Sil',
      'Bu resmi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
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
        'Eksik Bilgi',
        'Önizleme için en az yemek adı, fiyat ve kategori gereklidir.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    // Delivery seçilmişse teslimat mesafesi gerekli
    if (deliveryOptions.delivery && !formData.maxDistance) {
      Alert.alert(
        'Teslimat Mesafesi Gerekli',
        'Delivery seçeneğini aktifleştirdiğiniz için teslimat mesafesini belirtmelisiniz.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    // Navigate to preview screen with form data
    const previewData = {
      name: formData.name,
      price: formData.price,
      category: formData.category,
      description: formData.description,
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
        'Navigasyon Hatası',
        'Önizleme sayfasına geçiş yapılamadı. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const handlePublish = async () => {
    // Validation
    if (!formData.name || !formData.price || !formData.dailyStock || !formData.category) {
      Alert.alert(
        'Eksik Bilgi',
        'Lütfen tüm zorunlu alanları doldurun.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    // Delivery seçilmişse teslimat mesafesi gerekli
    if (deliveryOptions.delivery && !formData.maxDistance) {
      Alert.alert(
        'Teslimat Mesafesi Gerekli',
        'Delivery seçeneğini aktifleştirdiğiniz için teslimat mesafesini belirtmelisiniz.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    try {
      // Create new meal object
      const newMeal = {
        id: 'meal-' + Date.now(),
        name: formData.name,
        cookName: 'Sizin Adınız', // This would come from user profile
        rating: 4.8, // Default rating for new meals
        price: parseInt(formData.price),
        distance: formData.maxDistance ? `${formData.maxDistance} km teslimat` : '0 km teslimat',
        category: formData.category,
        hasPickup: deliveryOptions.pickup,
        hasDelivery: deliveryOptions.delivery,
        availableDates: formatDateRange(formData.startDate, formData.endDate),
        currentStock: parseInt(formData.dailyStock),
        dailyStock: parseInt(formData.dailyStock),
        maxDeliveryDistance: parseInt(formData.maxDistance) || 0,
        imageUrl: selectedImages.length > 0 ? selectedImages[0] : undefined,
        description: formData.description,
        deliveryFee: formData.deliveryFee ? parseInt(formData.deliveryFee) : 0,
        createdAt: new Date().toISOString(),
      };

      // Get existing meals from AsyncStorage
      const existingMealsJson = await AsyncStorage.getItem('publishedMeals');
      const existingMeals = existingMealsJson ? JSON.parse(existingMealsJson) : [];

      // Add new meal to the beginning of the array
      const updatedMeals = [newMeal, ...existingMeals];

      // Save back to AsyncStorage
      await AsyncStorage.setItem('publishedMeals', JSON.stringify(updatedMeals));

      console.log('Meal published successfully:', newMeal);

      // Show success message
      Alert.alert(
        'Başarılı!',
        `Yemeğiniz "${formData.category}" kategorisinde başarıyla yayınlandı ve ana ekranda görünecek.`,
        [
          {
            text: 'Tamam',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error publishing meal:', error);
      Alert.alert(
        'Hata',
        'Yemek yayınlanırken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Yemek Ekle" 
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        }
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          {/* Photo Upload */}
          <View style={styles.photoSection}>
            <Text variant="subheading" weight="medium" style={[styles.sectionTitle, { color: '#000000' }]}>
              Yemek Fotoğrafları
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
                    Fotoğraf Ekle
                  </Text>
                  <Text variant="caption" style={[styles.photoCounter, { color: colors.textSecondary }]}>
                    ({selectedImages.length}/5)
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>

          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            
            {/* Category Selection */}
            <View style={styles.categoryContainer}>
              <Text variant="body" weight="medium" style={[styles.categoryLabel, { color: '#000000' }]}>
                Kategori Seç
              </Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(true)}
                style={[styles.categoryButton, { borderColor: colors.border }]}
              >
                <Text variant="body" style={{ color: formData.category ? '#000000' : '#666666', fontSize: 16 }}>
                  {formData.category || "Kategori seçin"}
                </Text>
                <Text variant="body" style={{ color: '#666666' }}>📁</Text>
              </TouchableOpacity>
            </View>

            <FormField
              label="Yemek Adı"
              value={formData.name}
              onChangeText={handleInputChange('name')}
              placeholder="Örn: Ev Yapımı Mantı"
              required
            />

            <View style={styles.descriptionContainer}>
              <FormField
                label="Açıklama / Baharatlar"
                value={formData.description}
                onChangeText={handleInputChange('description')}
                placeholder="Yemeğinizin özelliklerini ve kullanılan baharatları açıklayın..."
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
                  {formData.description.length}/500 karakter
                </Text>
                {formData.description.length > 0 && (
                  <Text variant="caption" style={[styles.lineCounter, { color: colors.textSecondary }]}>
                    {formData.description.split('\n').length} satır
                  </Text>
                )}
              </View>
            </View>

            <FormField
              label="Fiyat (₺)"
              value={formData.price}
              onChangeText={handleInputChange('price')}
              placeholder="25"
              keyboardType="numeric"
              required
            />

            <FormField
              label="Günlük Stok"
              value={formData.dailyStock}
              onChangeText={handleInputChange('dailyStock')}
              placeholder="10"
              keyboardType="numeric"
              required
            />


            <View style={styles.dateInputs}>
              <View style={styles.dateInput}>
                <Text variant="caption" style={[styles.dateLabel, { color: '#666666', fontSize: 14 }]}>
                  Başlangıç Tarihi
                </Text>
                <TouchableOpacity
                  onPress={() => openDatePicker('startDate')}
                  style={[styles.dateButton, { borderColor: colors.border }]}
                >
                  <Text variant="body" style={{ color: formData.startDate ? '#000000' : '#666666', fontSize: 16 }}>
                    {formData.startDate || "DD/MM/YYYY"}
                  </Text>
                  <Text variant="body" style={{ color: '#666666', fontSize: 18 }}>📅</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateInput}>
                <Text variant="caption" style={[styles.dateLabel, { color: '#666666', fontSize: 14 }]}>
                  Bitiş Tarihi
                </Text>
                <TouchableOpacity
                  onPress={() => openDatePicker('endDate')}
                  style={[styles.dateButton, { borderColor: colors.border }]}
                >
                  <Text variant="body" style={{ color: formData.endDate ? '#000000' : '#666666', fontSize: 16 }}>
                    {formData.endDate || "DD/MM/YYYY"}
                  </Text>
                  <Text variant="body" style={{ color: '#666666', fontSize: 18 }}>📅</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Delivery Options */}
          <View style={styles.section}>
            <Text variant="subheading" weight="medium" style={[styles.sectionTitle, { color: '#000000' }]}>
              Teslimat Seçenekleri
            </Text>
            
            <View style={styles.deliveryOptions}>
              <Button
                variant={deliveryOptions.pickup ? "primary" : "outline"}
                onPress={() => toggleDeliveryOption('pickup')}
                style={styles.deliveryButton}
              >
                {deliveryOptions.pickup ? "✓ " : ""}Pickup (Gel Al)
              </Button>
              
              <Button
                variant={deliveryOptions.delivery ? "primary" : "outline"}
                onPress={() => toggleDeliveryOption('delivery')}
                style={styles.deliveryButton}
              >
                {deliveryOptions.delivery ? "✓ " : ""}Delivery (Teslimat)
              </Button>
            </View>

            {deliveryOptions.delivery && (
              <View style={styles.deliverySettings}>
                <FormField
                  label="🚗 Teslimat Mesafesi (km)"
                  value={formData.maxDistance}
                  onChangeText={handleInputChange('maxDistance')}
                  placeholder="Örn: 5"
                  keyboardType="numeric"
                  required
                />

                <FormField
                  label="Teslimat Ücreti (₺)"
                  value={formData.deliveryFee}
                  onChangeText={handleInputChange('deliveryFee')}
                  placeholder="Örn: 10 ₺"
                  keyboardType="numeric"
                  helperText="Müşterilerden alacağınız teslimat ücreti"
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
            👁️ Önizleme (Müşteri Görünümü)
          </Button>

          <Button
            variant="primary"
            fullWidth
            onPress={handlePublish}
            style={styles.publishButton}
          >
            Yemeği Yayınla
          </Button>
        </View>
        </ScrollView>
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
                {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
              </Text>
              
              <TouchableOpacity
                onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                style={styles.navButton}
              >
                <Text variant="heading">›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDays}>
              {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((day) => (
                <Text key={day} variant="caption" color="textSecondary" style={styles.weekDay}>
                  {day}
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
                İptal
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
                Kategori Seçin
              </Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                style={styles.categoryCloseButton}
              >
                <Text variant="heading" style={{ color: colors.text, fontSize: 24 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text variant="body" color="textSecondary" style={styles.categoryModalSubtitle}>
              Yemeğinizin hangi kategoriye ait olduğunu seçin
            </Text>

            <View style={styles.categoryList}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => handleCategorySelect(category)}
                  style={[
                    styles.categoryOption,
                    { 
                      backgroundColor: formData.category === category ? colors.primary : colors.card,
                      borderColor: colors.border 
                    }
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryIcon}>
                    {category === 'Ana Yemek' && '🍽️'}
                    {category === 'Çorba' && '🍲'}
                    {category === 'Kahvaltı' && '🥐'}
                    {category === 'Salata' && '🥗'}
                  </Text>
                  <Text 
                    variant="body" 
                    weight="medium"
                    style={[
                      styles.categoryOptionText,
                      { color: formData.category === category ? 'white' : colors.text }
                    ]}
                  >
                    {category}
                  </Text>
                  {formData.category === category && (
                    <Text style={styles.categoryCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.categoryModalActions}>
              <Button
                variant="outline"
                onPress={() => setCategoryModalVisible(false)}
                style={styles.categoryCancelButton}
              >
                İptal
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
    maxWidth: 400,
    borderRadius: 16,
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
    marginBottom: Spacing.sm,
  },
  categoryModalTitle: {
    flex: 1,
    color: '#000000',
  },
  categoryCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryModalSubtitle: {
    marginBottom: Spacing.lg,
    color: '#666666',
    textAlign: 'center',
  },
  categoryList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
    width: 32,
  },
  categoryOptionText: {
    flex: 1,
    fontSize: 16,
  },
  categoryCheckmark: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  categoryModalActions: {
    alignItems: 'center',
  },
  categoryCancelButton: {
    minWidth: 120,
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
  imageNumber: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
});

