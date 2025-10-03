# 🧪 API Testing Guide

## Test Your Database Integration

### Quick API Tests Using Browser

#### 1. Test GET Columns

Open in browser:

```
http://localhost:3000/api/columns
```

**Expected:** JSON array of columns with tasks

---

### Using PowerShell/CMD

#### 1. Get All Columns

```powershell
curl http://localhost:3000/api/columns
```

#### 2. Initialize Database with Sample Data

```powershell
curl -X POST http://localhost:3000/api/init
```

#### 3. Get All Tasks

```powershell
curl http://localhost:3000/api/tasks
```

---

### Using Postman or Thunder Client (VS Code Extension)

#### Create a New Task

**Method:** POST  
**URL:** `http://localhost:3000/api/tasks`  
**Headers:** `Content-Type: application/json`  
**Body:**

```json
{
  "title": "Test Task from API",
  "description": "Testing database integration",
  "status": "todo",
  "priority": "high",
  "columnId": "todo",
  "assignee": "Test User",
  "tags": ["test", "api"]
}
```

#### Update a Task

**Method:** PUT  
**URL:** `http://localhost:3000/api/tasks/{task-id}`  
**Headers:** `Content-Type: application/json`  
**Body:**

```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "medium",
  "columnId": "in-progress"
}
```

#### Delete a Task

**Method:** DELETE  
**URL:** `http://localhost:3000/api/tasks/{task-id}`

---

### Verify Database Persistence

**Test Steps:**

1. **Start Backend:**

   ```bash
   npm run backend
   ```

2. **Initialize Database:**

   ```bash
   curl -X POST http://localhost:3000/api/init
   ```

3. **Check Data:**

   ```bash
   curl http://localhost:3000/api/columns
   ```

   You should see 3 columns with sample tasks

4. **Stop Backend:**
   Press `Ctrl+C` in terminal

5. **Restart Backend:**

   ```bash
   npm run backend
   ```

6. **Check Data Again:**
   ```bash
   curl http://localhost:3000/api/columns
   ```
   **Data is still there!** ✅ This proves database persistence works!

---

### View Database in Prisma Studio

```bash
npx prisma studio
```

Then:

1. Open browser: `http://localhost:5555`
2. Click on "Column" table → View all columns
3. Click on "Task" table → View all tasks
4. You can edit/delete records directly in the GUI

---

### Expected API Responses

#### GET /api/columns (Success)

```json
[
  {
    "id": "uuid-string",
    "title": "TO-DO",
    "status": "todo",
    "position": 0,
    "isCustom": false,
    "color": "#ff9800",
    "createdDate": "2024-01-01T00:00:00.000Z",
    "tasks": [
      {
        "id": "task-uuid",
        "title": "Design user interface mockups",
        "description": "Create wireframes...",
        "status": "todo",
        "priority": "high",
        "createdDate": "2024-01-01T00:00:00.000Z",
        "dueDate": "2024-02-01T00:00:00.000Z",
        "assignee": "John Doe",
        "tags": ["design", "ui", "mockups"],
        "columnId": "uuid-string"
      }
    ]
  }
]
```

#### POST /api/init (Success)

```json
{
  "message": "Database initialized with sample data",
  "columns": [ ... ]
}
```

#### Error Response (404)

```json
{
  "error": "Task not found"
}
```

#### Error Response (500)

```json
{
  "error": "Failed to fetch columns"
}
```

---

### Common Issues & Solutions

#### Backend won't start - Port 3000 in use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F

# Start backend again
npm run backend
```

#### CORS Error

Make sure:

- ✅ Backend is running on port 3000
- ✅ Frontend is running on port 4200
- ✅ CORS is configured in `backend/server.js`

#### Database Error

```bash
# Reset database
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate

# Try again
npm run backend
```

---

### Integration Test Checklist

- [ ] Backend starts without errors
- [ ] GET /api/columns returns data
- [ ] POST /api/init creates sample data
- [ ] Frontend connects to backend
- [ ] Tasks can be created from UI
- [ ] Tasks persist after browser restart
- [ ] Prisma Studio shows data
- [ ] Database file exists at `prisma/dev.db`

---

### Performance Test

Create 100 tasks and check response time:

```javascript
// Run this in browser console when on http://localhost:4200
async function createManyTasks() {
  for (let i = 0; i < 100; i++) {
    await fetch("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Performance Test Task ${i}`,
        description: `Task number ${i} for performance testing`,
        status: "todo",
        priority: "medium",
        columnId: "todo",
      }),
    });
  }
  console.log("Created 100 tasks!");
}

createManyTasks();
```

Then check:

```bash
curl http://localhost:3000/api/tasks
```

**Expected:** Should return all 100+ tasks quickly!

---

## ✅ Success Indicators

If you see these, everything is working:

1. ✅ Backend console shows: `🚀 Backend server running on http://localhost:3000`
2. ✅ Browser shows JSON when visiting: `http://localhost:3000/api/columns`
3. ✅ Prisma Studio at `http://localhost:5555` shows tables with data
4. ✅ Frontend at `http://localhost:4200` loads tasks from database
5. ✅ Creating task in UI → Refresh page → Task is still there
6. ✅ Database file exists: `prisma/dev.db` (check in file explorer)

---

**All tests passing? Congratulations! Your database integration is working perfectly! 🎉**
