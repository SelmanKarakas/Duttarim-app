# Duttarim — ikinci sürüm çalışmaları

5 Kasım 2026. Bu döküm mevcut kaynaklar, Git geçmişi ve çalışma kayıtlarından hazırlanmıştır. “Sürüm 2” burada ikinci geliştirme paketini anlatır; mağaza sürüm adı Android ve iOS projelerinde hâlâ **1.1**, Android versionCode **8** olarak kayıtlıdır. Bu işlem sürüm numarasını değiştirmez veya mağazaya yayın yapmaz.

## Bu hazırlıkta geri alınan görseller

- Akort ekranındaki `www/dutar-head.png` ve perdeler ekranındaki `www/TamDuttar.png`, desen değiştirme çalışmalarından önceki orijinal dosyalara döndürüldü.
- Android kaynağı: `474142a`; iOS kaynağı: `d68fe6a`. İki depodaki özgün dosyaların Git içerik kimlikleri aynı.
- Tel parlamasının SVG yolları ve 2 px konum düzeltmesi eski baş görseline yeniden hizalandı. Parlama animasyonu korunuyor.
- Son üretilen nakışlı/yeniden oranlanmış dutar denemeleri uygulamaya eklenmedi.
- Splash, uygulama ikonu ve etles arka planları bu geri almanın kapsamı dışında; mevcut sürümdeki hâlleri korunuyor.

## Akort ekranı

- Düzen adları Türkçe Küçük düzen / Büyük düzen, İngilizce Small Tuning / Big Tuning ve Uygurca karşılıklarıyla güncellendi.
- Akort seçenekleri, mikrofon düğmesi, orta kart ve görsel arasındaki genişlik, yükseklik ve boşluklar telefon/tablet düzenine göre ayarlandı.
- Nota ve Hazır yazılarının konumu, mikrofon düğmesinin alt gezinmeye uzaklığı ve küçük ekran yerleşimi düzeltildi.
- Pes / doğru / tiz renklerinin anlamı korunarak koyu tema tonları düzenlendi; merkez hedef işareti belirginleştirildi.
- Seçilen tel ve burma sarımları üzerinde nefes alan parlama animasyonu eklendi.
- Baş görselinin arkasındaki koyu tema ışığı azaltıldı ve konumu ayarlandı.
- Akort onay kartları açık/koyu temaya uygun renklere bağlandı; koyu temada beyaza dönme sorunu giderildi.
- Akort tamamlanınca çizilerek çıkan sivri onay işareti ve ses geri bildirimi eklendi; animasyon hızlandırıldı ve ses seviyesi artırıldı.
- Tel kartlarındaki gereksiz yuvarlak/tik alanı kaldırıldı. Dinle yazısı hoparlör simgesine dönüştürüldü; erişilebilir düğme adı korundu.
- iOS referans sesi, kayıt başlamadan veya durduktan sonra da çalışacak ses oturumu düzenlemesini içeriyor.

## Eserler ve kütüphane

- Eser bilgisine kaynak, Başlangıç / Orta / İleri seviyesi ve Küçük / Büyük düzen bilgisi eklendi.
- Bu alanlar Türkçe, İngilizce ve Uygurca arayüz diline göre gösteriliyor.
- Parçalar ve Alıştırmalar için seviye sıralaması ve seviye filtreleri eklendi; filtre düğmeleri genişletildi.
- Favoriler bölümüne kalp simgesi ve kartlara dolu/boş favori durumu eklendi.
- Eser simgeleri klasik nota görünümünde tutuldu; seviyeye göre yeşil, amber/turuncu ve mor renkler kullanılıyor.
- Boş sonuç ekranları ve “Parçaları keşfet” eylemi eklendi; bu eylem Tümü bölümünü açıyor.
- Karıştır düğmesi, Keşfet sayacı ve Kolaydan zora başlık/sayaçları kaldırıldı.
- Bilgi belirtilmeyen seviyenin kullanıcıya görünen metni Tümü / All ve Uygurca karşılığına çevrildi.
- Kütüphane kartları daha kompakt hâle getirildi; yazı boyutları ve okunabilirlik ayarlandı.
- İlk kurulumda başlangıç kataloğunun “20 nota eklendi” benzeri bir güncelleme bildirimi oluşturması kaldırıldı.

## Bir eserin farklı çalınımları

- Aynı eserin birden fazla seviyedeki notası tek katmanlı kart altında gruplanabiliyor; üç veya beş kayıtla sınırlı değil.
- Grup kartına dokununca alt versiyonlar animasyonla açılıyor; nota ekranından dönünce açılmış grup korunuyor.
- Sayısal seviye rozeti kalbin yanında TR `1.sv`, EN `1.lvl` ve Uygurca karşılığıyla gösteriliyor.
- Seviyeler yeşil tonları, amber/turuncu ve 5+ için mor renk ailesiyle ayrılıyor; numaralar da gösteriliyor.
- Versiyonlu eserler Tümü içinde bulunuyor; normal Başlangıç / Orta / İleri gruplarına karışmıyor. Ayrı Versiyonlar sekmesi kaldırıldı.
- Her çalınımın nota sayfaları, temposu, düzeni ve favori durumu bağımsız tutuluyor.

## Nota yönetimi ve görüntüleyici

- Uygulama içindeki editöre ve yerel yönetim paneline Türkçe seviye/düzen seçenekleri eklendi.
- Versiyon grubu, grup adı, versiyon seviyesi ve Versiyon ekle işlemi eklendi.
- Tekrarlanan grup/seviye, geçersiz değerler ve eksik alanlar için doğrulama eklendi. Mevcut dosyaları tekrar yüklemeden metadata düzenleme destekleniyor.
- Normal/sadeleştirilmiş görünüm, sayfa geçişi ve yakınlaştırma kontrol kartları kompaktlaştırıldı; simge ve yüzde yazısı boyutları ayarlandı.
- Tam ekran düğmesi, açıkken tam ekrandan çıkış simgesine ve uygun erişilebilir etikete dönüşüyor.

## Tema, ayarlar ve genel kullanım

- Sistem / Açık / Koyu tema seçimi, tercih saklama ve sistem tema değişimini izleme eklendi; iOS yerel görünüm eşlemesi düzeltildi.
- Koyu moda uygun etles arka planı eklendi; iki temadaki desen görünürlüğü ayarlandı.
- Ayar düğmeleri kompaktlaştırıldı, seçili yeşil dolgular hafifletildi; ayar/kütüphane/nota yazı boyutları gözden geçirildi.
- About bölümünün font hiyerarşisi, Duttarim başlığının boyutu, Privacy Policy ve Feedback yazıları ve alt çizgi aralıkları düzenlendi.
- Dokunma/basılma görsel geri bildirimi ve desteklenen cihazlarda isteğe bağlı hafif titreşim eklendi.
- Hareket azaltma tercihi ve klavye odak işaretleri destekleniyor.
- Arayüz yazılarının seçilmesi ve çift dokunmayla tarayıcı yakınlaştırması engellendi; editör giriş alanları yazı düzenlemek için istisna tutuldu.

## Telefon/tablet düzeni ve perdeler

- Telefon ve tablet genişlikleri için responsive yerleşim, kartlar ve yazı boyutları düzenlendi.
- Alt gezinme ile içerik arasındaki gereksiz boşluk giderildi; devamında son içeriğin çubuğun altında kalmasını önlemek için güvenli alan ve kaydırma hesabı düzeltildi.
- Ayarların sonundaki Privacy Policy / Feedback bağlantılarına erişim ve perdeler sayfasının alt alanı için düzenlemeler yapıldı.
- Perdelerde nota kartları büyütüldü; nota bağlantı çizgileri dutar görselinin arkasına alındı.
- Genel kullanım dikey; tam ekran nota görünümünde yatay kullanım istisnası bulunuyor. Büyük ekranlarda platformun yön politikası ayrıca cihazda kontrol edilmelidir.

## Android / iOS ve dağıtım altyapısı

- Android geliştirme temeli temizlendi; Android Studio derlemesi web dosyalarını otomatik kopyalayacak şekilde bağlandı. Eklenti/yapılandırma değişikliklerinde Capacitor sync yine gerekir.
- Android sürüm adı 1.1 ve versionCode 8 hazırlığı yapıldı.
- Güncel uygulama iOS deposuna taşındı; yerel ses/mikrofon köprüsü ve mikrofon açıklaması eklendi/düzeltildi.
- iOS ilk açılışında yerel mikrofon iznini dil seçiminden önce isteme, izin durumunu kontrol etme ve bekleyen izni tekrar değerlendirme akışı eklendi.
- Mikrofon izin yöntemlerinin Capacitor'a aktarılmaması düzeltildi; uygulama ayarlarını açma desteği bulunuyor.
- Codemagic üzerinde macOS derlemesi, imzalama, benzersiz build numarası ve IPA üretimi için iş akışı hazırlandı. Mevcut YAML'da otomatik TestFlight ve App Store gönderimi kapalıdır.
- Açık/koyu splash görselleri ve ikon kaynakları hazırlandı. Sonradan tarif edilen alttan yükselip zıplayan/fade olan yeni splash animasyonu uygulanmadı.

## Doğrulama ve kapsam sınırları

- Önceki çalışmalarda katalog, versiyon modeli, arayüz, dil, tema ve farklı ekran boyutu kontrolleri yapıldı; ayrıntılı test dosyaları ilgili depoların tools klasöründedir.
- 19 Ekim'de Android emülatöründe FPS/rAF, geciken kare ve bellek incelemesi yapıldı. Bu bir ölçüm çalışmasıydı; performans artışı sağlandığı veya güncel release sürümünün aynı sonuçları vereceği iddia edilmiyor.
- Uygurca metinler eklendi; adı geçen “ewlat” kaynağına göre doğrulama tamamlanmış sayılmaz.
- Worker tarafında yeni grup doğrulaması kaynakta var; önceki çalışma kayıtlarında canlı Worker deploy'u yapılmadığı belirtiliyor.
- Bu commit mağaza yayını, yeni AAB/IPA üretimi veya gerçek cihazdaki mikrofon/akort doğruluğu testi değildir.
