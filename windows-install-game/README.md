# Windows Kurulum Simülatörü

Bu proje, Windows 10/11 kurulum sürecinin tüm kritik adımlarını eğitim amaçlı oyunlaştırılmış bir deneyim olarak sunar. Katılımcılar, kurulum ekranlarının bire bir çizimleri eşliğinde doğru seçimleri yaparak ilerler ve her adımda detaylı açıklamalarla pekiştirme sağlar.

## Özellikler

- **Adım adım ilerleme:** Önyüklemeden ilk masaüstü açılışına kadar 10 ana aşama.
- **Etkileşimli seçenekler:** Her adım için doğru/yanlış geri bildirimli seçenekler.
- **İllüstrasyonlar:** Her kurulum ekranı için özel tasarlanmış SVG çizimleri.
- **İpucu sistemi:** Zorlandığınız durumlarda ipuçlarını görüntüleyebilirsiniz.
- **Özet raporu:** Tamamlanan simülasyon sonrası skor, hata ve öğrenim maddeleri.
- **Tema desteği:** Açık ve koyu tema arasında geçiş yapılabilir.

## Dosya yapısı

```
windows-install-game/
├── index.html
├── README.md
├── assets/
│   └── illustrations/   # Kurulum ekranlarına ait SVG çizimler
├── css/
│   └── style.css        # Arayüz stilleri
├── data/
│   └── steps.js         # Simülasyon adımları ve içerikleri
└── js/
    └── app.js           # Uygulama mantığı
```

## Başlangıç

Proje tamamen statiktir. Herhangi bir HTTP sunucusu üzerinden veya doğrudan dosyayı açarak çalıştırabilirsiniz.

Yerel geliştirme için basit bir HTTP sunucusu başlatabilirsiniz:

```bash
cd windows-install-game
python3 -m http.server 8080
```

Ardından tarayıcıda `http://localhost:8080` adresine gidin.

## Lisans

Bu çalışma eğitsel amaçla hazırlanmıştır. Windows markaları Microsoft Corporation'a aittir.
