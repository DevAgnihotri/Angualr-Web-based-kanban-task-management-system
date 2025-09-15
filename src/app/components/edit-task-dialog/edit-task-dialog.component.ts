import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model';

export interface EditTaskDialogData {
  task: Task;
}

@Component({
  selector: 'app-edit-task-dialog',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './edit-task-dialog.component.html',
  styleUrl: './edit-task-dialog.component.css'
})
export class EditTaskDialogComponent implements OnInit {
  taskForm!: FormGroup;
  priorities = Object.values(TaskPriority);
  statuses = Object.values(TaskStatus);
  originalTask: Task;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditTaskDialogData
  ) {
    this.originalTask = { ...data.task };
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.taskForm = this.fb.group({
      title: [this.originalTask.title, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [this.originalTask.description || '', [Validators.maxLength(500)]],
      status: [this.originalTask.status, Validators.required],
      priority: [this.originalTask.priority, Validators.required],
      assignee: [this.originalTask.assignee || '', [Validators.maxLength(50)]],
      dueDate: [this.originalTask.dueDate ? this.formatDateForInput(this.originalTask.dueDate) : ''],
      tags: [this.originalTask.tags ? this.originalTask.tags.join(', ') : '']
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      
      const updatedTask: Task = {
        ...this.originalTask,
        title: formValue.title.trim(),
        description: formValue.description?.trim() || '',
        status: formValue.status,
        priority: formValue.priority,
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
        assignee: formValue.assignee?.trim() || undefined,
        tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : undefined
      };

      this.dialogRef.close(updatedTask);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    if (confirm(`Are you sure you want to delete the task "${this.originalTask.title}"?`)) {
      this.dialogRef.close({ action: 'delete', task: this.originalTask });
    }
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      status: 'Status',
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
      case TaskPriority.HIGH: return 'keyboard_arrow_up';
      case TaskPriority.MEDIUM: return 'drag_handle';
      case TaskPriority.LOW: return 'keyboard_arrow_down';
      default: return 'drag_handle';
    }
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO: return '#ff9800';
      case TaskStatus.IN_PROGRESS: return '#2196f3';
      case TaskStatus.DONE: return '#4caf50';
      default: return '#9e9e9e';
    }
  }

  getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO: return 'radio_button_unchecked';
      case TaskStatus.IN_PROGRESS: return 'schedule';
      case TaskStatus.DONE: return 'check_circle';
      default: return 'radio_button_unchecked';
    }
  }

  getStatusDisplayName(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.IN_PROGRESS: return 'In Progress';
      case TaskStatus.DONE: return 'Done';
      default: return status;
    }
  }

  hasFormChanged(): boolean {
    const formValue = this.taskForm.value;
    
    const currentTags = formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];
    const originalTags = this.originalTask.tags || [];
    
    return (
      formValue.title !== this.originalTask.title ||
      formValue.description !== (this.originalTask.description || '') ||
      formValue.status !== this.originalTask.status ||
      formValue.priority !== this.originalTask.priority ||
      formValue.assignee !== (this.originalTask.assignee || '') ||
      formValue.dueDate !== (this.originalTask.dueDate ? this.formatDateForInput(this.originalTask.dueDate) : '') ||
      JSON.stringify(currentTags.sort()) !== JSON.stringify(originalTags.sort())
    );
  }
}
