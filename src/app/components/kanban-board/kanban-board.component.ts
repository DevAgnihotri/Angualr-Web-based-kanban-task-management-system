import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { ColumnHeaderComponent } from '../column-header/column-header.component';
import { TaskStatus, Column } from '../../models/task.model';

@Component({
  selector: 'app-kanban-board',
  imports: [CommonModule, MaterialModule, ColumnHeaderComponent],
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

  getTaskCount(columnId: string): number {
    const column = this.columns.find(col => col.id === columnId);
    return column ? column.tasks.length : 0;
  }
}
