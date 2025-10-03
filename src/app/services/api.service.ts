import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, Column } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ============= COLUMN API METHODS =============

  getColumns(): Observable<Column[]> {
    return this.http.get<Column[]>(`${this.baseUrl}/columns`);
  }

  createColumn(column: Partial<Column>): Observable<Column> {
    return this.http.post<Column>(`${this.baseUrl}/columns`, column);
  }

  updateColumn(id: string, column: Partial<Column>): Observable<Column> {
    return this.http.put<Column>(`${this.baseUrl}/columns/${id}`, column);
  }

  deleteColumn(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/columns/${id}`);
  }

  reorderColumns(columns: Column[]): Observable<Column[]> {
    return this.http.put<Column[]>(`${this.baseUrl}/columns/reorder`, { columns });
  }

  // ============= TASK API METHODS =============

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks`);
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/tasks/${id}`);
  }

  createTask(task: Partial<Task> & { columnId: string }): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/tasks`, task);
  }

  updateTask(id: string, task: Partial<Task> & { columnId?: string }): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/tasks/${id}`, task);
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tasks/${id}`);
  }

  // ============= UTILITY METHODS =============

  initializeDatabase(): Observable<any> {
    return this.http.post(`${this.baseUrl}/init`, {});
  }

  clearAllData(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/clear`);
  }
}
