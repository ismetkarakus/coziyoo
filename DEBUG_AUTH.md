# 🔐 Authentication Debug Rehberi

## 🚨 Giriş Yapamama Sorunu Çözümleri

### 1. Firebase Console Kontrolleri

#### A. Authentication Etkin mi?
```
https://console.firebase.google.com/project/cazi-app/authentication
```
- **Sign-in method** sekmesine gidin
- **Email/Password** etkin mi kontrol edin
- Eğer devre dışıysa **Enable** edin

#### B. Kullanıcı Var mı?
- **Users** sekmesinde kayıtlı kullanıcıları görün
- Eğer yoksa yeni kullanıcı oluşturun

### 2. Test Hesabı Oluşturma

#### Yöntem A: Uygulama İçinden
1. **"Kayıt Ol"** butonuna tıklayın
2. **"Alıcı"** seçin
3. Test bilgileri:
   ```
   Ad Soyad: Test Kullanıcı
   E-posta: test@cazi.com
   Şifre: 123456
   Telefon: 05551234567
   Konum: İstanbul
   ```

#### Yöntem B: Firebase Console'dan
1. Authentication > Users > **Add user**
2. Email: `test@cazi.com`
3. Password: `123456`

### 3. Yaygın Sorunlar ve Çözümleri

#### Sorun 1: "Invalid credential" Hatası
**Çözüm:**
- E-posta ve şifre doğru mu kontrol edin
- Önce kayıt olduğunuzdan emin olun
- Firebase Console'da kullanıcının var olduğunu kontrol edin

#### Sorun 2: "Network request failed"
**Çözüm:**
- İnternet bağlantınızı kontrol edin
- Firebase API key'lerinin doğru olduğunu kontrol edin

#### Sorun 3: "Too many requests"
**Çözüm:**
- 15 dakika bekleyin
- Farklı e-posta adresi deneyin

### 4. Debug Adımları

#### Adım 1: Console Loglarını Kontrol Edin
```bash
# Expo DevTools açın
npx expo start
# Sonra 'j' tuşuna basın
```

#### Adım 2: Firebase Console'da Real-time İzleme
- Authentication > Users sekmesini açık tutun
- Giriş yapmayı deneyin
- Kullanıcı listesinde değişiklik olup olmadığını kontrol edin

#### Adım 3: Network İzleme
- Chrome DevTools > Network tab
- Firebase API çağrılarını izleyin

### 5. Test Senaryoları

#### Test 1: Yeni Kayıt
1. Kayıt ol sayfasına gidin
2. Yeni e-posta ile kayıt olun
3. Firebase Console'da kullanıcının oluştuğunu kontrol edin

#### Test 2: Mevcut Kullanıcı Girişi
1. Firebase Console'dan test kullanıcısı oluşturun
2. Uygulamada aynı bilgilerle giriş yapmayı deneyin

#### Test 3: Hatalı Bilgiler
1. Yanlış şifre ile giriş yapmayı deneyin
2. Hata mesajının görüntülendiğini kontrol edin

### 6. Firebase Konfigürasyon Kontrol

#### firebase.ts Dosyası Kontrol
```javascript
// Bu bilgiler doğru mu?
const firebaseConfig = {
  apiKey: "AIzaSyBC1QUk6--ah0V1YfcnN3B7fU7r7D8nKpk",
  authDomain: "cazi-app.firebaseapp.com",
  projectId: "cazi-app",
  // ...
};
```

#### Firebase Console'da Proje Ayarları
```
Project Settings > General > Your apps
```
- Web app konfigürasyonunu kontrol edin
- API key'lerin eşleştiğini kontrol edin

### 7. Hızlı Test Komutu

```bash
# Uygulamayı temiz başlatın
cd /Users/ismetkarakus/Desktop/cazi
npx expo start --clear --port 8082
```

### 8. Acil Durum Test Hesabı

Eğer hiçbir şey çalışmıyorsa:

```
E-posta: admin@cazi.com
Şifre: admin123
```

Bu hesabı Firebase Console'dan manuel oluşturun.

## 🎯 Adım Adım Çözüm

1. **Firebase Console'a gidin** → Authentication etkin mi?
2. **Test hesabı oluşturun** → Console'dan manuel
3. **Uygulamayı yeniden başlatın** → Cache temizle
4. **Debug loglarını kontrol edin** → Console'da hata var mı?
5. **Network bağlantısını test edin** → API çağrıları gidiyor mu?

Bu adımları takip ederek sorunu çözebilirsiniz! 🚀
