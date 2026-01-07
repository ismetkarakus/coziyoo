import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  getMetadata
} from 'firebase/storage';
import { storage } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

class StorageService {
  // Resim seçme ve yükleme
  async pickAndUploadImage(
    folder: string = 'images',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      // Kamera/galeri izni iste
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Galeri erişim izni gerekli');
      }

      // Resim seç
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        throw new Error('Resim seçilmedi');
      }

      // Resmi yükle
      return await this.uploadImage(result.assets[0].uri, folder, onProgress);
    } catch (error) {
      console.error('Resim seçme ve yükleme hatası:', error);
      throw error;
    }
  }

  // Kameradan resim çekme ve yükleme
  async takePhotoAndUpload(
    folder: string = 'images',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      // Kamera izni iste
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Kamera erişim izni gerekli');
      }

      // Fotoğraf çek
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        throw new Error('Fotoğraf çekilmedi');
      }

      // Resmi yükle
      return await this.uploadImage(result.assets[0].uri, folder, onProgress);
    } catch (error) {
      console.error('Fotoğraf çekme ve yükleme hatası:', error);
      throw error;
    }
  }

  // Resim yükleme (URI'den)
  async uploadImage(
    imageUri: string,
    folder: string = 'images',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      // Resmi blob'a çevir
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Benzersiz dosya adı oluştur
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, `${folder}/${fileName}`);

      // Progress callback ile yükleme
      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, blob);
        
        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = {
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              };
              onProgress(progress);
            },
            (error) => {
              console.error('Yükleme hatası:', error);
              reject(new Error('Resim yüklenemedi'));
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                reject(new Error('Download URL alınamadı'));
              }
            }
          );
        });
      } else {
        // Progress olmadan yükleme
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
      }
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      throw new Error('Resim yüklenemedi');
    }
  }

  // Resim silme
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // URL'den storage referansı oluştur
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Resim silme hatası:', error);
      throw new Error('Resim silinemedi');
    }
  }

  // Dosya metadata'sı alma
  async getFileMetadata(imageUrl: string) {
    try {
      const imageRef = ref(storage, imageUrl);
      return await getMetadata(imageRef);
    } catch (error) {
      console.error('Metadata alma hatası:', error);
      throw new Error('Dosya bilgileri alınamadı');
    }
  }

  // Birden fazla resim yükleme
  async uploadMultipleImages(
    imageUris: string[],
    folder: string = 'images',
    onProgress?: (index: number, progress: UploadProgress) => void
  ): Promise<string[]> {
    try {
      const uploadPromises = imageUris.map((uri, index) => 
        this.uploadImage(
          uri, 
          folder, 
          onProgress ? (progress) => onProgress(index, progress) : undefined
        )
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Çoklu resim yükleme hatası:', error);
      throw new Error('Resimler yüklenemedi');
    }
  }

  // Profil resmi yükleme (özel folder)
  async uploadProfileImage(
    imageUri: string,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    return this.uploadImage(imageUri, `profiles/${userId}`, onProgress);
  }

  // Yemek resmi yükleme (özel folder)
  async uploadFoodImage(
    imageUri: string,
    sellerId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    return this.uploadImage(imageUri, `foods/${sellerId}`, onProgress);
  }
}

export const storageService = new StorageService();
