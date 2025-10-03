# 🚀 Quick Start Guide - Database Edition

## Start Your App in 3 Steps

### Step 1: Open Terminal and Start Backend

```bash
npm run backend
```

✅ You should see:

```
🚀 Backend server running on http://localhost:3000
📊 API endpoints available at http://localhost:3000/api
```

### Step 2: Open Another Terminal and Start Frontend

```bash
npm start
```

✅ Wait for:

```
** Angular Live Development Server is listening on localhost:4200 **
```

### Step 3: Open Browser

Go to: `http://localhost:4200`

**That's it! Your app is now running with a real database! 🎉**

---

## 🧪 Test Database Integration

1. **Create a task** in the Kanban board
2. **Close your browser completely**
3. **Reopen** `http://localhost:4200`
4. **Your task is still there!** ✅

This proves data is saved in the database, not just in browser memory!

---

## 🔍 View Your Database

Want to see the data in the database?

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can:

- View all columns and tasks
- Edit data directly
- Delete records
- See relationships

---

## 📊 Quick Tips

### Check if Backend is Running

Open in browser: `http://localhost:3000/api/columns`

- Should show JSON data

### Reset Database to Sample Data

In browser console or Postman:

```
POST http://localhost:3000/api/init
```

### Clear All Data

```
DELETE http://localhost:3000/api/clear
```

---

## ⚠️ Troubleshooting

### Port 3000 already in use?

Kill the process:

```bash
# Find process
netstat -ano | findstr :3000

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

### Backend won't start?

```bash
# Regenerate Prisma Client
npx prisma generate

# Try again
npm run backend
```

### Database is empty?

```bash
# Initialize with sample data
curl -X POST http://localhost:3000/api/init
```

---

## 📁 Important Files

- **Database File**: `prisma/dev.db`
- **Backend Server**: `backend/server.js`
- **API Service**: `src/app/services/api.service.ts`
- **Database Schema**: `prisma/schema.prisma`

---

## 🎓 What You Learned

✅ Set up Prisma ORM  
✅ Created SQLite database  
✅ Built REST API with Express  
✅ Connected Angular to backend  
✅ Replaced localStorage with database  
✅ Used proper data relationships

**Congratulations! You now have a professional full-stack app! 🎉**

---

Need more details? Check:

- `DATABASE_INTEGRATION_SUMMARY.md` - Full feature list
- `DATABASE_SETUP.md` - Detailed setup guide
- `ARCHITECTURE.md` - System architecture

Happy coding! 💻
