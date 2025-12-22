# CURL Commands for Search API Endpoints


## 1. GET /api/tags - Load filter options

### CURL Command:
```bash
curl -X GET "http://localhost:8090/api/tags" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

### Response (200 OK):
```json
[
  {
    "id": 1,
    "name": "Angular",
    "description": "Angular framework and related topics",
    "documentCount": 15,
    "createdAt": "2025-12-01T10:00:00"
  },
  {
    "id": 2,
    "name": "Spring Boot",
    "description": "Spring Boot backend development",
    "documentCount": 23,
    "createdAt": "2025-12-01T10:05:00"
  },
  {
    "id": 3,
    "name": "Java",
    "description": "Java programming language",
    "documentCount": 18,
    "createdAt": "2025-12-01T10:10:00"
  },
  {
    "id": 4,
    "name": "TypeScript",
    "description": "TypeScript language",
    "documentCount": 12,
    "createdAt": "2025-12-01T10:15:00"
  },
  {
    "id": 5,
    "name": "REST API",
    "description": "RESTful API design",
    "documentCount": 20,
    "createdAt": "2025-12-01T10:20:00"
  }
]
```

### Alternative - Get Popular Tags Only:
```bash
curl -X GET "http://localhost:8090/api/tags/popular?limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Alternative - Search Tags:
```bash
curl -X GET "http://localhost:8090/api/tags/search?keyword=angular" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 2. GET /api/groups - Load filter options

### CURL Command:
```bash
curl -X GET "http://localhost:8090/api/groups" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

### Response (200 OK):
```json
[
  {
    "id": 1,
    "name": "Frontend Team",
    "description": "Frontend developers working on Angular projects",
    "memberCount": 8,
    "documentCount": 25,
    "memberUsernames": ["user1", "user2", "admin", "john_doe"],
    "createdAt": "2025-11-15T09:00:00",
    "updatedAt": "2025-12-15T14:30:00"
  },
  {
    "id": 2,
    "name": "Backend Team",
    "description": "Backend developers working on Spring Boot",
    "memberCount": 12,
    "documentCount": 35,
    "memberUsernames": ["admin", "user3", "user4", "jane_smith"],
    "createdAt": "2025-11-16T10:00:00",
    "updatedAt": "2025-12-14T11:20:00"
  },
  {
    "id": 3,
    "name": "DevOps Team",
    "description": "DevOps and infrastructure documentation",
    "memberCount": 5,
    "documentCount": 18,
    "memberUsernames": ["admin", "user5"],
    "createdAt": "2025-11-20T11:00:00",
    "updatedAt": "2025-12-10T16:45:00"
  }
]
```

### Alternative - Get My Groups Only:
```bash
curl -X GET "http://localhost:8090/api/groups/my-groups" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Alternative - Search Groups:
```bash
curl -X GET "http://localhost:8090/api/groups/search?keyword=frontend" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 3. GET /api/search - Keyword search with filters

### Basic Keyword Search:
```bash
curl -X GET "http://localhost:8090/api/search?q=angular&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

### Response (200 OK):
```json
{
  "documents": [
    {
      "id": 1,
      "title": "Angular Best Practices Guide",
      "summary": "Comprehensive guide for Angular development best practices",
      "fileType": "PDF",
      "fileName": "angular-guide.pdf",
      "fileSize": 2048576,
      "sharingLevel": "PUBLIC",
      "tags": ["Angular", "TypeScript", "Frontend"],
      "versionNumber": 2,
      "ownerUsername": "john_doe",
      "ownerEmail": "john@example.com",
      "createdAt": "2025-12-01T10:30:00",
      "updatedAt": "2025-12-15T14:20:00",
      "isArchived": false,
      "averageRating": 4.5,
      "totalRatings": 12,
      "downloadCount": 45,
      "isFavorited": true
    },
    {
      "id": 5,
      "title": "Angular Component Architecture",
      "summary": "Deep dive into Angular component design patterns",
      "fileType": "PDF",
      "fileName": "angular-components.pdf",
      "fileSize": 1536000,
      "sharingLevel": "PUBLIC",
      "tags": ["Angular", "Components", "Architecture"],
      "versionNumber": 1,
      "ownerUsername": "jane_smith",
      "ownerEmail": "jane@example.com",
      "createdAt": "2025-12-10T09:15:00",
      "updatedAt": "2025-12-10T09:15:00",
      "isArchived": false,
      "averageRating": 4.8,
      "totalRatings": 8,
      "downloadCount": 32,
      "isFavorited": false
    }
  ],
  "currentPage": 0,
  "totalPages": 3,
  "totalElements": 25,
  "pageSize": 10,
  "tagFacets": null,
  "fileTypeFacets": null,
  "sharingLevelFacets": null,
  "ownerFacets": null,
  "query": "angular",
  "searchTimeMs": 45
}
```

---

## 4. GET /api/search/advanced - Advanced search with all filters

### Advanced Search with Multiple Filters:
```bash
curl -X GET "http://localhost:8090/api/search/advanced?query=spring&tags=Java,Backend&matchAllTags=false&sharingLevel=PUBLIC&fileType=PDF&minRating=4.0&sortBy=rating&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
```

### Response (200 OK):
```json
{
  "documents": [
    {
      "id": 3,
      "title": "Spring Boot Microservices",
      "summary": "Building scalable microservices with Spring Boot",
      "fileType": "PDF",
      "fileName": "spring-microservices.pdf",
      "fileSize": 3145728,
      "sharingLevel": "PUBLIC",
      "tags": ["Spring Boot", "Java", "Microservices", "Backend"],
      "versionNumber": 3,
      "ownerUsername": "admin",
      "ownerEmail": "admin@example.com",
      "createdAt": "2025-11-20T11:00:00",
      "updatedAt": "2025-12-18T16:30:00",
      "isArchived": false,
      "averageRating": 4.9,
      "totalRatings": 25,
      "downloadCount": 120,
      "isFavorited": true
    },
    {
      "id": 8,
      "title": "Spring Security Implementation",
      "summary": "Complete guide to implementing Spring Security",
      "fileType": "PDF",
      "fileName": "spring-security.pdf",
      "fileSize": 2621440,
      "sharingLevel": "PUBLIC",
      "tags": ["Spring Boot", "Security", "Java", "Backend"],
      "versionNumber": 1,
      "ownerUsername": "user3",
      "ownerEmail": "user3@example.com",
      "createdAt": "2025-12-05T14:00:00",
      "updatedAt": "2025-12-05T14:00:00",
      "isArchived": false,
      "averageRating": 4.7,
      "totalRatings": 18,
      "downloadCount": 87,
      "isFavorited": false
    }
  ],
  "currentPage": 0,
  "totalPages": 2,
  "totalElements": 15,
  "pageSize": 10,
  "tagFacets": null,
  "fileTypeFacets": null,
  "sharingLevelFacets": null,
  "ownerFacets": null,
  "query": "spring",
  "searchTimeMs": 52
}
```

### Advanced Search with Date Range:
```bash
curl -X GET "http://localhost:8090/api/search/advanced?query=java&fromDate=2025-12-01T00:00:00&toDate=2025-12-31T23:59:59&sortBy=recent&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Advanced Search by Owner:
```bash
curl -X GET "http://localhost:8090/api/search/advanced?ownerUsername=admin&sortBy=recent&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Advanced Search by Groups:
```bash
curl -X GET "http://localhost:8090/api/search/advanced?groupIds=1,2&sharingLevel=GROUP&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 5. POST /api/search/with-facets - Search with facets for filtering UI

### CURL Command:
```bash
curl -X POST "http://localhost:8090/api/search/with-facets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "angular",
    "page": 0,
    "size": 10,
    "sortBy": "recent"
  }' | jq
```

### Response (200 OK) - With Facets:
```json
{
  "documents": [
    {
      "id": 1,
      "title": "Angular Best Practices Guide",
      "summary": "Comprehensive guide for Angular development best practices",
      "fileType": "PDF",
      "fileName": "angular-guide.pdf",
      "fileSize": 2048576,
      "sharingLevel": "PUBLIC",
      "tags": ["Angular", "TypeScript", "Frontend"],
      "versionNumber": 2,
      "ownerUsername": "john_doe",
      "ownerEmail": "john@example.com",
      "createdAt": "2025-12-01T10:30:00",
      "updatedAt": "2025-12-15T14:20:00",
      "isArchived": false,
      "averageRating": 4.5,
      "totalRatings": 12,
      "downloadCount": 45,
      "isFavorited": true
    }
  ],
  "currentPage": 0,
  "totalPages": 3,
  "totalElements": 25,
  "pageSize": 10,
  "tagFacets": {
    "Angular": 25,
    "TypeScript": 18,
    "Frontend": 22,
    "Components": 15,
    "RxJS": 12,
    "NgRx": 8
  },
  "fileTypeFacets": {
    "PDF": 18,
    "DOCX": 5,
    "PPTX": 2
  },
  "sharingLevelFacets": {
    "PUBLIC": 20,
    "GROUP": 4,
    "PRIVATE": 1
  },
  "ownerFacets": {
    "john_doe": 8,
    "jane_smith": 6,
    "admin": 5,
    "user1": 3,
    "user2": 3
  },
  "query": "angular",
  "searchTimeMs": 68
}
```

### Advanced Faceted Search with Filters:
```bash
curl -X POST "http://localhost:8090/api/search/with-facets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "spring",
    "tags": ["Java", "Backend"],
    "matchAllTags": false,
    "fileType": "PDF",
    "minRating": 4.0,
    "sortBy": "rating",
    "page": 0,
    "size": 10
  }' | jq
```

---

## 6. GET /api/search/by-tags - Search by tags only

### CURL Command (Match ANY tag - OR logic):
```bash
curl -X GET "http://localhost:8090/api/search/by-tags?tags=Angular,React,Vue&matchAll=false&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### CURL Command (Match ALL tags - AND logic):
```bash
curl -X GET "http://localhost:8090/api/search/by-tags?tags=Angular,TypeScript&matchAll=true&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Response (200 OK):
```json
{
  "documents": [
    {
      "id": 1,
      "title": "Angular Best Practices Guide",
      "summary": "Comprehensive guide for Angular development best practices",
      "fileType": "PDF",
      "fileName": "angular-guide.pdf",
      "fileSize": 2048576,
      "sharingLevel": "PUBLIC",
      "tags": ["Angular", "TypeScript", "Frontend"],
      "versionNumber": 2,
      "ownerUsername": "john_doe",
      "ownerEmail": "john@example.com",
      "createdAt": "2025-12-01T10:30:00",
      "updatedAt": "2025-12-15T14:20:00",
      "isArchived": false,
      "averageRating": 4.5,
      "totalRatings": 12,
      "downloadCount": 45,
      "isFavorited": true
    }
  ],
  "currentPage": 0,
  "totalPages": 2,
  "totalElements": 18,
  "pageSize": 10,
  "tagFacets": null,
  "fileTypeFacets": null,
  "sharingLevelFacets": null,
  "ownerFacets": null,
  "query": null,
  "searchTimeMs": 35
}
```

---

## 7. GET /api/search/favorites - Search user's favorited documents

### CURL Command:
```bash
curl -X GET "http://localhost:8090/api/search/favorites?query=angular&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Response (200 OK):
```json
{
  "documents": [
    {
      "id": 1,
      "title": "Angular Best Practices Guide",
      "summary": "Comprehensive guide for Angular development best practices",
      "fileType": "PDF",
      "fileName": "angular-guide.pdf",
      "fileSize": 2048576,
      "sharingLevel": "PUBLIC",
      "tags": ["Angular", "TypeScript", "Frontend"],
      "versionNumber": 2,
      "ownerUsername": "john_doe",
      "ownerEmail": "john@example.com",
      "createdAt": "2025-12-01T10:30:00",
      "updatedAt": "2025-12-15T14:20:00",
      "isArchived": false,
      "averageRating": 4.5,
      "totalRatings": 12,
      "downloadCount": 45,
      "isFavorited": true
    },
    {
      "id": 3,
      "title": "Spring Boot Microservices",
      "summary": "Building scalable microservices with Spring Boot",
      "fileType": "PDF",
      "fileName": "spring-microservices.pdf",
      "fileSize": 3145728,
      "sharingLevel": "PUBLIC",
      "tags": ["Spring Boot", "Java", "Microservices", "Backend"],
      "versionNumber": 3,
      "ownerUsername": "admin",
      "ownerEmail": "admin@example.com",
      "createdAt": "2025-11-20T11:00:00",
      "updatedAt": "2025-12-18T16:30:00",
      "isArchived": false,
      "averageRating": 4.9,
      "totalRatings": 25,
      "downloadCount": 120,
      "isFavorited": true
    }
  ],
  "currentPage": 0,
  "totalPages": 1,
  "totalElements": 8,
  "pageSize": 10,
  "tagFacets": null,
  "fileTypeFacets": null,
  "sharingLevelFacets": null,
  "ownerFacets": null,
  "query": "angular",
  "searchTimeMs": 28
}
```

---

## 8. Common Query Parameter Combinations

### Sort Options:
- `sortBy=recent` - Most recent first (default)
- `sortBy=oldest` - Oldest first
- `sortBy=title` - Alphabetical by title
- `sortBy=rating` - Highest rating first
- `sortBy=popular` - Most downloads first
- `sortBy=relevance` - Best match for search query

### File Type Options:
- `fileType=PDF`
- `fileType=DOCX`
- `fileType=XLSX`
- `fileType=PPTX`
- `fileType=TXT`
- `fileType=IMAGE`

### Sharing Level Options:
- `sharingLevel=PUBLIC`
- `sharingLevel=GROUP`
- `sharingLevel=PRIVATE`

---

## 9. Error Responses

### 401 Unauthorized (Missing or invalid token):
```json
{
  "status": 401,
  "message": "Unauthorized - Invalid or missing token",
  "timestamp": "2025-12-22T10:30:00"
}
```

### 400 Bad Request (Invalid parameters):
```json
{
  "status": 400,
  "message": "Invalid request parameters",
  "timestamp": "2025-12-22T10:30:00"
}
```

### 500 Internal Server Error:
```json
{
  "status": 500,
  "message": "An unexpected error occurred",
  "timestamp": "2025-12-22T10:30:00"
}
```

---

## 10. Testing Script (PowerShell)

Save this as `test-search-apis.ps1`:

```powershell
# Get token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8090/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'

$token = $loginResponse.token
Write-Host "Token: $token`n"

# Test 1: Get Tags
Write-Host "=== Test 1: Get Tags ==="
Invoke-RestMethod -Uri "http://localhost:8090/api/tags" `
  -Headers @{Authorization="Bearer $token"} | ConvertTo-Json -Depth 10

# Test 2: Get Groups
Write-Host "`n=== Test 2: Get Groups ==="
Invoke-RestMethod -Uri "http://localhost:8090/api/groups" `
  -Headers @{Authorization="Bearer $token"} | ConvertTo-Json -Depth 10

# Test 3: Quick Search
Write-Host "`n=== Test 3: Quick Search ==="
Invoke-RestMethod -Uri "http://localhost:8090/api/search?q=angular&page=0&size=10" `
  -Headers @{Authorization="Bearer $token"} | ConvertTo-Json -Depth 10

# Test 4: Advanced Search
Write-Host "`n=== Test 4: Advanced Search ==="
Invoke-RestMethod -Uri "http://localhost:8090/api/search/advanced?query=spring&minRating=4.0&sortBy=rating" `
  -Headers @{Authorization="Bearer $token"} | ConvertTo-Json -Depth 10

# Test 5: Search with Facets
Write-Host "`n=== Test 5: Search with Facets ==="
$body = @{
  query = "angular"
  page = 0
  size = 10
  sortBy = "recent"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8090/api/search/with-facets" `
  -Method POST `
  -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} `
  -Body $body | ConvertTo-Json -Depth 10
```

Run with: `.\test-search-apis.ps1`

---

## Notes:

1. **Base URL**: All examples use `http://localhost:8090` - adjust if your port is different
2. **Authentication**: All search endpoints require Bearer token authentication
3. **Pagination**: Default page=0, size=10. Max size typically 100
4. **Date Format**: Use ISO 8601 format: `2025-12-01T00:00:00`
5. **Tags**: Multiple tags are comma-separated or array format
6. **Facets**: Only available via `/search/with-facets` endpoint
7. **Sort Order**: Default is descending for most sort options
8. **Case Sensitivity**: Search queries are case-insensitive
9. **Partial Matching**: Search supports partial text matching

---

## Quick Reference Table:

| Endpoint | Method | Purpose | Facets | Filters |
|----------|--------|---------|--------|---------|
| `/api/tags` | GET | Get all tags | No | No |
| `/api/groups` | GET | Get all groups | No | No |
| `/api/search` | GET | Quick search | No | Basic |
| `/api/search/advanced` | GET | Advanced search | No | Full |
| `/api/search/with-facets` | POST | Search with facets | Yes | Full |
| `/api/search/by-tags` | GET | Tag-based search | No | Tags only |
| `/api/search/favorites` | GET | Search favorites | No | Basic |

