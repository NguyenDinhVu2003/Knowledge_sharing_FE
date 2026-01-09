🤖 AI SEMANTIC SEARCH - API CONTRACT
✅ ENDPOINT: GET /api/search/semantic
Mô tả:
Search tài liệu sử dụng AI semantic understanding. Tìm kiếm dựa trên ý nghĩa thay vì chỉ từ khóa chính xác.

📥 REQUEST
URL Parameters:
NONE

Query Parameters:
Parameter	Type	Required	Default	Description	Example
q	String	✅ Yes	-	Search query (natural language)	"machine learning tutorials"
limit	Integer	❌ No	10	Max results (1-50)	10
Headers:
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
Request Body:
NONE (GET request)
📤 RESPONSE
Success Response (200 OK):
[
  {
    "id": 5,
    "title": "Deep Learning with TensorFlow",
    "summary": "Advanced neural network techniques for building AI models",
    "content": null,
    "filePath": null,
    "fileType": "PDF",
    "fileSize": 2048576,
    "sharingLevel": "PUBLIC",
    "versionNumber": 1,
    "isArchived": false,
    "ownerId": 3,
    "ownerUsername": "john.doe",
    "averageRating": 4.8,
    "ratingCount": 15,
    "createdAt": "2025-12-20T10:30:00",
    "updatedAt": "2025-12-20T10:30:00",
    "tags": ["AI", "Machine Learning", "TensorFlow", "Neural Networks"],
    "groupIds": [1, 3],
    "semanticScore": 0.92
  },
  {
    "id": 12,
    "title": "Introduction to Neural Networks",
    "summary": "Beginner-friendly guide to understanding neural networks",
    "content": null,
    "filePath": null,
    "fileType": "PDF",
    "fileSize": 1024768,
    "sharingLevel": "PUBLIC",
    "versionNumber": 2,
    "isArchived": false,
    "ownerId": 1,
    "ownerUsername": "admin",
    "averageRating": 4.5,
    "ratingCount": 10,
    "createdAt": "2025-12-18T14:20:00",
    "updatedAt": "2025-12-22T09:15:00",
    "tags": ["AI", "Machine Learning", "Neural Networks"],
    "groupIds": [],
    "semanticScore": 0.87
  },
  {
    "id": 8,
    "title": "Python for Data Science",
    "summary": "Learn Python programming for data analysis and ML",
    "content": null,
    "filePath": null,
    "fileType": "PDF",
    "fileSize": 3145728,
    "sharingLevel": "PUBLIC",
    "versionNumber": 1,
    "isArchived": false,
    "ownerId": 5,
    "ownerUsername": "alice",
    "averageRating": 4.2,
    "ratingCount": 8,
    "createdAt": "2025-12-15T08:00:00",
    "updatedAt": "2025-12-15T08:00:00",
    "tags": ["Python", "Data Science", "Machine Learning"],
    "groupIds": [2],
    "semanticScore": 0.75
  }
]
Response Fields:
Field	Type	Description	Example
id	Long	Document ID	5
title	String	Document title	"Deep Learning with TensorFlow"
summary	String	Brief summary	"Advanced neural network techniques..."
content	String	Full content (usually null)	null
filePath	String	File path (null for security)	null
fileType	String	PDF, DOC, IMAGE	"PDF"
fileSize	Long	File size in bytes	2048576
sharingLevel	String	PUBLIC, PRIVATE, GROUP, DEPARTMENT	"PUBLIC"
versionNumber	Integer	Current version	1
isArchived	Boolean	Is document archived	false
ownerId	Long	Owner user ID	3
ownerUsername	String	Owner username	"john.doe"
averageRating	Double	Average rating (0.0-5.0)	4.8
ratingCount	Integer	Number of ratings	15
createdAt	DateTime	Creation timestamp	"2025-12-20T10:30:00"
updatedAt	DateTime	Last update timestamp	"2025-12-20T10:30:00"
tags	String[]	Associated tags	["AI", "Machine Learning"]
groupIds	Long[]	Associated group IDs	[1, 3]
semanticScore	Double	AI similarity score (0.0-1.0)	0.92
Error Responses:
400 Bad Request - Invalid query:
{
  "status": 400,
  "message": "Query parameter 'q' is required",
  "timestamp": "2025-12-20T10:30:00"
}
401 Unauthorized:
{
  "status": 401,
  "message": "Authentication required",
  "timestamp": "2025-12-20T10:30:00"
}
500 Internal Server Error - AI service error:
{
  "status": 500,
  "message": "Gemini API error: Rate limit exceeded",
  "timestamp": "2025-12-20T10:30:00"
}
🧪 CURL EXAMPLES
Basic semantic search:
curl -X GET "http://localhost:8090/api/search/semantic?q=machine%20learning%20tutorials" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
With custom limit:
curl -X GET "http://localhost:8090/api/search/semantic?q=spring%20boot%20best%20practices&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
Natural language query:
curl -X GET "http://localhost:8090/api/search/semantic?q=how%20to%20build%20microservices%20with%20java" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
🎯 USE CASES
1. Conceptual Search
Query: "machine learning best practices"
Finds: Documents about AI training, neural networks, model optimization
Even if they don't contain exact phrase "machine learning"
2. Cross-Language Understanding
Query: "how to secure REST APIs"
Finds: Documents about API security, authentication, JWT, OAuth
Even with different wording
3. Exploratory Search
Query: "improving application performance"
Finds: Caching, database optimization, load balancing, CDN
All related concepts
⚙️ HOW IT WORKS INTERNALLY
User submits query → "machine learning tutorials"
Gemini API generates embedding → [0.12, -0.34, 0.56, ..., 0.89] (768 dimensions)
Compare with all documents → Calculate cosine similarity
Rank by similarity → Sort by score (highest first)
Filter by access permissions → Only return accessible documents
Return top N results → With semantic scores
📊 PERFORMANCE NOTES
First search may be slow (~2-3 seconds) - Gemini API call
Subsequent searches - Faster if embedding cached
Best for: Exploratory, conceptual searches
Not best for: Exact keyword matching (use /api/search instead)
🔄 COMPARISON: Semantic vs Keyword Search
Feature	Keyword Search	Semantic Search
Speed	⚡ Very fast	🐌 Slower (AI processing)
Exact match	✅ Perfect	❌ May miss exact terms
Meaning understanding	❌ No	✅ Yes
Related concepts	❌ No	✅ Yes
Best for	Known keywords	Exploration, concepts
🚀 ANGULAR INTEGRATION EXAMPLE
// document.service.ts
semanticSearch(query: string, limit: number = 10): Observable<Document[]> {
  return this.http.get<Document[]>(
    `${this.apiUrl}/search/semantic`,
    {
      params: { q: query, limit: limit.toString() }
    }
  );
}

// search.component.ts
searchSemantic() {
  this.documentService.semanticSearch(this.searchQuery, 10)
    .subscribe({
      next: (results) => {
        this.documents = results;
        // results already sorted by semanticScore (highest first)
      },
      error: (err) => {
        console.error('Semantic search failed', err);
      }
    });
}
✅ DONE!
API này đã sẵn sàng để FE Angular tích hợp. Semantic scores giúp hiển thị mức độ tương đồng cho user.