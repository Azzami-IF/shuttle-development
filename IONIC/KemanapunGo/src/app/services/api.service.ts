import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private injector: Injector
  ) { }

  private getHeaders(includeAuth: boolean = true) {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      Accept: 'application/json'
    };

    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const router = this.injector.get(Router);
      router.navigate(['/login'], { replaceUrl: true });
    }
    return throwError(() => error);
  }

  get(path: string, params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/${path}`, {
      headers: this.getHeaders(),
      params,
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  post(path: string, data: any, params?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${path}`, data, {
      headers: this.getHeaders(),
      params,
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  postForm(path: string, data: Record<string, string>, params?: any): Observable<any> {
    const body = new URLSearchParams(data).toString();
    const headers = this.getHeaders(false).set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post(`${this.apiUrl}/${path}`, body, {
      headers,
      params,
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  put(path: string, data: any, params?: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${path}`, data, {
      headers: this.getHeaders(),
      params,
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  delete(path: string, params?: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${path}`, {
      headers: this.getHeaders(),
      params,
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  postFormData(path: string, data: FormData, params?: any): Observable<any> {
    // For FormData, we must NOT set Content-Type header
    // Browser will automatically set it with the correct multipart/form-data boundary
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      Accept: 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.http.post(`${this.apiUrl}/${path}`, data, {
      headers: new HttpHeaders(headers),
      params,
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }
}
