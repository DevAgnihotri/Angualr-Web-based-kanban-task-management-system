import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface AddColumnData {
  existingColumns: string[];
}

export interface AddColumnResult {
  title: string;
  position: number;
}

@Component({
  selector: 'app-add-column-dialog',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './add-column-dialog.component.html',
  styleUrl: './add-column-dialog.component.css'
})
export class AddColumnDialogComponent {
  columnForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddColumnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddColumnData
  ) {
    this.columnForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(25),
        this.noWhitespaceValidator,
        this.uniqueTitleValidator.bind(this)
      ]],
      position: ['', [Validators.required]]
    });
  }

  // Custom validator to prevent whitespace-only titles
  private noWhitespaceValidator(control: any) {
    if (control.value && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

  // Custom validator to ensure unique column titles
  private uniqueTitleValidator(control: any) {
    if (control.value && this.data?.existingColumns) {
      const titleExists = this.data.existingColumns
        .map(title => title.toLowerCase().trim())
        .includes(control.value.toLowerCase().trim());
      
      if (titleExists) {
        return { titleExists: true };
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.columnForm.valid) {
      const formValue = this.columnForm.value;
      const result: AddColumnResult = {
        title: formValue.title.trim(),
        position: parseInt(formValue.position, 10)
      };
      
      this.dialogRef.close(result);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.columnForm.controls).forEach(key => {
      const control = this.columnForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper method to get form control errors for display
  getFieldError(fieldName: string): string {
    const control = this.columnForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (control.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
      }
      if (control.errors['whitespace']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot be empty or contain only spaces`;
      }
      if (control.errors['titleExists']) {
        return 'A column with this title already exists';
      }
    }
    return '';
  }
}