# Trello Entegrasyonlu Todo Uygulaması

## Proje Özeti

Modern, full-stack todo yönetim uygulaması. Kullanıcılar todo'larını hem web arayüzünde hem de Trello board'larında yönetebilir.

## Teknoloji Stack'i

### Frontend
- **Vue.js 3** - Modern JavaScript framework
- **Vue Router** - Sayfa yönlendirme
- **Vue I18n** - Çoklu dil desteği (TR/EN)
- **SCSS** - Gelişmiş CSS
- **Vite** - Hızlı build tool

### Backend
- **Fastify** - Yüksek performanslı web framework
- **Knex.js** - SQL query builder ve migration sistemi
- **MySQL** - Veritabanı
- **Sharp** - Resim işleme
- **Multer** - Dosya yükleme

### Entegrasyonlar
- **Trello API** - Card oluşturma ve senkronizasyon
- **File Upload** - Resim yükleme ve attachment

## Özellikler

### ✅ Temel İşlevler
- Todo oluşturma, düzenleme, silme
- Kategori bazlı organizasyon
- Önem derecesi belirleme (Yüksek/Orta/Düşük)
- Durum takibi (Aktif/Tamamlandı)

### 📸 Gelişmiş Özellikler
- Resim yükleme ve görüntüleme
- Otomatik resim boyutlandırma
- Çoklu dil desteği (Türkçe/İngilizce)
- Responsive tasarım

### 🔄 Trello Entegrasyonu
- Otomatik card oluşturma
- Resim attachment yükleme
- Label senkronizasyonu (önem derecesine göre)
- İki yönlü veri senkronizasyonu

## Teknik Detaylar

### Veritabanı Tasarımı
- **Categories tablosu**: Kategori yönetimi
- **Todos tablosu**: Todo verilerini ve Trello referanslarını saklama
- **Migration sistemi**: Veritabanı versiyonlama
- **Seeding**: İlk veri yükleme

### API Endpoints
```
GET /api/todos - Todo listesi (pagination, filtreleme)
POST /api/todos - Yeni todo oluşturma
PUT /api/todos/:id - Todo güncelleme
DELETE /api/todos/:id - Todo silme
PATCH /api/todos/:id/status - Durum güncelleme
GET /api/categories - Kategori listesi
```

### Güvenlik
- Environment variables ile API key yönetimi
- File upload validasyonu
- SQL injection koruması (Knex.js)
- CORS politikaları

## Kurulum

### Gereksinimler
- Node.js (v16+)
- MySQL (v8.0+)
- npm/yarn

### Adımlar
1. Proje dosyalarını indirin
2. Backend bağımlılıklarını kurun: `cd server && npm install`
3. Frontend bağımlılıklarını kurun: `cd client && npm install`
4. MySQL veritabanı oluşturun: `CREATE DATABASE trello_todo_db`
5. `.env` dosyasını yapılandırın (server/env.example'dan kopyalayın)
6. Veritabanı migration'larını çalıştırın: `npm run migrate`
7. Seed verilerini yükleyin: `npm run seed`
8. Backend'i başlatın: `cd server && npm start`
9. Frontend'i başlatın: `cd client && npm run dev`

### Trello Entegrasyonu
1. https://trello.com/app-key adresinden API key alın
2. Token oluşturun
3. Board ve List ID'lerini belirleyin
4. `.env` dosyasında yapılandırın

## Ekran Görüntüleri

- Todo listesi
- Todo oluşturma formu
- Kategori yönetimi
- Trello entegrasyonu
- Çoklu dil desteği

## Geliştirici Notları

### Proje Yapısı
```
├── client/          # Vue.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── locales/
│   │   └── router/
├── server/          # Fastify backend
│   ├── routes/      # API endpoint'leri
│   ├── services/    # İş mantığı
│   ├── migrations/  # Veritabanı yapısı
│   └── config/      # Yapılandırma
```

### Öğrenilen Teknolojiler
- Modern JavaScript (ES6+)
- Vue.js 3 Composition API
- RESTful API tasarımı
- Veritabanı migration sistemleri
- Third-party API entegrasyonu
- File upload handling
- Internationalization (i18n)

## Sonuç

Bu proje, modern web geliştirme teknolojilerini kullanarak kapsamlı bir todo yönetim sistemi geliştirme deneyimi sağladı. Özellikle Trello API entegrasyonu ile external servislere bağlanma, resim upload işlemleri ve çoklu dil desteği gibi gerçek dünya problemleriyle karşılaşma fırsatı buldum.

---
**Geliştirici**: [Adınız]  
**Staj Dönemi**: [Tarih]  
**Proje Süresi**: [X hafta]
