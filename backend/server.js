const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============= COLUMN ROUTES =============

// Get all columns with their tasks
app.get('/api/columns', async (req, res) => {
  try {
    const columns = await prisma.column.findMany({
      include: {
        tasks: true
      },
      orderBy: {
        position: 'asc'
      }
    });
    
    // Parse tags from JSON string
    const formattedColumns = columns.map(column => ({
      ...column,
      tasks: column.tasks.map(task => ({
        ...task,
        tags: task.tags ? JSON.parse(task.tags) : []
      }))
    }));
    
    res.json(formattedColumns);
  } catch (error) {
    console.error('Error fetching columns:', error);
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
});

// Create a new column
app.post('/api/columns', async (req, res) => {
  try {
    const { title, status, position, isCustom, color } = req.body;
    
    const column = await prisma.column.create({
      data: {
        title,
        status,
        position,
        isCustom: isCustom || false,
        color: color || '#9c27b0'
      },
      include: {
        tasks: true
      }
    });
    
    res.json(column);
  } catch (error) {
    console.error('Error creating column:', error);
    res.status(500).json({ error: 'Failed to create column' });
  }
});

// Update column
app.put('/api/columns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, position, color } = req.body;
    
    const column = await prisma.column.update({
      where: { id },
      data: {
        title,
        position,
        color
      },
      include: {
        tasks: true
      }
    });
    
    res.json(column);
  } catch (error) {
    console.error('Error updating column:', error);
    res.status(500).json({ error: 'Failed to update column' });
  }
});

// Delete column
app.delete('/api/columns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete column (tasks will be cascade deleted)
    await prisma.column.delete({
      where: { id }
    });
    
    res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Error deleting column:', error);
    res.status(500).json({ error: 'Failed to delete column' });
  }
});

// Update multiple columns order
app.put('/api/columns/reorder', async (req, res) => {
  try {
    const { columns } = req.body;
    
    // Update each column's position
    const updatePromises = columns.map(col => 
      prisma.column.update({
        where: { id: col.id },
        data: { position: col.position }
      })
    );
    
    await Promise.all(updatePromises);
    
    const updatedColumns = await prisma.column.findMany({
      include: { tasks: true },
      orderBy: { position: 'asc' }
    });
    
    res.json(updatedColumns);
  } catch (error) {
    console.error('Error reordering columns:', error);
    res.status(500).json({ error: 'Failed to reorder columns' });
  }
});

// ============= TASK ROUTES =============

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        column: true
      }
    });
    
    const formattedTasks = tasks.map(task => ({
      ...task,
      tags: task.tags ? JSON.parse(task.tags) : []
    }));
    
    res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        column: true
      }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const formattedTask = {
      ...task,
      tags: task.tags ? JSON.parse(task.tags) : []
    };
    
    res.json(formattedTask);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status, priority, columnId, dueDate, assignee, tags } = req.body;
    
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        columnId,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignee,
        tags: tags ? JSON.stringify(tags) : null
      },
      include: {
        column: true
      }
    });
    
    const formattedTask = {
      ...task,
      tags: task.tags ? JSON.parse(task.tags) : []
    };
    
    res.json(formattedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, columnId, dueDate, assignee, tags } = req.body;
    
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        columnId,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignee,
        tags: tags ? JSON.stringify(tags) : null
      },
      include: {
        column: true
      }
    });
    
    const formattedTask = {
      ...task,
      tags: task.tags ? JSON.parse(task.tags) : []
    };
    
    res.json(formattedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.task.delete({
      where: { id }
    });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ============= UTILITY ROUTES =============

// Initialize with sample data
app.post('/api/init', async (req, res) => {
  try {
    // Check if data already exists
    const existingColumns = await prisma.column.count();
    
    if (existingColumns > 0) {
      return res.json({ message: 'Database already initialized' });
    }
    
    // Create initial columns with tasks
    const todoColumn = await prisma.column.create({
      data: {
        title: 'TO-DO',
        status: 'todo',
        position: 0,
        isCustom: false,
        color: '#ff9800',
        tasks: {
          create: [
            {
              title: 'Design user interface mockups',
              description: 'Create wireframes and high-fidelity mockups for the new dashboard',
              status: 'todo',
              priority: 'high',
              dueDate: new Date('2024-02-01'),
              assignee: 'John Doe',
              tags: JSON.stringify(['design', 'ui', 'mockups'])
            },
            {
              title: 'Research user requirements',
              description: 'Conduct user interviews and analyze requirements for the new features',
              status: 'todo',
              priority: 'medium',
              assignee: 'Jane Smith',
              tags: JSON.stringify(['research', 'ux'])
            }
          ]
        }
      }
    });
    
    const inProgressColumn = await prisma.column.create({
      data: {
        title: 'IN PROGRESS',
        status: 'in-progress',
        position: 1,
        isCustom: false,
        color: '#2196f3',
        tasks: {
          create: [
            {
              title: 'Implement authentication system',
              description: 'Set up JWT-based authentication with proper security measures',
              status: 'in-progress',
              priority: 'high',
              dueDate: new Date('2024-01-25'),
              assignee: 'Mike Johnson',
              tags: JSON.stringify(['backend', 'security', 'auth'])
            },
            {
              title: 'Write unit tests',
              description: 'Add comprehensive unit tests for the user service module',
              status: 'in-progress',
              priority: 'medium',
              assignee: 'Sarah Wilson',
              tags: JSON.stringify(['testing', 'unit-tests'])
            }
          ]
        }
      }
    });
    
    const doneColumn = await prisma.column.create({
      data: {
        title: 'DONE',
        status: 'done',
        position: 2,
        isCustom: false,
        color: '#4caf50',
        tasks: {
          create: [
            {
              title: 'Set up project repository',
              description: 'Initialize Git repository and set up CI/CD pipeline',
              status: 'done',
              priority: 'low',
              dueDate: new Date('2024-01-10'),
              assignee: 'Alex Brown',
              tags: JSON.stringify(['setup', 'git', 'ci-cd'])
            }
          ]
        }
      }
    });
    
    res.json({ 
      message: 'Database initialized with sample data',
      columns: [todoColumn, inProgressColumn, doneColumn]
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
});

// Clear all data
app.delete('/api/clear', async (req, res) => {
  try {
    await prisma.task.deleteMany();
    await prisma.column.deleteMany();
    
    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
