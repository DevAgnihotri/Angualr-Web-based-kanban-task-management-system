import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { ColumnHeaderComponent } from '../column-header/column-header.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskStatus, Column, Task, TaskPriority } from '../../models/task.model';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

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

  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // Same column - reorder tasks
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Different column - transfer task
      const task = event.previousContainer.data[event.previousIndex];
      
      // Update task status based on target column
      const targetColumnId = event.container.id;
      const newStatus = this.getStatusFromColumnId(targetColumnId);
      task.status = newStatus;
      
      // Transfer the task
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      console.log(`Task "${task.title}" moved to ${newStatus}`);
    }
  }

  private getStatusFromColumnId(columnId: string): TaskStatus {
    switch (columnId) {
      case 'todo-list':
        return TaskStatus.TODO;
      case 'in-progress-list':
        return TaskStatus.IN_PROGRESS;
      case 'done-list':
        return TaskStatus.DONE;
      default:
        return TaskStatus.TODO;
    }
  }

  getConnectedDropLists(): string[] {
    return this.columns.map(column => column.id + '-list');
  }

  private loadSampleTasks(): void {
    // Sample tasks for testing
    const sampleTasks: Task[] = [
      {
      id: '1',
      title: 'Decorate the clubhouse',
      description: 'Hang up balloons and streamers for the big clubhouse party!',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      createdDate: new Date(),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      assignee: 'Mickey Mouse',
      tags: ['party', 'decorations']
      },
      {
      id: '2',
      title: 'Bake Goofy’s favorite cake',
      description: 'Mix ingredients and bake a yummy cake for Goofy’s birthday.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      createdDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignee: 'Minnie Mouse',
      tags: ['baking', 'birthday']
      },
      {
      id: '3',
      title: 'Paint Daisy’s flower pots',
      description: 'Add bright colors and fun patterns to Daisy’s garden pots.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      createdDate: new Date(),
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      assignee: 'Donald Duck',
      tags: ['painting', 'garden']
      },
      {
      id: '4',
      title: 'Practice the Hot Dog Dance',
      description: 'Rehearse the Hot Dog Dance for the clubhouse talent show.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
      createdDate: new Date(),
      tags: ['dance', 'talent show']
      },
      {
      id: '5',
      title: 'Send invitations to friends',
      description: 'Invite Pluto and all the friends to the clubhouse party!',
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      createdDate: new Date(),
      assignee: 'Goofy',
      tags: ['invitations', 'friends']
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
