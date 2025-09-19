import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { ColumnHeaderComponent } from '../column-header/column-header.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { AddTaskDialogComponent } from '../add-task-dialog/add-task-dialog.component';
import { AddColumnDialogComponent, AddColumnData } from '../add-column-dialog/add-column-dialog.component';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';
import { TaskStatus, Column, Task, TaskPriority } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kanban-board',
  imports: [CommonModule, MaterialModule, ColumnHeaderComponent, TaskCardComponent],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css'
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  columns: Column[] = [];
  private subscription = new Subscription();

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Subscribe to columns data from the service
    this.subscription.add(
      this.taskService.getColumns().subscribe(columns => {
        this.columns = columns;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getTaskCount(columnId: string): number {
    const column = this.columns.find(col => col.id === columnId);
    return column ? column.tasks.length : 0;
  }

  onAddTask(columnId: string): void {
    const column = this.columns.find(col => col.id === columnId);
    if (!column) return;

    const dialogRef = this.dialog.open(AddTaskDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        columnStatus: column.status,
        columnTitle: column.title
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.addTask(result, columnId);
        this.showSnackBar(`Task "${result.title}" added successfully!`, 'success');
      }
    });
  }

  onEditTask(task: Task): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      data: { task },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'delete') {
          this.taskService.deleteTask(result.task.id);
          this.showSnackBar(`Task "${result.task.title}" deleted successfully!`, 'warn');
        } else {
          this.taskService.updateTask(result);
          this.showSnackBar(`Task "${result.title}" updated successfully!`, 'success');
        }
      }
    });
  }

  onDeleteTask(taskId: string): void {
    const task = this.taskService.getTaskById(taskId);
    if (task && confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskService.deleteTask(taskId);
      this.showSnackBar(`Task "${task.title}" deleted successfully!`, 'warn');
    }
  }

  onUpdateTask(task: Task): void {
    this.taskService.updateTask(task);
    this.showSnackBar(`Task "${task.title}" updated!`, 'success');
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
      const targetColumnId = event.container.id.replace('-list', '');
      const targetColumn = this.columns.find(col => col.id === targetColumnId);

      if (targetColumn) {
        const newStatus = targetColumn.status;
        const updatedTask = { ...task, status: newStatus };

        // Transfer the task
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );

        // Update task in service
        this.taskService.updateTask(updatedTask);
        this.showSnackBar(`Task moved to ${targetColumn.title}!`, 'info');
      }
    }
  }

  // Template helpers expected by kanban-board.component.html
  getColumnMenuClass(column: Column): string {
    if (column.status === TaskStatus.TODO) return 'todo-item';
    if (column.status === TaskStatus.IN_PROGRESS) return 'progress-item';
    if (column.status === TaskStatus.DONE) return 'done-item';
    return 'custom-item';
  }

  getColumnIcon(column: Column): string {
    if (column.status === TaskStatus.TODO) return 'circle';
    if (column.status === TaskStatus.IN_PROGRESS) return 'schedule';
    if (column.status === TaskStatus.DONE) return 'check_circle';
    return 'label';
  }

  onAddColumn(): void {
    const currentColumns = this.taskService.getCurrentColumns();
    if (currentColumns.length >= 4) {
      this.showSnackBar('Maximum of 4 columns allowed!', 'warn');
      return;
    }

    const existingTitles = this.taskService.getColumnTitles();

    const dialogRef = this.dialog.open(AddColumnDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        existingColumns: existingTitles
      } as AddColumnData,
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newColumnId = this.taskService.addColumn(result.title, result.position);
        if (newColumnId) {
          this.showSnackBar(`Column "${result.title}" added successfully!`, 'success');
        } else {
          this.showSnackBar('Failed to add column. Maximum of 4 columns allowed!', 'warn');
        }
      }
    });
  }

  getConnectedDropLists(): string[] {
    return this.columns.map(column => column.id + '-list');
  }

  private showSnackBar(message: string, type: 'success' | 'warn' | 'info'): void {
    const config = {
      duration: 3000,
      horizontalPosition: 'end' as const,
      verticalPosition: 'top' as const,
      panelClass: [`snackbar-${type}`]
    };
    
    this.snackBar.open(message, 'Close', config);
  }

  // Utility methods for template
  getTaskStatistics() {
    return this.taskService.getTaskStatistics();
  }

  exportData(): void {
    const data = this.taskService.getCurrentColumns();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `kanban-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showSnackBar('Data exported successfully!', 'success');
  }

  clearAllData(): void {
    if (confirm('Are you sure you want to clear all tasks? This action cannot be undone.')) {
      this.taskService.clearAllData();
      this.showSnackBar('All data cleared!', 'warn');
    }
  }

  resetToSampleData(): void {
    if (confirm('Reset to sample data? This will replace all current tasks.')) {
      this.taskService.resetToSampleData();
      this.showSnackBar('Data reset to sample data!', 'info');
    }
  }
}