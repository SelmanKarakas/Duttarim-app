# Versiyonlu eserler ve animasyonlu açılış

## Kullanım
1. Uygulamadaki nota yönetiminde veya `npm run admin` ile açılan yerel panelde **Nota yapısı → Çok versiyonlu eser** seçin.
2. İlk kayıt için grup kimliği (ör. `talka-tagliri`), grubun Latin/Uygurca adı ve versiyon seviyesini girin.
3. O çalınıma ait nota sayfalarını yükleyin, düzenini ve temposunu seçip kaydedin/yayınlayın.
4. Sonraki kayıt için aynı eser grubunu seçin. Uygulama içindeki mevcut kayıtlar listesinde **Versiyon ekle** düğmesi de bulunur; bu düğme sonraki seviyeyi önerir ve yeni nota dosyalarını bekler.
5. Normal eserleri düzenlerken Nota yapısı seçimiyle gruba dahil edebilirsiniz. Tek notaya geri dönüldüğünde kolay/orta/zor seçimi yeniden açılır.

Yerel panelde grup kayıt kimliği otomatik olarak `grup-kimligi-level-N` olur. Mevcut kaydın kimliği değişmez. Her versiyon bağımsız tempo, düzen, sayfalar ve favori durumuna sahiptir.

## Kütüphane
- Tümü sekmesinde aynı gruba ait kayıtlar bir katmanlı kart altında toplanır.
- Karta dokununca sayısal seviyeye göre sıralanan versiyonlar açılır. Nota ekranından geri dönünce açılmış grup korunur.
- Versiyonlu eserler kolay/orta/zor gruplarına dahil edilmez.
- Favoriler yalnız favorilenen versiyonları gösterir.
- Rozet kalbin hemen solundadır: Türkçe `1.sv`, İngilizce `1.lvl`, Uygurca `1-د`; erişilebilir etiketi tam seviye adını içerir. RTL dilinde yerleşim okuma yönüne uyarlanır.
- 1: koyu yeşil, 2: açık/olive yeşil, 3: amber, 4: turuncu, 5+: mor. Beşten fazla versiyon desteklenir; numara ayrımı her zaman korunur.
- Örnek/test notaları gerçek kataloğa eklenmedi.

## Veri modeli
Her kayıt mevcut düz katalog yapısını korur; isteğe bağlı `versionGroup: {id, title: {latin, ug}}` ve pozitif tam sayı `versionLevel` alanları eklenmiştir. Versiyon kaydı `difficulty` taşımaz. Aynı grup ve seviye kombinasyonu tekrar edemez. Grup adları aynı gruptaki kayıtlarda tutarlı olmalıdır. Grup adını topluca değiştirmek için tüm ilgili kayıtların güncellenmesi gerekir.

Ortak doğrulama: `www/score-versions.js`. Hem yerel sunucu, hem uygulama, hem Worker aynı kuralları kullanır. Worker kaynakları güncellendi ve paketlendi; uzaktaki Worker bu çalışma sırasında deploy edilmedi. Mevcut yayın servisi bilinmeyen alanları koruduğundan yeni katalog alanlarını taşıyabilir; sunucu tarafındaki ilave grup doğrulamalarını etkinleştirmek için yeni Worker sürümü deploy edilmelidir.

## Açılış
Önceki statik Android splash görseli kullanılır; ek WebView açılış animasyonu kaldırılmıştır.

## Kontroller
- `npm test`: sözdizimi ve mevcut kataloglar.
- `npm run test:versions`: model kuralları ve geçici katalogdaki yerel kayıt/düzenleme testleri.
- `npm run test:ui:versions`: Chrome/Playwright ile katman açma, filtreler, favoriler, TR/EN/UG, dar ekran/tablet, koyu tema, uygulama içi yayın payload'u (sahte API), azaltılmış hareket.
- Android: `android/gradlew.bat :app:assembleDebug`.

Android Studio derlemesi web dosyalarını otomatik kopyalar. Bu değişiklikler yeni Capacitor eklentisi eklemez; ekstra `cap sync` gerektirmez.
