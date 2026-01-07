# 🔥 Firebase Veri Görüntüleme ve Kontrol Rehberi

## 📊 Firebase Console'dan Veri Görüntüleme

### 1. Firestore Database
```
https://console.firebase.google.com/project/cazi-app/firestore
```

**Göreceğiniz Koleksiyonlar:**
- `foods` - Yemek verileri
- `orders` - Sipariş verileri  
- `reviews` - Yorum ve değerlendirmeler
- `chats` - Sohbet odaları
- `messages` - Chat mesajları
- `users` - Kullanıcı profilleri

### 2. Authentication
```
https://console.firebase.google.com/project/cazi-app/authentication
```
- Kayıtlı kullanıcıları görün
- Kullanıcı detaylarını inceleyin

### 3. Storage
```
https://console.firebase.google.com/project/cazi-app/storage
```
- Yüklenen yemek fotoğrafları
- Kullanıcı profil resimleri

### 4. Cloud Messaging
```
https://console.firebase.google.com/project/cazi-app/messaging
```
- Push notification gönderme
- Bildirim istatistikleri

## 📱 Telefondan Test Etme

### Expo Go ile Test
1. **Expo Go Uygulamasını İndirin**
   - iOS: App Store'dan "Expo Go"
   - Android: Play Store'dan "Expo Go"

2. **QR Kod ile Bağlanın**
   ```bash
   cd /Users/ismetkarakus/Desktop/cazi
   npx expo start
   ```
   - Terminal'de çıkan QR kodu telefonunuzla tarayın

### Fiziksel Cihazda Test Etme

#### iOS için:
```bash
# Development build oluştur
npx expo run:ios --device

# Veya Expo Go kullan
npx expo start --ios
```

#### Android için:
```bash
# Development build oluştur  
npx expo run:android --device

# Veya Expo Go kullan
npx expo start --android
```

## 🧪 Test Senaryoları

### 1. Kullanıcı Kaydı Test
- Yeni hesap oluşturun
- Firebase Authentication'da kullanıcının göründüğünü kontrol edin

### 2. Yemek Ekleme Test (Satıcı)
- Satıcı hesabı ile giriş yapın
- Yeni yemek ekleyin
- Firestore'da `foods` koleksiyonunda göründüğünü kontrol edin

### 3. Sipariş Verme Test
- Alıcı hesabı ile yemek sipariş edin
- Firestore'da `orders` koleksiyonunu kontrol edin
- Chat otomatik oluşturuldu mu kontrol edin

### 4. Chat Test
- İki farklı hesapla mesajlaşın
- Firestore'da `messages` koleksiyonunu kontrol edin
- Real-time güncellemeleri test edin

### 5. Review Test
- Yemek için yorum yazın
- Firestore'da `reviews` koleksiyonunu kontrol edin
- Rating ortalamasının güncellendiğini kontrol edin

### 6. Push Notification Test
- Sipariş durumu değiştirin
- Bildirim geldi mi kontrol edin

## 🔍 Firebase Console'da Veri Filtreleme

### Firestore Sorguları
```javascript
// Belirli kullanıcının siparişleri
orders where buyerId == "USER_ID"

// Belirli yemeğin yorumları  
reviews where foodId == "FOOD_ID"

// Aktif chatler
chats where isActive == true

// Yüksek puanlı yemekler
foods where rating >= 4
```

## 📊 Real-time Veri İzleme

### 1. Firestore Real-time Listener
- Console'da koleksiyonları açık tutun
- Uygulamada değişiklik yapın
- Otomatik güncellenmeyi izleyin

### 2. Network Tab (Chrome DevTools)
```bash
# Web versiyonu için
npx expo start --web
```
- Chrome DevTools > Network tab
- Firebase API çağrılarını izleyin

## 🚨 Hata Ayıklama

### 1. Console Logları
```bash
# Expo logs
npx expo start
# Sonra 'j' tuşuna basın (DevTools açmak için)
```

### 2. Firebase Debug Mode
```javascript
// firebase.ts dosyasına ekleyin
import { connectFirestoreEmulator } from 'firebase/firestore';

// Development modunda emulator kullan
if (__DEV__) {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

### 3. Network İzleme
```bash
# Flipper ile network izleme (React Native için)
npx react-native log-ios
npx react-native log-android
```

## 📈 Performans İzleme

### Firebase Performance Monitoring
```bash
# Performance monitoring ekle
npm install @react-native-firebase/perf

# app.json'a ekle
"plugins": [
  "@react-native-firebase/perf"
]
```

## 🔐 Güvenlik Kuralları Test

### Firestore Rules Test
```javascript
// Firebase Console > Firestore > Rules > Simulator
// Test senaryoları:

// 1. Kullanıcı kendi verilerini okuyabilir mi?
// 2. Başka kullanıcının verilerini değiştirebilir mi?
// 3. Anonim kullanıcı veri ekleyebilir mi?
```

## 📱 Cihaz Özellikleri Test

### 1. Kamera Test
- Yemek fotoğrafı ekleme
- Profil fotoğrafı çekme

### 2. Konum Test  
- Teslimat mesafesi hesaplama
- Yakındaki yemekler

### 3. Push Notification Test
- Bildirim izinleri
- Foreground/Background bildirimleri
- Bildirim tıklama navigasyonu

## 🎯 Test Checklist

### ✅ Temel Fonksiyonlar
- [ ] Kullanıcı kaydı/girişi
- [ ] Yemek listeleme
- [ ] Sipariş verme
- [ ] Chat sistemi
- [ ] Push notifications
- [ ] Ödeme sistemi

### ✅ Firebase Entegrasyonu
- [ ] Firestore CRUD işlemleri
- [ ] Authentication
- [ ] Storage (resim yükleme)
- [ ] Cloud Messaging
- [ ] Real-time listeners

### ✅ UI/UX
- [ ] Responsive tasarım
- [ ] Dark/Light mode
- [ ] Loading states
- [ ] Error handling
- [ ] Navigation flow

## 🚀 Production Hazırlık

### 1. Environment Variables
```bash
# .env dosyası oluştur
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=cazi-app.firebaseapp.com
FIREBASE_PROJECT_ID=cazi-app
```

### 2. Build Test
```bash
# iOS build
npx expo build:ios

# Android build  
npx expo build:android
```

### 3. App Store/Play Store Test
- TestFlight (iOS) veya Internal Testing (Android)
- Beta kullanıcılarla test

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Expo logs kontrol edin
2. Firebase Console error logs
3. Chrome DevTools Network tab
4. React Native Debugger

Bu rehberi takip ederek uygulamanızı kapsamlı şekilde test edebilirsiniz! 🎉

