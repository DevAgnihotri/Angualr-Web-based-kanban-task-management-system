import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-column-header',
  imports: [CommonModule, MaterialModule],
  templateUrl: './column-header.component.html',
  styleUrl: './column-header.component.css'
})
export class ColumnHeaderComponent {
  @Input() title: string = '';
  @Input() taskCount: number = 0;
  @Input() status: TaskStatus = TaskStatus.TODO;
  @Input() color?: string;
  @Input() isCustom: boolean = false;
  @Input() columnId: string = '';
  @Input() canDelete: boolean = true;
  @Input() showDragHandle: boolean = true;
  
  @Output() deleteColumn = new EventEmitter<string>();
  @Output() columnDragStart = new EventEmitter<void>();

  getStatusColor(): string {
    // Use custom color if provided, otherwise fall back to default colors
    if (this.color) {
      return this.color;
    }
    
    switch (this.status) {
      case TaskStatus.TODO:
        return '#ff9800'; // Orange
      case TaskStatus.IN_PROGRESS:
        return '#2196f3'; // Blue
      case TaskStatus.DONE:
        return '#4caf50'; // Green
      case TaskStatus.CUSTOM:
        return '#9c27b0'; // Purple
      default:
        return '#757575'; // Gray
    }
  }

  onDeleteColumn(): void {
    if (this.canDelete && confirm(`Are you sure you want to delete the "${this.title}" column? All tasks in this column will be moved to the first available column.`)) {
      this.deleteColumn.emit(this.columnId);
    }
  }

  onDragStart(): void {
    this.columnDragStart.emit();
  }
}
