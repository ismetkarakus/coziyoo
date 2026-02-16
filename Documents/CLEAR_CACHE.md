# Test İçin Cache Temizleme

## Uygulamayı Sıfırla (Test için)

```bash
# 1. Metro cache temizle
npx expo start --clear

# 2. AsyncStorage temizle (simulator/device'da)
# Settings > Apps > Expo Go > Storage > Clear Data

# 3. Node modules temizle (gerekirse)
rm -rf node_modules && npm install
```

## Test Senaryoları

### 1. İlk Açılış Testi
- Uygulamayı sil ve tekrar yükle
- Otomatik Türkiye seçilmeli
- Herşey Türkçe olmalı

### 2. Dil Değişikliği Testi  
- TopBar'da 🇹🇷 butonuna tıkla
- UK seçince İngilizce'ye geçmeli
- Para birimi £ olmalı

### 3. Business Compliance Testi
- UK seçince compliance zorunlu olmalı
- TR'de opsiyonel olmalı