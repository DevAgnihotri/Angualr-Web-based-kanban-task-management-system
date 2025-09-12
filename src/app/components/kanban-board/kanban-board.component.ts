import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { ColumnHeaderComponent } from '../column-header/column-header.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskStatus, Column, Task, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-kanban-board',
  imports: [CommonModule, MaterialModule, ColumnHeaderComponent, TaskCardComponent],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css'
})
export class KanbanBoardComponent {
  columns: Column[] = [
    {
      id: 'todo',
      title: 'TO-DO',
      status: TaskStatus.TODO,
      tasks: []
    },
    {
      id: 'in-progress', 
      title: 'IN PROGRESS',
      status: TaskStatus.IN_PROGRESS,
      tasks: []
    },
    {
      id: 'done',
      title: 'DONE',
      status: TaskStatus.DONE,
      tasks: []
    }
  ];

  constructor() {
    this.loadSampleTasks();
  }

  getTaskCount(columnId: string): number {
    const column = this.columns.find(col => col.id === columnId);
    return column ? column.tasks.length : 0;
  }

  onEditTask(task: Task): void {
    console.log('Edit task:', task);
    // TODO: Open edit dialog in Step 5
  }

  onDeleteTask(taskId: string): void {
    console.log('Delete task:', taskId);
    // Find and remove the task from all columns
    this.columns.forEach(column => {
      column.tasks = column.tasks.filter(task => task.id !== taskId);
    });
  }

  onUpdateTask(task: Task): void {
    console.log('Update task:', task);
    // TODO: Update task logic
  }

  private loadSampleTasks(): void {
    // Sample tasks for testing
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Design user interface',
        description: 'Create wireframes and mockups for the new dashboard feature',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        createdDate: new Date(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        assignee: 'John Doe',
        tags: ['design', 'ui']
      },
      {
        id: '2',
        title: 'Implement authentication',
        description: 'Set up user login and registration functionality',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        createdDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        assignee: 'Jane Smith',
        tags: ['backend', 'security']
      },
      {
        id: '3',
        title: 'Fix responsive layout',
        description: 'Resolve mobile view issues on the homepage',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        createdDate: new Date(),
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        assignee: 'Mike Johnson',
        tags: ['css', 'mobile']
      },
      {
        id: '4',
        title: 'Write unit tests',
        description: 'Add comprehensive test coverage for the user service',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.LOW,
        createdDate: new Date(),
        tags: ['testing']
      },
      {
        id: '5',
        title: 'Deploy to staging',
        description: 'Release latest features to staging environment for testing',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        createdDate: new Date(),
        assignee: 'Sarah Wilson',
        tags: ['deployment']
      }
    ];

    // Distribute tasks to columns based on their status
    sampleTasks.forEach(task => {
      const column = this.columns.find(col => col.status === task.status);
      if (column) {
        column.tasks.push(task);
      }
    });
  }
}
