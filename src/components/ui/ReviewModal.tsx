import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Text, Button, StarRating } from './';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, images: string[]) => void;
  foodName: string;
  loading?: boolean;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  foodName,
  loading = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Hata', 'Lütfen bir puan verin.');
      return;
    }
    
    if (comment.trim().length < 10) {
      Alert.alert('Hata', 'Yorum en az 10 karakter olmalıdır.');
      return;
    }

    onSubmit(rating, comment.trim(), images);
  };

  const handleReset = () => {
    setRating(0);
    setComment('');
    setImages([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit', 'En fazla 3 resim ekleyebilirsiniz.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gerekli.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Çok Kötü';
      case 2: return 'Kötü';
      case 3: return 'Orta';
      case 4: return 'İyi';
      case 5: return 'Mükemmel';
      default: return 'Puan verin';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <FontAwesome name="times" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text variant="heading" style={styles.title}>
            Değerlendirme Yap
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Food Name */}
          <View style={styles.foodInfo}>
            <Text variant="subheading" weight="medium" style={{ color: colors.text }}>
              {foodName}
            </Text>
            <Text variant="body" style={{ color: colors.textSecondary, marginTop: 4 }}>
              Bu yemek hakkında ne düşünüyorsunuz?
            </Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingSection}>
            <Text variant="subheading" weight="medium" style={[styles.sectionTitle, { color: colors.text }]}>
              Puanınız
            </Text>
            <View style={styles.ratingContainer}>
              <StarRating
                rating={rating}
                size="large"
                interactive
                onRatingChange={setRating}
              />
              <Text variant="body" style={[styles.ratingText, { color: colors.primary }]}>
                {getRatingText(rating)}
              </Text>
            </View>
          </View>

          {/* Comment */}
          <View style={styles.commentSection}>
            <Text variant="subheading" weight="medium" style={[styles.sectionTitle, { color: colors.text }]}>
              Yorumunuz
            </Text>
            <TextInput
              style={[
                styles.commentInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }
              ]}
              placeholder="Yemeğin tadı, sunumu, tazeliği hakkında düşüncelerinizi paylaşın... (En az 10 karakter)"
              placeholderTextColor={colors.textSecondary}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text variant="caption" style={[styles.characterCount, { color: colors.textSecondary }]}>
              {comment.length}/500
            </Text>
          </View>

          {/* Images */}
          <View style={styles.imagesSection}>
            <Text variant="subheading" weight="medium" style={[styles.sectionTitle, { color: colors.text }]}>
              Fotoğraflar (İsteğe bağlı)
            </Text>
            <Text variant="caption" style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              En fazla 3 fotoğraf ekleyebilirsiniz
            </Text>
            
            <View style={styles.imagesContainer}>
              {images.map((imageUri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.image} />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                  >
                    <FontAwesome name="times" size={12} color={colors.background} />
                  </TouchableOpacity>
                </View>
              ))}
              
              {images.length < 3 && (
                <TouchableOpacity
                  onPress={pickImage}
                  style={[styles.addImageButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <FontAwesome name="camera" size={20} color={colors.textSecondary} />
                  <Text variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
                    Fotoğraf Ekle
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Button
            variant="outline"
            onPress={handleClose}
            style={styles.cancelButton}
          >
            İptal
          </Button>
          <Button
            variant="primary"
            onPress={handleSubmit}
            loading={loading}
            disabled={rating === 0 || comment.trim().length < 10}
            style={styles.submitButton}
          >
            Gönder
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40, // Same as close button for centering
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  foodInfo: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  ratingSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    marginBottom: Spacing.md,
  },
  ratingContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '500',
  },
  commentSection: {
    marginBottom: Spacing.xl,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  imagesSection: {
    marginBottom: Spacing.xl,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
