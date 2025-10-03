# Database Setup Guide

## 🗄️ Database Integration with Prisma

Your Kanban Task Management app now uses **Prisma ORM** with **SQLite database** for persistent data storage.

---

## 📦 What's Included

- **Prisma ORM**: Modern TypeScript ORM for database operations
- **SQLite Database**: Local file-based database (no server setup required)
- **REST API Backend**: Express.js server with CRUD endpoints
- **Database Schema**: Tables for Columns and Tasks with proper relationships

---

## 🚀 How to Run

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Start Backend Server:**

```bash
npm run backend
```

The backend will run on: `http://localhost:3000`

**Terminal 2 - Start Angular App:**

```bash
npm start
```

The frontend will run on: `http://localhost:4200`

### Option 2: Install Concurrently (Optional)

If you want to run both with one command:

```bash
npm install concurrently --save-dev
```

Then run:

```bash
npm run dev
```

---

## 📊 Database Location

Your database file is located at:

```
d:\PROJECTS\Internship\my-app\prisma\dev.db
```

---

## 🔧 Prisma Commands

### View Database in Prisma Studio (GUI)

```bash
npx prisma studio
```

This opens a browser-based GUI at `http://localhost:5555` to view and edit your data.

### Reset Database

```bash
npx prisma migrate reset
```

This will delete all data and recreate the schema.

### Create New Migration (after schema changes)

```bash
npx prisma migrate dev --name your_migration_name
```

### Generate Prisma Client (after schema changes)

```bash
npx prisma generate
```

---

## 🌐 API Endpoints

### Columns

- `GET /api/columns` - Get all columns with tasks
- `POST /api/columns` - Create a new column
- `PUT /api/columns/:id` - Update a column
- `DELETE /api/columns/:id` - Delete a column
- `PUT /api/columns/reorder` - Reorder columns

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a single task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Utility

- `POST /api/init` - Initialize database with sample data
- `DELETE /api/clear` - Clear all data from database

---

## 📝 Database Schema

### Column Table

```prisma
model Column {
  id          String   @id @default(uuid())
  title       String
  status      String
  position    Int
  isCustom    Boolean  @default(false)
  color       String?
  createdDate DateTime @default(now())
  tasks       Task[]
}
```

### Task Table

```prisma
model Task {
  id          String   @id @default(uuid())
  title       String
  description String
  status      String
  priority    String
  createdDate DateTime @default(now())
  dueDate     DateTime?
  assignee    String?
  tags        String?  // Stored as JSON string
  columnId    String
  column      Column   @relation(fields: [columnId], references: [id], onDelete: Cascade)
}
```

---

## 🔄 Migration from LocalStorage to Database

The app now uses **database storage** instead of browser localStorage:

### Before (LocalStorage)

- Data stored in browser
- Limited to ~5-10MB
- Cleared when browser cache is cleared
- Not accessible from other devices

### After (Database)

- Data stored in SQLite file on your computer
- No practical storage limits
- Persists independently of browser
- Can be backed up, shared, or migrated easily

---

## 🛠️ Troubleshooting

### Backend won't start

- Make sure port 3000 is not in use
- Check if Prisma Client is generated: `npx prisma generate`

### Database errors

- Try resetting the database: `npx prisma migrate reset`
- Regenerate Prisma Client: `npx prisma generate`

### CORS errors

- Make sure backend is running on `http://localhost:3000`
- Make sure frontend is running on `http://localhost:4200`

---

## 📚 Learn More

- [Prisma Documentation](https://www.prisma.io/docs)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Express.js Guide](https://expressjs.com/)

---

## 🎉 Features

✅ Real database storage with Prisma  
✅ RESTful API with Express.js  
✅ Automatic database initialization  
✅ Sample data for testing  
✅ CRUD operations for tasks and columns  
✅ Cascade delete (deleting column removes its tasks)  
✅ Relationship management (tasks belong to columns)
