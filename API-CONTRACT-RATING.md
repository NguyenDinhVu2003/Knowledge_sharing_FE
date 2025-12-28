# API CONTRACT - RATING

Base URL: `http://localhost:8090`

Authorization: Bearer Token (thêm vào header `Authorization: Bearer {token}`)

---

## 1️⃣ Rate Document (Create/Update Rating)

**Endpoint:** `POST /api/ratings/documents/{documentId}`

**Mô tả:** Đánh giá tài liệu (1-5 sao). Nếu user đã rate rồi thì tự động update.

**Path Parameter:**
- `documentId` (Long): ID của document cần đánh giá

**Request Body:**
```json
{
  "ratingValue": 5
}
```

**Response 200 OK:**
```json
{
  "id": 1,
  "documentId": 3,
  "documentTitle": "Angular Best Practices",
  "userId": 5,
  "username": "nguyenvu12",
  "ratingValue": 5,
  "createdAt": "2025-12-28T21:30:00",
  "updatedAt": "2025-12-28T21:30:00"
}
```

**Response 400 Bad Request:**
```json
{
  "status": 400,
  "message": "Rating must be between 1 and 5",
  "timestamp": "2025-12-28T21:30:00"
}
```

**Response 404 Not Found:**
```json
{
  "status": 404,
  "message": "Document not found with id: 999",
  "timestamp": "2025-12-28T21:30:00"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:8090/api/ratings/documents/3 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ratingValue": 5}'
```

---

## 2️⃣ Update Rating

**Endpoint:** `PUT /api/ratings/documents/{documentId}`

**Mô tả:** Cập nhật rating đã có (giống POST, nhưng rõ ràng là update)

**Path Parameter:**
- `documentId` (Long): ID của document

**Request Body:**
```json
{
  "ratingValue": 4
}
```

**Response 200 OK:**
```json
{
  "id": 1,
  "documentId": 3,
  "documentTitle": "Angular Best Practices",
  "userId": 5,
  "username": "nguyenvu12",
  "ratingValue": 4,
  "createdAt": "2025-12-28T21:30:00",
  "updatedAt": "2025-12-28T21:35:00"
}
```

**CURL Example:**
```bash
curl -X PUT http://localhost:8090/api/ratings/documents/3 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ratingValue": 4}'
```

---

## 3️⃣ Delete Rating

**Endpoint:** `DELETE /api/ratings/documents/{documentId}`

**Mô tả:** Xóa rating của user hiện tại cho document

**Path Parameter:**
- `documentId` (Long): ID của document

**Request Body:** None

**Response 200 OK:**
```json
{
  "message": "Rating deleted successfully"
}
```

**Response 404 Not Found:**
```json
{
  "status": 404,
  "message": "Rating not found",
  "timestamp": "2025-12-28T21:30:00"
}
```

**CURL Example:**
```bash
curl -X DELETE http://localhost:8090/api/ratings/documents/3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 4️⃣ Get My Rating for Document

**Endpoint:** `GET /api/ratings/documents/{documentId}/my-rating`

**Mô tả:** Lấy rating của user hiện tại cho document (để hiển thị số sao đã chọn)

**Path Parameter:**
- `documentId` (Long): ID của document

**Request Body:** None

**Response 200 OK (có rating):**
```json
{
  "id": 1,
  "documentId": 3,
  "documentTitle": "Angular Best Practices",
  "userId": 5,
  "username": "nguyenvu12",
  "ratingValue": 5,
  "createdAt": "2025-12-28T21:30:00",
  "updatedAt": "2025-12-28T21:30:00"
}
```

**Response 204 No Content (chưa rate):**
```
(Empty body)
```

**CURL Example:**
```bash
curl -X GET http://localhost:8090/api/ratings/documents/3/my-rating \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 5️⃣ Get All Ratings for Document

**Endpoint:** `GET /api/ratings/documents/{documentId}`

**Mô tả:** Lấy tất cả ratings của document (để hiển thị danh sách người đánh giá)

**Path Parameter:**
- `documentId` (Long): ID của document

**Request Body:** None

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "documentId": 3,
    "documentTitle": "Angular Best Practices",
    "userId": 5,
    "username": "nguyenvu12",
    "ratingValue": 5,
    "createdAt": "2025-12-28T21:30:00",
    "updatedAt": "2025-12-28T21:30:00"
  },
  {
    "id": 2,
    "documentId": 3,
    "documentTitle": "Angular Best Practices",
    "userId": 1,
    "username": "admin",
    "ratingValue": 4,
    "createdAt": "2025-12-28T20:15:00",
    "updatedAt": "2025-12-28T20:15:00"
  }
]
```

**CURL Example:**
```bash
curl -X GET http://localhost:8090/api/ratings/documents/3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 6️⃣ Get Rating Statistics

**Endpoint:** `GET /api/ratings/documents/{documentId}/stats`

**Mô tả:** Lấy thống kê rating cho document (trung bình, số lượng theo sao)

**Path Parameter:**
- `documentId` (Long): ID của document

**Request Body:** None

**Response 200 OK:**
```json
{
  "documentId": 3,
  "averageRating": 4.5,
  "totalRatings": 10,
  "fiveStars": 6,
  "fourStars": 2,
  "threeStars": 1,
  "twoStars": 1,
  "oneStar": 0
}
```

**CURL Example:**
```bash
curl -X GET http://localhost:8090/api/ratings/documents/3/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 7️⃣ Get My All Ratings

**Endpoint:** `GET /api/ratings/my-ratings`

**Mô tả:** Lấy tất cả ratings của user hiện tại (lịch sử đánh giá)

**Request Body:** None

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "documentId": 3,
    "documentTitle": "Angular Best Practices",
    "userId": 5,
    "username": "nguyenvu12",
    "ratingValue": 5,
    "createdAt": "2025-12-28T21:30:00",
    "updatedAt": "2025-12-28T21:30:00"
  },
  {
    "id": 5,
    "documentId": 1,
    "documentTitle": "Angular Guide",
    "userId": 5,
    "username": "nguyenvu12",
    "ratingValue": 4,
    "createdAt": "2025-12-27T10:20:00",
    "updatedAt": "2025-12-27T10:20:00"
  }
]
```

**CURL Example:**
```bash
curl -X GET http://localhost:8090/api/ratings/my-ratings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 MAPPING TABLE - BACKEND ↔ ANGULAR

| Backend Field | Angular Field | Type | Description |
|--------------|---------------|------|-------------|
| `id` | `id` | `number` | Rating ID |
| `documentId` | `documentId` | `number` | Document ID |
| `documentTitle` | `documentTitle` | `string` | Document title |
| `userId` | `userId` | `number` | User ID who rated |
| `username` | `username` | `string` | Username who rated |
| `ratingValue` | `ratingValue` | `number` | Star rating (1-5) |
| `createdAt` | `createdAt` | `string (ISO)` | Created timestamp |
| `updatedAt` | `updatedAt` | `string (ISO)` | Updated timestamp |

### Rating Stats Mapping

| Backend Field | Angular Field | Type | Description |
|--------------|---------------|------|-------------|
| `documentId` | `documentId` | `number` | Document ID |
| `averageRating` | `averageRating` | `number` | Average rating (0-5) |
| `totalRatings` | `totalRatings` | `number` | Total number of ratings |
| `fiveStars` | `fiveStars` | `number` | Count of 5-star ratings |
| `fourStars` | `fourStars` | `number` | Count of 4-star ratings |
| `threeStars` | `threeStars` | `number` | Count of 3-star ratings |
| `twoStars` | `twoStars` | `number` | Count of 2-star ratings |
| `oneStar` | `oneStar` | `number` | Count of 1-star ratings |

---

## ✅ VALIDATION RULES

### Request Body:
- `ratingValue`: Required, integer, min=1, max=5

### Business Rules:
1. User chỉ có thể rate 1 lần cho mỗi document
2. POST sẽ tự động update nếu đã có rating
3. Chỉ có thể xóa rating của chính mình
4. Document phải tồn tại và user phải có quyền truy cập

---

## 🎯 ANGULAR INTEGRATION GUIDE

### 1. Create Model (rating.model.ts)
```typescript
export interface Rating {
  id: number;
  documentId: number;
  documentTitle: string;
  userId: number;
  username: string;
  ratingValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  documentId: number;
  averageRating: number;
  totalRatings: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

export interface RatingRequest {
  ratingValue: number;
}
```

### 2. Create Service (rating.service.ts)
```typescript
@Injectable({ providedIn: 'root' })
export class RatingService {
  private apiUrl = environment.apiBaseUrl + '/api/ratings';

  constructor(private http: HttpClient) {}

  // Rate document
  rateDocument(documentId: number, rating: number): Observable<Rating> {
    return this.http.post<Rating>(
      `${this.apiUrl}/documents/${documentId}`,
      { ratingValue: rating }
    );
  }

  // Update rating
  updateRating(documentId: number, rating: number): Observable<Rating> {
    return this.http.put<Rating>(
      `${this.apiUrl}/documents/${documentId}`,
      { ratingValue: rating }
    );
  }

  // Delete rating
  deleteRating(documentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documents/${documentId}`);
  }

  // Get my rating
  getMyRating(documentId: number): Observable<Rating | null> {
    return this.http.get<Rating>(
      `${this.apiUrl}/documents/${documentId}/my-rating`
    ).pipe(catchError(() => of(null)));
  }

  // Get all ratings
  getDocumentRatings(documentId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/documents/${documentId}`);
  }

  // Get stats
  getRatingStats(documentId: number): Observable<RatingStats> {
    return this.http.get<RatingStats>(
      `${this.apiUrl}/documents/${documentId}/stats`
    );
  }

  // Get my all ratings
  getMyRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/my-ratings`);
  }
}
```

### 3. Usage Example (component.ts)
```typescript
// Rate document
rateDocument(documentId: number, stars: number) {
  this.ratingService.rateDocument(documentId, stars).subscribe({
    next: (rating) => {
      console.log('Rated successfully:', rating);
      this.loadStats(); // Refresh stats
    },
    error: (err) => console.error('Rating failed:', err)
  });
}

// Load current user rating
loadMyRating(documentId: number) {
  this.ratingService.getMyRating(documentId).subscribe({
    next: (rating) => {
      this.myRating = rating?.ratingValue || 0;
    }
  });
}

// Load stats
loadStats(documentId: number) {
  this.ratingService.getRatingStats(documentId).subscribe({
    next: (stats) => {
      this.averageRating = stats.averageRating;
      this.totalRatings = stats.totalRatings;
      this.ratingDistribution = {
        5: stats.fiveStars,
        4: stats.fourStars,
        3: stats.threeStars,
        2: stats.twoStars,
        1: stats.oneStar
      };
    }
  });
}
```

---

## 🧪 TEST SCENARIOS

### Test 1: Rate Document
```bash
# Login first
TOKEN=$(curl -X POST http://localhost:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

# Rate document
curl -X POST http://localhost:8090/api/ratings/documents/3 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ratingValue": 5}' | jq
```

### Test 2: Get My Rating
```bash
curl -X GET http://localhost:8090/api/ratings/documents/3/my-rating \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Test 3: Get Stats
```bash
curl -X GET http://localhost:8090/api/ratings/documents/3/stats \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

**✅ ĐÃ HOÀN THÀNH API CONTRACT CHO RATING**

Document Related API sẽ được cung cấp sau khi bạn yêu cầu.

