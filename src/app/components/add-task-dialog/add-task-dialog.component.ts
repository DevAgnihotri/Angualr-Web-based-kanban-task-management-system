import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model';

export interface AddTaskDialogData {
  columnStatus: TaskStatus;
  columnTitle: string;
}

@Component({
  selector: 'app-add-task-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './add-task-dialog.component.html',
  styleUrl: './add-task-dialog.component.css'
})
export class AddTaskDialogComponent implements OnInit {
  taskForm!: FormGroup;
  priorities = Object.values(TaskPriority);
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddTaskDialogData
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      priority: [TaskPriority.MEDIUM, Validators.required],
      assignee: ['', [Validators.maxLength(50)]],
      dueDate: [''],
      tags: ['']
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      
      const newTask: Task = {
        id: this.generateTaskId(),
        title: formValue.title.trim(),
        description: formValue.description?.trim() || '',
        status: this.data.columnStatus,
        priority: formValue.priority,
        createdDate: new Date(),
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
        assignee: formValue.assignee?.trim() || undefined,
        tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : undefined
      };

      this.dialogRef.close(newTask);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private generateTaskId(): string {
    return 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.taskForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength;
      return `${this.getFieldDisplayName(fieldName)} must be at least ${minLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldDisplayName(fieldName)} cannot exceed ${maxLength} characters`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      title: 'Title',
      description: 'Description',
      priority: 'Priority',
      assignee: 'Assignee',
      dueDate: 'Due Date',
      tags: 'Tags'
    };
    return displayNames[fieldName] || fieldName;
  }

  getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH: return 'warn';
      case TaskPriority.MEDIUM: return 'accent';
      case TaskPriority.LOW: return 'primary';
      default: return 'primary';
    }
  }

  getPriorityIcon(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH: return 'arrow_upward';
      case TaskPriority.MEDIUM: return 'remove';
      case TaskPriority.LOW: return 'arrow_downward';
      default: return 'remove';
    }
  }
}
