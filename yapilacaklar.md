

ana menu mesaj hedefi ayarlanacak
c butonuna sayfa yapilacak
profil sayfasi icin ana menude bir yere ikon konacak
profildeki mesaja tikladigimizda mesajlar neyin nesi
mesaj bolumu duzenlenecek sbit texti ekleyecegiz
satici ve alici direk mesjlasamayacak ordr bazli mesajlasacak
[ ]iki bilsirim sistemi ollacak biri order bildirimi digeri sistem bikdirimi

[ ] yemek katagorisi menusunu biraz assagi alalim
[x] notification allergen uyarisindan sonra gelsin
kalan urun sayisi 0 sa mantik kurgula

ana menudeki mesajlarimi degistirip siparislerim yapiyoruz acilan sayfada su anki adi musteri mesajlari olan sayfayi kullanacagiz
her bir siparis tiklandiginda bu siparisle ilgili mesajlara gider
siparisle ilgili bildirinm geldiginde tiklanildiginda o siparisle ilgili mesaj sayfasi acilicak
[ ] alici ve satici mesazlasma sayfasindan neden tabottombar ve ana yemek sayfasindan bobottombar daki mesaj ikonu ne ise yariyor bunu bildirim olarakmi kullanacagiz

[ AYHANA SOR ] 
Bunu “tek kullanıcı = tek telefon” modelinden çıkarıp “tek satıcı hesabı = çoklu cihaz + rol” modeline geçerek çözersin.

Pratik model:
1. `store account` sabit cihazda açık kalır (evdeki eş).
2. `courier companion` ayrı giriş/rol olur (dışarı çıkan eş).
3. Sipariş nesnesinde iki alan tut:
   - `kitchen_assignee` (hazırlık)
   - `delivery_assignee` (teslimat)
4. Evdeki kişi siparişi onaylar/hazırlar.
5. Dışarıdaki kişi sadece teslimat durumlarını günceller (`Yola çıktı`, `Teslim edildi`).
6. Alıcı tarafı sipariş timeline’ından anlık görür.
7. Yetki sınırı koy:
   - companion fiyat/iptal/değişiklik yapamasın
   - sadece teslimat adımları ve konum güncellemesi.
8. Cihaz bağımlılığını kaldır:
   - Web panel (evde tablet/laptop)
   - Mobil companion (kurye eş)
9. Güvenlik:
   - companion için kısa oturum + PIN
   - teslimat OTP kodu.

MVP önerisi (en hızlı):
- Aynı satıcı hesabının 2 cihazda eşzamanlı açık kalmasına izin ver.
- Sadece sipariş durum adımları ve bildirimlerle ilerle.
- Sonraki adımda rol bazlı companion hesabı ekle.