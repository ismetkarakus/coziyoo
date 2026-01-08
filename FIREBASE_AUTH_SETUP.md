# 🔥 Firebase Authentication Kurulum Rehberi

## ❌ SORUN: auth/configuration-not-found

Bu hata Firebase Authentication'ın henüz kurulmadığını gösterir.

## ✅ ÇÖZÜM ADIMLARI:

### 1. Firebase Console'a Gidin
```
https://console.firebase.google.com/project/cazi-app/authentication
```

### 2. Authentication'ı Etkinleştirin

**DURUM A: "Get started" butonu görüyorsanız**
- ✅ "Get started" butonuna tıklayın
- ✅ Kurulum tamamlanana kadar bekleyin (1-2 dakika)

**DURUM B: Authentication zaten kuruluysa**
- ✅ "Sign-in method" sekmesine gidin
- ✅ "Email/Password" satırına tıklayın
- ✅ "Enable" toggle'ını açın
- ✅ "Save" butonuna tıklayın

### 3. Test Kullanıcısı Ekleyin

Authentication kurulduktan sonra:
- ✅ "Users" sekmesine gidin
- ✅ "Add user" butonuna tıklayın
- ✅ Email: `test@cazi.com`
- ✅ Password: `123456`
- ✅ "Add user" tıklayın

### 4. Doğrulama

Authentication kurulumu tamamlandıktan sonra:
- ✅ Uygulamayı yeniden başlatın
- ✅ test@cazi.com / 123456 ile giriş yapın

## 📱 Test Bilgileri:
- **Email:** test@cazi.com
- **Password:** 123456

## 🔍 Kontrol Listesi:
- [ ] Firebase Console'da Authentication kuruldu
- [ ] Email/Password etkinleştirildi
- [ ] Test kullanıcısı eklendi
- [ ] Uygulama yeniden başlatıldı
- [ ] Giriş testi yapıldı

---
**NOT:** Bu adımlar tamamlanmadan uygulama çalışmayacaktır!









