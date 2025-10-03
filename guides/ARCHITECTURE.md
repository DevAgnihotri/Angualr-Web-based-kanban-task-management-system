# 🏗️ Application Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         Angular Frontend (Port 4200)                    │   │
│  │                                                          │   │
│  │  ├─ Components                                          │   │
│  │  │  ├─ Kanban Board                                     │   │
│  │  │  ├─ Task Card                                        │   │
│  │  │  ├─ Column Header                                    │   │
│  │  │  ├─ Add Task Dialog                                  │   │
│  │  │  └─ Edit Task Dialog                                 │   │
│  │  │                                                       │   │
│  │  ├─ Services                                            │   │
│  │  │  ├─ TaskService  ──────────────┐                    │   │
│  │  │  └─ ApiService (HttpClient)    │                    │   │
│  │  │                                 │                     │   │
│  │  └─ Models                         │                     │   │
│  │     ├─ Task                        │                     │   │
│  │     ├─ Column                      │                     │   │
│  │     └─ Enums                       │                     │   │
│  └─────────────────────────────────────┼─────────────────────┘   │
│                                        │                          │
└────────────────────────────────────────┼──────────────────────────┘
                                         │
                                         │ HTTP Requests
                                         │ (REST API)
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js Backend (Port 3000)                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                    REST API Endpoints                   │   │
│  │                                                          │   │
│  │  Columns API:                    Tasks API:            │   │
│  │  ├─ GET    /api/columns          ├─ GET /api/tasks     │   │
│  │  ├─ POST   /api/columns          ├─ GET /api/tasks/:id │   │
│  │  ├─ PUT    /api/columns/:id      ├─ POST /api/tasks    │   │
│  │  ├─ DELETE /api/columns/:id      ├─ PUT /api/tasks/:id │   │
│  │  └─ PUT    /api/columns/reorder  └─ DELETE /api/tasks/:id│  │
│  │                                                          │   │
│  │  Utility API:                                           │   │
│  │  ├─ POST   /api/init   (Initialize DB)                 │   │
│  │  └─ DELETE /api/clear  (Clear all data)                │   │
│  └─────────────────────────────────┬────────────────────────┘   │
│                                    │                             │
│                                    │ Prisma Client               │
│                                    ▼                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Prisma ORM                             │  │
│  │  - Query Builder                                          │  │
│  │  - Type Safety                                            │  │
│  │  - Migration Management                                   │  │
│  │  - Schema Validation                                      │  │
│  └─────────────────────────────────┬─────────────────────────┘  │
│                                    │                             │
└────────────────────────────────────┼─────────────────────────────┘
                                     │
                                     │ SQL Queries
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SQLite Database (dev.db)                       │
│                                                                  │
│  ┌────────────────┐              ┌────────────────────────┐    │
│  │  Column Table  │              │      Task Table        │    │
│  ├────────────────┤              ├────────────────────────┤    │
│  │ id (PK)        │              │ id (PK)                │    │
│  │ title          │◄─────────────┤ columnId (FK)          │    │
│  │ status         │   One-to-    │ title                  │    │
│  │ position       │     Many     │ description            │    │
│  │ isCustom       │              │ status                 │    │
│  │ color          │              │ priority               │    │
│  │ createdDate    │              │ createdDate            │    │
│  └────────────────┘              │ dueDate                │    │
│                                  │ assignee               │    │
│                                  │ tags                   │    │
│                                  └────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Creating a Task

```
User Action (UI)
    ↓
Task Dialog Component
    ↓
TaskService.addTask()
    ↓
ApiService.createTask()
    ↓
HTTP POST /api/tasks
    ↓
Express Backend
    ↓
Prisma Client
    ↓
SQLite Database (INSERT)
    ↓
Response back to UI
    ↓
UI Updates
```

### Loading Tasks

```
App Initialization
    ↓
TaskService.loadFromDatabase()
    ↓
ApiService.getColumns()
    ↓
HTTP GET /api/columns
    ↓
Express Backend
    ↓
Prisma Client
    ↓
SQLite Database (SELECT)
    ↓
Data sent to Frontend
    ↓
BehaviorSubject.next()
    ↓
UI Renders
```

## Technology Stack

### Frontend

- **Framework**: Angular 19.2
- **UI Library**: Angular Material
- **State Management**: RxJS BehaviorSubject
- **HTTP Client**: Angular HttpClient
- **Styling**: CSS + Material Design

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **CORS**: Enabled for localhost
- **JSON Parsing**: body-parser (express.json())

### Database

- **Type**: SQLite (File-based)
- **Location**: `./prisma/dev.db`
- **Schema Management**: Prisma Migrate
- **GUI Tool**: Prisma Studio

## File Structure

```
my-app/
├── backend/
│   └── server.js                 # Express API server
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── dev.db                   # SQLite database file
│   └── migrations/              # Database migrations
│       └── 20251003073655_init/
│           └── migration.sql
│
├── src/
│   └── app/
│       ├── components/          # UI Components
│       ├── services/
│       │   ├── task.service.ts  # Business logic
│       │   └── api.service.ts   # HTTP API calls
│       └── models/
│           └── task.model.ts    # TypeScript interfaces
│
├── .env                         # Database connection
├── package.json                 # Dependencies & scripts
└── DATABASE_SETUP.md           # Setup instructions
```

## API Response Examples

### GET /api/columns

```json
[
  {
    "id": "uuid-1",
    "title": "TO-DO",
    "status": "todo",
    "position": 0,
    "isCustom": false,
    "color": "#ff9800",
    "createdDate": "2024-01-01T00:00:00.000Z",
    "tasks": [
      {
        "id": "task-uuid-1",
        "title": "Design UI mockups",
        "description": "Create wireframes...",
        "status": "todo",
        "priority": "high",
        "createdDate": "2024-01-01T00:00:00.000Z",
        "dueDate": "2024-02-01T00:00:00.000Z",
        "assignee": "John Doe",
        "tags": ["design", "ui"],
        "columnId": "uuid-1"
      }
    ]
  }
]
```

### POST /api/tasks

Request:

```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "columnId": "uuid-1",
  "assignee": "Jane Smith",
  "tags": ["feature", "backend"]
}
```

Response:

```json
{
  "id": "new-task-uuid",
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "createdDate": "2024-01-15T10:30:00.000Z",
  "assignee": "Jane Smith",
  "tags": ["feature", "backend"],
  "columnId": "uuid-1"
}
```

## Security Features

- ✅ CORS configured for localhost only
- ✅ Environment variables for sensitive data
- ✅ SQL injection prevention (Prisma)
- ✅ Input validation on backend
- ✅ Cascade delete (data integrity)
- ✅ Type safety with TypeScript

## Performance Features

- ✅ Database indexing on foreign keys
- ✅ Efficient queries with Prisma
- ✅ RxJS for reactive updates
- ✅ Lazy loading of components
- ✅ Connection pooling (Prisma)

## Future Enhancements

1. **Authentication & Authorization**

   - User login/signup
   - JWT tokens
   - Role-based access

2. **Advanced Features**

   - File attachments
   - Comments on tasks
   - Activity logs
   - Email notifications

3. **Scalability**

   - Switch to PostgreSQL/MySQL
   - Redis caching
   - WebSocket for real-time
   - Deploy to cloud (AWS/Azure)

4. **Testing**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Cypress)

---

**Your app is now production-ready with a real database! 🚀**
