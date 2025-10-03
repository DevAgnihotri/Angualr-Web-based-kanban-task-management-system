import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, TaskStatus, TaskPriority, Column } from '../models/task.model';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private columnsSubject = new BehaviorSubject<Column[]>([]);
  public columns$ = this.columnsSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private apiService: ApiService
  ) {
    // Load data from database
    if (isPlatformBrowser(this.platformId)) {
      this.loadFromDatabase();
    }
  }

  // Get current columns data
  getColumns(): Observable<Column[]> {
    return this.columns$;
  }

  // Get current columns value (synchronous)
  getCurrentColumns(): Column[] {
    return this.columnsSubject.value;
  }

  // Add a new task to specified column
  addTask(task: Task, columnId: string): void {
    const taskData = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      columnId: columnId,
      dueDate: task.dueDate,
      assignee: task.assignee,
      tags: task.tags
    };
    
    this.apiService.createTask(taskData).subscribe({
      next: (createdTask) => {
        const columns = [...this.getCurrentColumns()];
        const columnIndex = columns.findIndex(col => col.id === columnId);
        
        if (columnIndex !== -1) {
          columns[columnIndex] = {
            ...columns[columnIndex],
            tasks: [...columns[columnIndex].tasks, createdTask]
          };
          
          this.columnsSubject.next(columns);
          console.log(`Task "${task.title}" added to column "${columnId}"`);
        }
      },
      error: (err) => {
        console.error('Error adding task:', err);
      }
    });
  }

  // Update an existing task
  updateTask(updatedTask: Task): void {
    const columns = [...this.getCurrentColumns()];
    let oldColumnId = '';

    // Find the current column of the task
    for (const column of columns) {
      const taskIndex = column.tasks.findIndex(task => task.id === updatedTask.id);
      if (taskIndex !== -1) {
        oldColumnId = column.id;
        break;
      }
    }

    // Determine new column ID based on status
    const newColumnId = columns.find(col => col.status === updatedTask.status)?.id || oldColumnId;

    const taskData = {
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      columnId: newColumnId,
      dueDate: updatedTask.dueDate,
      assignee: updatedTask.assignee,
      tags: updatedTask.tags
    };

    this.apiService.updateTask(updatedTask.id, taskData).subscribe({
      next: (updated) => {
        // Reload all columns to reflect the change
        this.loadFromDatabase();
        console.log(`Task "${updatedTask.title}" updated`);
      },
      error: (err) => {
        console.error('Error updating task:', err);
      }
    });
  }

  // Delete a task
  deleteTask(taskId: string): void {
    this.apiService.deleteTask(taskId).subscribe({
      next: () => {
        const columns = [...this.getCurrentColumns()];
        let deletedTaskTitle = '';

        // Find and remove the task from any column
        for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
          const taskIndex = columns[columnIndex].tasks.findIndex(task => task.id === taskId);
          
          if (taskIndex !== -1) {
            deletedTaskTitle = columns[columnIndex].tasks[taskIndex].title;
            columns[columnIndex] = {
              ...columns[columnIndex],
              tasks: columns[columnIndex].tasks.filter(task => task.id !== taskId)
            };
            break;
          }
        }

        this.columnsSubject.next(columns);
        console.log(`Task "${deletedTaskTitle}" deleted`);
      },
      error: (err) => {
        console.error('Error deleting task:', err);
      }
    });
  }

  // Get a specific task by ID
  getTaskById(taskId: string): Task | null {
    const columns = this.getCurrentColumns();
    
    for (const column of columns) {
      const task = column.tasks.find(task => task.id === taskId);
      if (task) {
        return task;
      }
    }
    
    return null;
  }

  // Get all tasks from all columns
  getAllTasks(): Task[] {
    const columns = this.getCurrentColumns();
    return columns.flatMap(column => column.tasks);
  }

  // Get tasks by status
  getTasksByStatus(status: TaskStatus): Task[] {
    const columns = this.getCurrentColumns();
    const column = columns.find(col => col.status === status);
    return column ? column.tasks : [];
  }

  // Get tasks by priority
  getTasksByPriority(priority: TaskPriority): Task[] {
    const allTasks = this.getAllTasks();
    return allTasks.filter(task => task.priority === priority);
  }

  // Search tasks by title or description
  searchTasks(query: string): Task[] {
    const allTasks = this.getAllTasks();
    const lowerQuery = query.toLowerCase();
    
    return allTasks.filter(task => 
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Update columns and save to database
  private updateColumns(columns: Column[]): void {
    this.columnsSubject.next(columns);
    // Data is already saved via API calls, no need for additional save
  }

  // Load data from database
  private loadFromDatabase(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.apiService.getColumns().subscribe({
      next: (columns) => {
        if (columns.length === 0) {
          // Initialize database with sample data if empty
          this.apiService.initializeDatabase().subscribe({
            next: () => {
              this.loadFromDatabase(); // Reload after initialization
            },
            error: (err) => {
              console.error('Error initializing database:', err);
            }
          });
        } else {
          this.columnsSubject.next(columns);
          console.log('Data loaded from database');
        }
      },
      error: (err) => {
        console.error('Error loading from database:', err);
      }
    });
  }

  // Save data to localStorage (deprecated - using database now)
  private saveToStorage(): void {
    // Deprecated: Now using database
    console.log('Using database storage instead of localStorage');
  }

  // Load data from localStorage (deprecated - using database now)
  private loadFromStorage(): void {
    // Deprecated: Now using database
    console.log('Using database storage instead of localStorage');
  }

  // Clear all data (useful for reset functionality)
  clearAllData(): void {
    this.apiService.clearAllData().subscribe({
      next: () => {
        this.columnsSubject.next([]);
        console.log('All task data cleared');
      },
      error: (err) => {
        console.error('Error clearing data:', err);
      }
    });
  }

  // Clear localStorage data (deprecated)
  clearStorageData(): void {
    console.log('Using database storage instead of localStorage');
  }

  // Reset to initial sample data
  resetToSampleData(): void {
    this.apiService.clearAllData().subscribe({
      next: () => {
        this.apiService.initializeDatabase().subscribe({
          next: () => {
            this.loadFromDatabase();
            console.log('Data reset to sample data');
          },
          error: (err) => {
            console.error('Error initializing database:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error clearing data:', err);
      }
    });
  }

  // Get statistics about tasks
  getTaskStatistics() {
    const allTasks = this.getAllTasks();
    
    return {
      total: allTasks.length,
      byStatus: {
        todo: this.getTasksByStatus(TaskStatus.TODO).length,
        inProgress: this.getTasksByStatus(TaskStatus.IN_PROGRESS).length,
        done: this.getTasksByStatus(TaskStatus.DONE).length
      },
      byPriority: {
        high: this.getTasksByPriority(TaskPriority.HIGH).length,
        medium: this.getTasksByPriority(TaskPriority.MEDIUM).length,
        low: this.getTasksByPriority(TaskPriority.LOW).length
      },
      overdue: allTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE
      ).length,
      completed: this.getTasksByStatus(TaskStatus.DONE).length
    };
  }

  // Column Management Methods

  // Add a new column
  addColumn(title: string, position: number): string | null {
    const columns = [...this.getCurrentColumns()];
    
    // Check if we already have 4 columns (maximum allowed)
    if (columns.length >= 4) {
      return null;
    }
    
    const color = this.generateColumnColor(columns.length);
    
    const columnData = {
      title: title.trim(),
      status: TaskStatus.CUSTOM,
      position: position,
      isCustom: true,
      color: color
    };

    this.apiService.createColumn(columnData).subscribe({
      next: (newColumn) => {
        const updatedColumns = [...columns];
        
        // Adjust positions of existing columns
        updatedColumns.forEach(col => {
          if (col.position >= position) {
            col.position += 1;
          }
        });

        // Add new column
        updatedColumns.push(newColumn);
        updatedColumns.sort((a, b) => a.position - b.position);

        this.columnsSubject.next(updatedColumns);
        console.log(`Column "${title}" added at position ${position}`);
      },
      error: (err) => {
        console.error('Error adding column:', err);
      }
    });
    
    return 'pending'; // Return temporary ID
  }

  // Remove a column (only custom columns can be removed)
  removeColumn(columnId: string): boolean {
    const columns = [...this.getCurrentColumns()];
    const columnIndex = columns.findIndex(col => col.id === columnId);
    
    if (columnIndex === -1) {
      console.error(`Column with ID "${columnId}" not found`);
      return false;
    }

    const column = columns[columnIndex];
    
    // Prevent removal of default columns
    if (!column.isCustom) {
      console.error(`Cannot remove default column "${column.title}"`);
      return false;
    }

    this.apiService.deleteColumn(columnId).subscribe({
      next: () => {
        // Remove column from local state
        columns.splice(columnIndex, 1);

        // Adjust positions of remaining columns
        columns.forEach(col => {
          if (col.position > column.position) {
            col.position -= 1;
          }
        });

        this.columnsSubject.next(columns);
        console.log(`Column "${column.title}" removed`);
      },
      error: (err) => {
        console.error('Error removing column:', err);
      }
    });
    
    return true;
  }

  // Get sorted columns by position
  getSortedColumns(): Column[] {
    return this.getCurrentColumns().sort((a, b) => a.position - b.position);
  }

  // Get existing column titles
  getColumnTitles(): string[] {
    return this.getCurrentColumns().map(col => col.title);
  }

  // Reorder columns
  reorderColumn(columnId: string, newPosition: number): boolean {
    const columns = [...this.getCurrentColumns()];
    const column = columns.find(col => col.id === columnId);
    
    if (!column) {
      console.error(`Column with ID "${columnId}" not found`);
      return false;
    }

    const oldPosition = column.position;
    
    // Adjust positions
    if (newPosition > oldPosition) {
      // Moving forward
      columns.forEach(col => {
        if (col.position > oldPosition && col.position <= newPosition) {
          col.position -= 1;
        }
      });
    } else {
      // Moving backward
      columns.forEach(col => {
        if (col.position >= newPosition && col.position < oldPosition) {
          col.position += 1;
        }
      });
    }

    // Set new position
    column.position = newPosition;

    this.updateColumns(columns);
    console.log(`Column "${column.title}" moved to position ${newPosition}`);
    
    return true;
  }

  // Generate unique column ID
  private generateColumnId(title: string): string {
    const baseId = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 20);
    
    const existingIds = this.getCurrentColumns().map(col => col.id);
    let id = baseId;
    let counter = 1;
    
    while (existingIds.includes(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    
    return id;
  }

  // Generate color for new column
  private generateColumnColor(index: number): string {
    const colors = [
      '#9c27b0', // Purple
      '#ff5722', // Deep Orange
      '#607d8b', // Blue Grey
      '#795548', // Brown
      '#ff9800', // Orange
      '#4caf50', // Green
      '#2196f3', // Blue
      '#e91e63', // Pink
      '#009688', // Teal
      '#ffc107'  // Amber
    ];
    
    return colors[index % colors.length];
  }

  // Initial sample data
  private getInitialData(): Column[] {
    return [
      {
        id: 'todo',
        title: 'TO-DO',
        status: TaskStatus.TODO,
        position: 1,
        isCustom: false,
        color: '#ff9800',
        //tasks: []
        // Sample tasks commented out
        tasks: [
          {
            id: 'task-1',
            title: 'Design user interface mockups',
            description: 'Create wireframes and high-fidelity mockups for the new dashboard',
            status: TaskStatus.TODO,
            priority: TaskPriority.HIGH,
            createdDate: new Date('2024-01-15'),
            dueDate: new Date('2024-02-01'),
            assignee: 'John Doe',
            tags: ['design', 'ui', 'mockups']
          },
          {
            id: 'task-2',
            title: 'Research user requirements',
            description: 'Conduct user interviews and analyze requirements for the new features',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            createdDate: new Date('2024-01-16'),
            assignee: 'Jane Smith',
            tags: ['research', 'ux']
          }
        ]
        
        
      },
      {
        id: 'in-progress',
        title: 'IN PROGRESS',
        status: TaskStatus.IN_PROGRESS,
        position: 2,
        isCustom: false,
        color: '#2196f3',
        //tasks: []
        // Sample tasks commented out
        tasks: [
          {
            id: 'task-3',
            title: 'Implement authentication system',
            description: 'Set up JWT-based authentication with proper security measures',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.HIGH,
            createdDate: new Date('2024-01-10'),
            dueDate: new Date('2024-01-25'),
            assignee: 'Mike Johnson',
            tags: ['backend', 'security', 'auth']
          },
          {
            id: 'task-4',
            title: 'Write unit tests',
            description: 'Add comprehensive unit tests for the user service module',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.MEDIUM,
            createdDate: new Date('2024-01-12'),
            assignee: 'Sarah Wilson',
            tags: ['testing', 'unit-tests']
          }
        ]
        
        
      },
      {
        id: 'done',
        title: 'DONE',
        status: TaskStatus.DONE,
        position: 3,
        isCustom: false,
        color: '#4caf50',
        //tasks: []
        // Sample tasks commented out
        tasks: [
          {
            id: 'task-5',
            title: 'Set up project repository',
            description: 'Initialize Git repository and set up CI/CD pipeline',
            status: TaskStatus.DONE,
            priority: TaskPriority.LOW,
            createdDate: new Date('2024-01-08'),
            dueDate: new Date('2024-01-10'),
            assignee: 'Alex Brown',
            tags: ['setup', 'git', 'ci-cd']
          }
        ]
      }
    ];
  }

  // Delete a column and handle its tasks
  deleteColumn(columnId: string): void {
    this.apiService.deleteColumn(columnId).subscribe({
      next: () => {
        const columns = [...this.getCurrentColumns()];
        const columnIndex = columns.findIndex(col => col.id === columnId);
        
        if (columnIndex !== -1) {
          columns.splice(columnIndex, 1);
          
          // Update positions for remaining columns
          columns.forEach((column, index) => {
            column.position = index;
          });
          
          this.columnsSubject.next(columns);
        }
      },
      error: (err) => {
        console.error('Error deleting column:', err);
      }
    });
  }

  // Update column order after drag and drop
  updateColumnOrder(newColumnOrder: Column[]): void {
    const updatedColumns = newColumnOrder.map((column, index) => ({
      ...column,
      position: index
    }));
    
    this.apiService.reorderColumns(updatedColumns).subscribe({
      next: (columns) => {
        this.columnsSubject.next(columns);
      },
      error: (err) => {
        console.error('Error reordering columns:', err);
      }
    });
  }
}
