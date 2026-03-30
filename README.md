## Proje Yapısı

```
nextjs-nestjs-demo/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx   ← tüm UI ve fetch mantığı
│   │   └── globals.css
│   ├── package.json
│   └── tsconfig.json
│
└── backend/
    ├── src/
    │   ├── main.ts
    │   ├── app.module.ts
    │   └── posts/
    │       ├── posts.module.ts
    │       ├── posts.controller.ts
    │       └── posts.service.ts
    ├── package.json
    └── tsconfig.json
```


## API Endpointleri (Nest.js)

| Method   | Endpoint       | Açıklama              |
|----------|----------------|-----------------------|
| `GET`    | `/posts`       | Tüm postları getir    |
| `POST`   | `/posts`       | Yeni post oluştur     |
| `DELETE` | `/posts/:id`   | Post sil              |

## Demo'da Neler Var?

- 🏗 **Mimari diyagram**: Browser → Next.js → Nest.js → DB akışı, gerçek zamanlı animasyonla gösterilir  
- 📡 **GET /posts**: Next.js, Nest.js API'den verileri çeker ve render eder  
- ➕ **POST /posts**: Form verisi Next.js üzerinden Nest.js'e gönderilir  
- 🗑 **DELETE /posts/:id**: Silme isteği API'ye iletilir, UI güncellenir  
- 📋 **Canlı log**: Her istek adım adım loglanır  
- 💻 **Kod görüntüleme**: `page.tsx` ve `posts.controller.ts` kodu sekme olarak gösterilir  
