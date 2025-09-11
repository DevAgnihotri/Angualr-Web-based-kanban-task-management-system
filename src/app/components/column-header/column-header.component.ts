import { Component, Input } from '@angular/core';
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

  getStatusColor(): string {
    switch (this.status) {
      case TaskStatus.TODO:
        return '#ff9800'; // Orange
      case TaskStatus.IN_PROGRESS:
        return '#2196f3'; // Blue
      case TaskStatus.DONE:
        return '#4caf50'; // Green
      default:
        return '#757575'; // Gray
    }
  }
}
