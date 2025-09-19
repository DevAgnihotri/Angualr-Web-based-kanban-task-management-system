import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, TaskStatus, TaskPriority, Column } from '../models/task.model';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private columnsSubject = new BehaviorSubject<Column[]>(this.getInitialData());
  public columns$ = this.columnsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Load data from localStorage if available (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      this.loadFromStorage();
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
    const columns = [...this.getCurrentColumns()];
    const columnIndex = columns.findIndex(col => col.id === columnId);
    
    if (columnIndex !== -1) {
      columns[columnIndex] = {
        ...columns[columnIndex],
        tasks: [...columns[columnIndex].tasks, task]
      };
      
      this.updateColumns(columns);
      console.log(`Task "${task.title}" added to column "${columnId}"`);
    }
  }

  // Update an existing task
  updateTask(updatedTask: Task): void {
    const columns = [...this.getCurrentColumns()];
    let taskFound = false;

    // Find and update the task in any column
    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
      const taskIndex = columns[columnIndex].tasks.findIndex(task => task.id === updatedTask.id);
      
      if (taskIndex !== -1) {
        const oldStatus = columns[columnIndex].tasks[taskIndex].status;
        const newStatus = updatedTask.status;
        
        // If status changed, move task to appropriate column
        if (oldStatus !== newStatus) {
          // Remove from current column
          columns[columnIndex] = {
            ...columns[columnIndex],
            tasks: columns[columnIndex].tasks.filter(task => task.id !== updatedTask.id)
          };
          
          // Add to new column
          const targetColumnIndex = columns.findIndex(col => col.status === newStatus);
          if (targetColumnIndex !== -1) {
            columns[targetColumnIndex] = {
              ...columns[targetColumnIndex],
              tasks: [...columns[targetColumnIndex].tasks, updatedTask]
            };
          }
        } else {
          // Update in same column
          columns[columnIndex] = {
            ...columns[columnIndex],
            tasks: columns[columnIndex].tasks.map(task => 
              task.id === updatedTask.id ? updatedTask : task
            )
          };
        }
        
        taskFound = true;
        break;
      }
    }

    if (taskFound) {
      this.updateColumns(columns);
      console.log(`Task "${updatedTask.title}" updated`);
    }
  }

  // Delete a task
  deleteTask(taskId: string): void {
    const columns = [...this.getCurrentColumns()];
    let taskDeleted = false;
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
        taskDeleted = true;
        break;
      }
    }

    if (taskDeleted) {
      this.updateColumns(columns);
      console.log(`Task "${deletedTaskTitle}" deleted`);
    }
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

  // Update columns and save to storage
  private updateColumns(columns: Column[]): void {
    this.columnsSubject.next(columns);
    this.saveToStorage();
  }

  // Save data to localStorage
  private saveToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip if not in browser
    }
    
    try {
      const data = this.getCurrentColumns();
      localStorage.setItem('kanban-data', JSON.stringify(data));
      console.log('Data saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Load data from localStorage
  private loadFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip if not in browser
    }
    
    try {
      const savedData = localStorage.getItem('kanban-data');
      if (savedData) {
        const columns = JSON.parse(savedData);
        // Convert date strings back to Date objects
        const processedColumns = columns.map((column: Column) => ({
          ...column,
          tasks: column.tasks.map((task: any) => ({
            ...task,
            createdDate: new Date(task.createdDate),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined
          }))
        }));
        this.columnsSubject.next(processedColumns);
        console.log('Data loaded from localStorage');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      // Fall back to initial data if loading fails
      this.columnsSubject.next(this.getInitialData());
    }
  }

  // Clear all data (useful for reset functionality)
  clearAllData(): void {
    const emptyColumns = this.getInitialData().map(column => ({
      ...column,
      tasks: []
    }));
    this.updateColumns(emptyColumns);
    console.log('All task data cleared');
  }

  // Clear localStorage data
  clearStorageData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip if not in browser
    }
    
    try {
      localStorage.removeItem('kanban-data');
      console.log('localStorage data cleared');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Reset to initial sample data
  resetToSampleData(): void {
    const initialData = this.getInitialData();
    this.updateColumns(initialData);
    console.log('Data reset to sample data');
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
      return null; // Cannot add more columns
    }
    
    // Generate unique ID for the new column
    const newId = this.generateColumnId(title);
    
    // Generate color for the column
    const color = this.generateColumnColor(columns.length);
    
    // Create new column
    const newColumn: Column = {
      id: newId,
      title: title.trim(),
      status: TaskStatus.CUSTOM,
      position: position,
      isCustom: true,
      color: color,
      tasks: [],
      createdDate: new Date()
    };

    // Adjust positions of existing columns
    columns.forEach(col => {
      if (col.position >= position) {
        col.position += 1;
      }
    });

    // Insert new column
    columns.push(newColumn);

    // Sort columns by position
    columns.sort((a, b) => a.position - b.position);

    this.updateColumns(columns);
    console.log(`Column "${title}" added at position ${position}`);
    
    return newId;
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

    // Move tasks to the first available column
    if (column.tasks.length > 0) {
      const targetColumn = columns.find(col => col.id !== columnId);
      if (targetColumn) {
        targetColumn.tasks.push(...column.tasks);
        console.log(`Moved ${column.tasks.length} tasks to "${targetColumn.title}"`);
      }
    }

    // Remove column
    columns.splice(columnIndex, 1);

    // Adjust positions of remaining columns
    columns.forEach(col => {
      if (col.position > column.position) {
        col.position -= 1;
      }
    });

    this.updateColumns(columns);
    console.log(`Column "${column.title}" removed`);
    
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
        tasks: []
        /* Sample tasks commented out
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
        */
        
      },
      {
        id: 'in-progress',
        title: 'IN PROGRESS',
        status: TaskStatus.IN_PROGRESS,
        position: 2,
        isCustom: false,
        color: '#2196f3',
        tasks: []
        /* Sample tasks commented out
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
        */
        
      },
      {
        id: 'done',
        title: 'DONE',
        status: TaskStatus.DONE,
        position: 3,
        isCustom: false,
        color: '#4caf50',
        tasks: []
        /* Sample tasks commented out
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
        */
        
      }
    ];
  }
}
