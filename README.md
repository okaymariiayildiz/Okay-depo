# Tarihi Yarımada Quest

150 kişilik (10 takım × 15 kişi) şehir quest'i için, telefonda çalışan Türkçe web sitesi.
Sadece HTML/CSS/JS; derleme veya sunucu gerekmez.

## Dosyalar
| Dosya | Görev |
|---|---|
| `index.html`, `app.js` | Takım seçimi, sayaç, istasyonlar, kod girişi |
| `skor.html`, `skor.js` | Puan tablosu |
| `common.js`, `style.css` | Ortak kod ve tasarım |
| `data.json` | **Düzenlediğiniz tek dosya:** istasyonlar, kodlar, rotalar, süre |

## data.json'u düzenleme
- `istasyonlar`: her istasyonun `ad`, `gorev` (açıklama) ve `kod` (yetkilinin vereceği kod) alanı var. Yeni istasyon eklemek için yeni bir anahtar ekleyin.
- `rotalar`: `"1"`'den `"10"`'a her takımın istasyon sırası (istasyon anahtarlarıyla). Takım sayısını rota ekleyip çıkararak değiştirebilirsiniz.
- `konum`: istasyonun Google Maps bağlantısı. Maps'te yeri açın → **Paylaş → Bağlantıyı kopyala** → `"konum": "https://maps.app.goo.gl/..."` içine yapıştırın. Doluysa istasyonda **📍 Konuma git** butonu çıkar, boşsa buton görünmez. Bitiş noktası için `etkinlik.baslangic_bitis_konum` alanı vardır.
- `kod`: yetkilinin görevi tamamlayan takıma söylediği şifre.
- `etkinlik`: ad, başlangıç/bitiş noktası, `sure_dakika` (varsayılan 150).
- Kodlar büyük/küçük harfe ve boşluğa duyarsızdır.

> ⚠️ Kodlar `data.json` içinde açık yazıldığı için meraklı bir katılımcı dosyayı açıp görebilir. Bu, sunucusuz sitenin sınırıdır. Gizli kalması şartsa bir sunucu gerekir.

## GitHub Pages'te yayınlama
1. Bu klasördeki dosyaları GitHub deposunun **ana dalına (main)** alın (PR'ı birleştirin).
2. Depoda **Settings → Pages** sayfasına gidin.
3. **Build and deployment → Source: Deploy from a branch** seçin.
4. **Branch: main**, klasör **/ (root)** seçip **Save**'e basın.
5. 1–2 dakika sonra adres görünür: `https://KULLANICI-ADI.github.io/Okay-depo/`
6. Bu adresi (veya QR kodunu) katılımcılara verin. Puan tablosu: `.../skor.html`
7. `data.json`'u GitHub'da düzenleyip kaydederseniz site birkaç dakika içinde güncellenir.

## Puan tablosunun tüm telefonlarda çalışması (önemli)
Sunucusuz sitede her telefon yalnızca kendi verisini bilir. Takımların birbirini görmesi için ücretsiz bir ortak veritabanı kullanılır:

1. https://console.firebase.google.com adresinde proje oluşturun (Analytics gerekmez).
2. **Build → Realtime Database → Create Database** (test modu).
3. **Rules** sekmesine şunu yapıştırıp **Publish** edin (etkinlik için herkese açık; etkinlikten sonra kapatın):
   ```json
   { "rules": { ".read": true, ".write": true } }
   ```
4. Veritabanının adresini (`https://....firebasedatabase.app`) kopyalayıp `data.json` içinde `"senkron_url"` alanına yazın.

Adres boş bırakılırsa site yine çalışır; tablo yalnızca o telefondaki takımı gösterir.
Veritabanına yalnızca takım numarası, biten istasyon sayısı ve zaman damgaları gider.

## Yeni etkinlik öncesi sıfırlama
- Telefonlarda: tarayıcı site verilerini silin veya "Takımı değiştir"e basın.
- Ortak veritabanında: Firebase konsolunda `takimlar` düğümünü silin.
