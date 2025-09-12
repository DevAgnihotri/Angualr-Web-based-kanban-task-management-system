import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { Task, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule, MaterialModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Input() isDragging: boolean = false;

  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<string>();
  @Output() updateTask = new EventEmitter<Task>();

  // Expose TaskPriority enum to template
  TaskPriority = TaskPriority;

  onEditClick(): void {
    this.editTask.emit(this.task);
  }

  onDeleteClick(): void {
    this.deleteTask.emit(this.task.id);
  }

  getPriorityColor(): string {
    switch (this.task.priority) {
      case TaskPriority.HIGH:
        return '#f44336'; // Red
      case TaskPriority.MEDIUM:
        return '#ff9800'; // Orange
      case TaskPriority.LOW:
        return '#4caf50'; // Green
      default:
        return '#757575'; // Gray
    }
  }

  getPriorityIcon(): string {
    switch (this.task.priority) {
      case TaskPriority.HIGH:
        return 'keyboard_arrow_up';
      case TaskPriority.MEDIUM:
        return 'remove';
      case TaskPriority.LOW:
        return 'keyboard_arrow_down';
      default:
        return 'remove';
    }
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  isOverdue(): boolean {
    if (!this.task.dueDate) return false;
    return new Date(this.task.dueDate) < new Date();
  }
}
