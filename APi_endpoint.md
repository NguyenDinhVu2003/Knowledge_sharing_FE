# 🔷 API ENDPOINTS CHO ANGULAR FRONTEND

**Base URL:** `http://localhost:8080/api`

**Last Updated:** December 19, 2025

---

## 🔐 AUTH SERVICE

### 1. Login
```
POST /api/auth/login
Body: { 
  username: string, 
  password: string 
}
Response: { 
  token: string, 
  user: { id, username, email, role } 
}
```

### 2. Register
```
POST /api/auth/register
Body: { 
  username: string, 
  email: string, 
  password: string 
}
Response: { 
  token: string, 
  user: { id, username, email, role } 
}
```

### 3. Logout
```
POST /api/auth/logout
Headers: { Authorization: "Bearer {token}" }
Response: 204 No Content
```

### 4. Get Current User
```
GET /api/auth/me
Headers: { Authorization: "Bearer {token}" }
Response: { 
  id: number,
  username: string,
  email: string,
  role: string,
  createdAt: string
}
```

---

## 📄 DOCUMENT SERVICE

### 1. Upload Document
```
POST /api/documents
Headers: { Authorization: "Bearer {token}" }
Body: FormData {
  data: JSON.stringify({
    title: string,
    summary: string,
    tags: string[],
    sharingLevel: "PUBLIC" | "PRIVATE" | "GROUP"
  }),
  file: File
}
Response: { 
  id, title, summary, tags, sharingLevel, 
  fileType, fileUrl, createdAt, owner 
}
```

### 2. Update Document
```
PUT /api/documents/{id}
Headers: { Authorization: "Bearer {token}" }
Body: { 
  title?: string, 
  summary?: string, 
  tags?: string[], 
  sharingLevel?: string 
}
Response: { 
  id, title, summary, tags, sharingLevel, updatedAt 
}
```

### 3. Get Document Detail
```
GET /api/documents/{id}
Headers: { Authorization: "Bearer {token}" }
Response: { 
  id, title, summary, tags, sharingLevel, 
  fileType, fileUrl, owner, createdAt, 
  ratings, favorites 
}
```

### 4. Delete Document
```
DELETE /api/documents/{id}
Headers: { Authorization: "Bearer {token}" }
Response: 204 No Content
```

### 5. Archive Document
```
DELETE /api/documents/{id}/archive
Headers: { Authorization: "Bearer {token}" }
Response: 204 No Content
```

### 6. Get All Documents
```
GET /api/documents?sort=recent&limit=10&owner=me
Headers: { Authorization: "Bearer {token}" }
Query Parameters:
  - sort?: "recent" | "popular"
  - limit?: number (default: 10)
  - owner?: "me" (only my documents)
Response: Document[]
```

### 7. Search Documents
```
GET /api/documents/search?query=angular&page=0&size=10
Headers: { Authorization: "Bearer {token}" }
Query Parameters:
  - query: string
  - tags?: string[]
  - sharingLevel?: string
  - page?: number
  - size?: number
  - sortBy?: string
Response: { 
  content: Document[], 
  totalElements: number, 
  totalPages: number, 
  number: number, 
  size: number 
}
```

---

## 🔍 SEARCH SERVICE

### 1. Advanced Search
```
GET /api/search/advanced
Headers: { Authorization: "Bearer {token}" }
Query Parameters:
  - query?: string
  - tags?: string[]
  - matchAllTags?: boolean
  - sharingLevel?: string
  - fileType?: string
  - minRating?: number
  - maxRating?: number
  - fromDate?: string (ISO date)
  - toDate?: string (ISO date)
  - sortBy?: "recent" | "popular" | "rating"
  - sortOrder?: "asc" | "desc"
  - page?: number
  - size?: number
  - onlyFavorited?: boolean
Response: { 
  content: Document[], 
  totalElements, totalPages, number, size 
}
```

### 2. Search with Facets
```
POST /api/search/with-facets
Headers: { Authorization: "Bearer {token}" }
Body: { 
  query?: string, 
  filters: {
    tags?: string[],
    sharingLevel?: string,
    fileType?: string
  }, 
  page?: number, 
  size?: number 
}
Response: { 
  documents: Document[],
  facets: { 
    tags: { [tagName]: count },
    sharingLevels: { [level]: count },
    fileTypes: { [type]: count }
  }
}
```

---

## ⭐ FAVORITE SERVICE

### 1. Add to Favorites
```
POST /api/favorites/documents/{documentId}
Headers: { Authorization: "Bearer {token}" }
Response: { 
  documentId: number, 
  userId: number, 
  createdAt: string 
}
```

### 2. Remove from Favorites
```
DELETE /api/favorites/documents/{documentId}
Headers: { Authorization: "Bearer {token}" }
Response: 204 No Content
```

### 3. Get My Favorites
```
GET /api/favorites
Headers: { Authorization: "Bearer {token}" }
Response: Document[]
```

### 4. Check if Favorited
```
GET /api/favorites/documents/{documentId}/check
Headers: { Authorization: "Bearer {token}" }
Response: { 
  isFavorited: boolean 
}
```

### 5. Get Favorite Count
```
GET /api/favorites/documents/{documentId}/count
Response: { 
  count: number 
}
```

---

## 🔔 NOTIFICATION SERVICE

### 1. Get All Notifications
```
GET /api/notifications
Headers: { Authorization: "Bearer {token}" }
Response: [
  {
    id: number,
    message: string,
    type: string,
    read: boolean,
    createdAt: string,
    documentId?: number
  }
]
```

### 2. Get Unread Notifications
```
GET /api/notifications/unread
Headers: { Authorization: "Bearer {token}" }
Response: Notification[]
```

### 3. Get Unread Count
```
GET /api/notifications/unread/count
Headers: { Authorization: "Bearer {token}" }
Response: { 
  count: number 
}
```

### 4. Mark as Read
```
PUT /api/notifications/{id}/read
Headers: { Authorization: "Bearer {token}" }
Response: 204 No Content
```

### 5. Mark All as Read
```
PUT /api/notifications/read-all
Headers: { Authorization: "Bearer {token}" }
Response: 204 No Content
```

### 6. Delete Notification
```
DELETE /api/notifications/{id}
Headers: { Authorization: "Bearer {token}" }
Response: 204 No Content
```

---

## 🏷️ TAG SERVICE

### 1. Create Tag
```
POST /api/tags
Headers: { Authorization: "Bearer {token}" }
Body: { 
  name: string 
}
Response: { 
  id: number, 
  name: string, 
  createdAt: string 
}
```

### 2. Update Tag
```
PUT /api/tags/{id}
Headers: { Authorization: "Bearer {token}" }
Body: { 
  name: string 
}
Response: { 
  id: number, 
  name: string, 
  updatedAt: string 
}
```

### 3. Delete Tag
```
DELETE /api/tags/{id}
Headers: { Authorization: "Bearer {token}" }
Response: 204 No Content
```

### 4. Get All Tags
```
GET /api/tags
Headers: { Authorization: "Bearer {token}" }
Response: [
  { id: number, name: string }
]
```

### 5. Get Popular Tags
```
GET /api/tags/popular?limit=10
Query Parameters:
  - limit?: number (default: 10)
Response: [
  { name: string, count: number }
]
```

### 6. Search Tags
```
GET /api/tags/search?keyword=angular
Query Parameters:
  - keyword: string
Response: [
  { id: number, name: string }
]
```

---

## 💝 USER INTERESTS SERVICE

### 1. Get My Interests
```
GET /api/user-interests
Headers: { Authorization: "Bearer {token}" }
Response: { 
  interests: string[] 
}
```

### 2. Update All Interests
```
PUT /api/user-interests
Headers: { Authorization: "Bearer {token}" }
Body: { 
  interests: string[] 
}
Response: { 
  interests: string[] 
}
```

### 3. Add Interest
```
POST /api/user-interests/{tagName}
Headers: { Authorization: "Bearer {token}" }
Response: { 
  interests: string[] 
}
```

### 4. Remove Interest
```
DELETE /api/user-interests/{tagName}
Headers: { Authorization: "Bearer {token}" }
Response: { 
  interests: string[] 
}
```

---

## ⭐ RATING SERVICE

### 1. Rate Document
```
POST /api/ratings/documents/{documentId}
Headers: { Authorization: "Bearer {token}" }
Body: { 
  rating: number (1-5), 
  comment?: string 
}
Response: { 
  id, rating, comment, userId, documentId, createdAt 
}
```

### 2. Update Rating
```
PUT /api/ratings/documents/{documentId}
Headers: { Authorization: "Bearer {token}" }
Body: { 
  rating: number (1-5), 
  comment?: string 
}
Response: { 
  id, rating, comment, updatedAt 
}
```

### 3. Delete Rating
```
DELETE /api/ratings/documents/{documentId}
Headers: { Authorization: "Bearer {token}" }
Response: 204 No Content
```

### 4. Get My Rating
```
GET /api/ratings/documents/{documentId}/my-rating
Headers: { Authorization: "Bearer {token}" }
Response: { 
  id, rating, comment, createdAt 
} | null
```

### 5. Get All Ratings
```
GET /api/ratings/documents/{documentId}
Response: [
  {
    id, rating, comment,
    user: { username },
    createdAt
  }
]
```

### 6. Get Rating Stats
```
GET /api/ratings/documents/{documentId}/stats
Response: { 
  averageRating: number,
  totalRatings: number,
  distribution: { 
    "1": count, 
    "2": count, 
    "3": count, 
    "4": count, 
    "5": count 
  }
}
```

---

## 👑 ADMIN SERVICE

### 1. Get All Users
```
GET /api/admin/users
Headers: { Authorization: "Bearer {token}" }
Response: [
  { id, username, email, role, createdAt }
]
```

### 2. Get User Detail
```
GET /api/admin/users/{userId}
Headers: { Authorization: "Bearer {token}" }
Response: { 
  id, username, email, role, createdAt, 
  documents, ratings 
}
```

### 3. Update User Role
```
PUT /api/admin/users/{userId}/role
Headers: { Authorization: "Bearer {token}" }
Body: { 
  role: "ADMIN" | "EMPLOYEE" 
}
Response: { 
  id, username, role, updatedAt 
}
```

### 4. Delete User
```
DELETE /api/admin/users/{userId}
Headers: { Authorization: "Bearer {token}" }
Response: 204 No Content
```

### 5. Get System Statistics
```
GET /api/admin/statistics
Headers: { Authorization: "Bearer {token}" }
Response: {
  totalUsers: number,
  activeUsers: number,
  newUsersThisMonth: number,
  totalDocuments: number,
  documentsThisMonth: number,
  documentsByType: { 
    PDF: number, 
    DOC: number, 
    IMAGE: number 
  },
  documentsBySharingLevel: { 
    PUBLIC: number, 
    PRIVATE: number, 
    GROUP: number 
  },
  totalRatings: number,
  averageRating: number,
  totalFavorites: number,
  totalNotifications: number,
  totalTags: number,
  totalGroups: number,
  topTags: { 
    [tagName]: count 
  },
  topContributors: { 
    [username]: count 
  },
  topRatedDocuments: { 
    [title]: rating 
  }
}
```

---

## 🔒 COMMON HEADERS

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {JWT_TOKEN}"
}
```

---

## 🌐 ENVIRONMENT CONFIG

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

---

## 📝 NOTES

1. **Authentication Required**: Most endpoints require `Authorization: Bearer {token}` header
2. **Pagination**: Default page size is 10, page index starts from 0
3. **File Upload**: Use `FormData` with `data` (JSON string) and `file` (File object)
4. **Date Format**: ISO 8601 format (e.g., `2025-12-19T10:30:00Z`)
5. **Error Response**: All errors return `{ status, message, timestamp }`

---

## 🚀 IMPLEMENTATION STATUS

- ✅ Auth Service (4 endpoints)
- ✅ Document Service (7 endpoints)
- ✅ Search Service (2 endpoints)
- ✅ Favorite Service (5 endpoints)
- ✅ Notification Service (6 endpoints)
- ✅ Tag Service (6 endpoints)
- ✅ User Interests Service (4 endpoints)
- ✅ Rating Service (6 endpoints)
- ✅ Admin Service (5 endpoints)

**Total: 45 API Endpoints**

