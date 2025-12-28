# API CONTRACT - NOTIFICATION

## 📋 OVERVIEW
Notification system cho phép user nhận thông báo về các hoạt động liên quan đến documents của họ (rating, comments, favorites, etc.)

---

## 🔄 LOGIC FLOW

### Khi nào Notification được tạo?
1. **User A rate document của User B** → User B nhận notification
2. **User A favorite document của User B** → User B nhận notification  
3. **User A comment document của User B** → User B nhận notification
4. **Document được share với user** → User đó nhận notification

### Flow xử lý Notification
```
1. User B đăng nhập → Call GET /api/notifications/unread/count
   → Hiển thị badge số lượng unread

2. User B click vào notification icon → Call GET /api/notifications
   → Hiển thị danh sách (unread ở trên, read ở dưới)

3. User B click vào 1 notification → Call PUT /api/notifications/{id}/read
   → Mark as read → Redirect đến document detail

4. User B click "Mark all as read" → Call PUT /api/notifications/read-all
   → Tất cả notifications thành read

5. User B delete 1 notification → Call DELETE /api/notifications/{id}
   → Xóa notification đó

6. User B clear all → Call DELETE /api/notifications/all
   → Xóa toàn bộ notifications
```

---

## 🔗 API ENDPOINTS

### 1. Get All Notifications
```
GET /api/notifications
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
- No body

**Response:** (200 OK)
```json
[
  {
    "id": 1,
    "message": "User 'admin' rated your document 'Angular Guide' with 5 stars",
    "isRead": false,
    "documentId": 5,
    "documentTitle": "Angular Guide",
    "createdAt": "2025-12-28T21:30:45"
  },
  {
    "id": 2,
    "message": "User 'user2' added your document 'Spring Boot Tips' to favorites",
    "isRead": true,
    "documentId": 3,
    "documentTitle": "Spring Boot Tips",
    "createdAt": "2025-12-28T20:15:30"
  },
  {
    "id": 3,
    "message": "Your document 'Java Best Practices' was shared with group 'Backend Team'",
    "isRead": false,
    "documentId": 7,
    "documentTitle": "Java Best Practices",
    "createdAt": "2025-12-28T19:45:12"
  }
]
```

**Sorting:** Mới nhất lên trên (createdAt DESC)

---

### 2. Get Unread Notifications Only
```
GET /api/notifications/unread
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
- No body

**Response:** (200 OK)
```json
[
  {
    "id": 1,
    "message": "User 'admin' rated your document 'Angular Guide' with 5 stars",
    "isRead": false,
    "documentId": 5,
    "documentTitle": "Angular Guide",
    "createdAt": "2025-12-28T21:30:45"
  },
  {
    "id": 3,
    "message": "Your document 'Java Best Practices' was shared with group 'Backend Team'",
    "isRead": false,
    "documentId": 7,
    "documentTitle": "Java Best Practices",
    "createdAt": "2025-12-28T19:45:12"
  }
]
```

**Use case:** Hiển thị dropdown unread notifications

---

### 3. Get Unread Count (Badge Number)
```
GET /api/notifications/unread/count
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
- No body

**Response:** (200 OK)
```json
{
  "count": 5
}
```

**Use case:** 
- Hiển thị badge trên notification icon
- Call mỗi 30s hoặc khi user login
- Nếu count > 0 → hiện badge đỏ với số

---

### 4. Mark Notification As Read
```
PUT /api/notifications/{id}/read
```

**Headers:**
```
Authorization: Bearer <token>
```

**Path Params:**
- `id` (number) - Notification ID

**Request:**
- No body

**Response:** (200 OK)
```json
{
  "message": "Notification marked as read"
}
```

**Use case:** 
- User click vào notification → call API này
- UI: Chuyển notification từ bold → normal, bỏ dot xanh

---

### 5. Mark All As Read
```
PUT /api/notifications/read-all
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
- No body

**Response:** (200 OK)
```json
{
  "message": "All notifications marked as read"
}
```

**Use case:** 
- User click button "Mark all as read"
- UI: Tất cả notifications chuyển sang read state
- Badge count → 0

---

### 6. Delete Single Notification
```
DELETE /api/notifications/{id}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Path Params:**
- `id` (number) - Notification ID

**Request:**
- No body

**Response:** (200 OK)
```json
{
  "message": "Notification deleted"
}
```

**Use case:** 
- User swipe to delete / click X button
- UI: Remove notification khỏi list

---

### 7. Clear All Notifications
```
DELETE /api/notifications/all
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
- No body

**Response:** (200 OK)
```json
{
  "message": "All notifications cleared"
}
```

**Use case:** 
- User click "Clear all" button
- UI: Empty state "No notifications"

---

## 📊 FIELD MAPPING

| Backend Field | Frontend Field | Type | Required | Description |
|--------------|---------------|------|----------|-------------|
| id | id | number | Yes | Notification unique ID |
| message | message | string | Yes | Notification content/text |
| isRead | isRead | boolean | Yes | Read status |
| documentId | documentId | number | No | Related document ID (nullable) |
| documentTitle | documentTitle | string | No | Document name (nullable) |
| createdAt | createdAt | string | Yes | ISO 8601 date format |

---

## 🎨 UI/UX RECOMMENDATIONS

### Notification Icon/Badge
```typescript
// Poll every 30 seconds
setInterval(() => {
  this.notificationService.getUnreadCount().subscribe(res => {
    this.unreadCount = res.count;
  });
}, 30000);
```

### Notification List Display
```
┌─────────────────────────────────────┐
│ Notifications               [Mark all]│
├─────────────────────────────────────┤
│ • User 'admin' rated...    [5m ago] │  ← Unread (bold, blue dot)
│ • Your document was...     [1h ago] │  ← Unread
│   User 'user2' added...    [2h ago] │  ← Read (normal text)
│   Document shared...       [1d ago] │  ← Read
└─────────────────────────────────────┘
```

### Click Actions
- **Click notification** → Mark as read + Navigate to document detail
- **Mark all as read** → Confirm dialog → Update all
- **Clear all** → Confirm dialog "Are you sure?" → Delete all

---

## 🔔 REAL-TIME UPDATES (Optional)

Nếu muốn real-time notification:
- Backend: Implement WebSocket / Server-Sent Events
- Frontend: Subscribe to notification stream
- Alternative: Poll GET /api/notifications/unread/count mỗi 10-30s

---

## 🧪 EXAMPLE ANGULAR SERVICE

```typescript
// notification.service.ts
export class NotificationService {
  private apiUrl = environment.apiUrl + '/notifications';

  constructor(private http: HttpClient) {}

  // Get all notifications
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  // Get unread only
  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
  }

  // Get unread count (for badge)
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread/count`);
  }

  // Mark as read
  markAsRead(id: number): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.apiUrl}/${id}/read`, {});
  }

  // Mark all as read
  markAllAsRead(): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.apiUrl}/read-all`, {});
  }

  // Delete notification
  deleteNotification(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`);
  }

  // Clear all
  clearAll(): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/all`);
  }
}
```

---

## 🚨 ERROR HANDLING

### Common Errors:

**401 Unauthorized**
```json
{
  "status": 401,
  "message": "Unauthorized",
  "timestamp": "2025-12-28T21:30:45"
}
```
→ Token expired, redirect to login

**403 Forbidden**
```json
{
  "status": 403,
  "message": "You don't have permission to access this notification",
  "timestamp": "2025-12-28T21:30:45"
}
```
→ User trying to access someone else's notification

**404 Not Found**
```json
{
  "status": 404,
  "message": "Notification not found with id: 123",
  "timestamp": "2025-12-28T21:30:45"
}
```
→ Notification already deleted or invalid ID

---

## ✅ CHECKLIST FOR ANGULAR INTEGRATION

- [ ] Create `notification.model.ts` với đúng fields
- [ ] Create `notification.service.ts` với 7 methods
- [ ] Create `notification.component.ts` hiển thị list
- [ ] Add notification icon với badge count ở header
- [ ] Implement mark as read khi click notification
- [ ] Add "Mark all as read" button
- [ ] Add "Clear all" button với confirmation
- [ ] Poll unread count mỗi 30s
- [ ] Handle navigation đến document khi click
- [ ] Style unread vs read notifications khác nhau

---

## 📝 NOTES

1. **Notification chỉ visible cho owner** - User chỉ thấy notifications của chính họ
2. **Auto-delete old notifications** - Backend có thể tự động xóa notifications > 30 days (optional)
3. **Pagination** - Nếu có nhiều notifications, có thể thêm pagination (future enhancement)
4. **Notification types** - Có thể thêm field `type` để phân loại (RATING, FAVORITE, COMMENT, SHARE)

---

**Last Updated:** 2025-12-28  
**API Version:** 1.0  
**Base URL:** `http://localhost:8090/api`

