import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  constructor() {}

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

  get(path: string, params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/${path}`, {
      headers: this.getHeaders(),
      params,
    });
  }

  post(path: string, data: any, params?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${path}`, data, {
      headers: this.getHeaders(),
      params,
    });
  }

  postForm(path: string, data: Record<string, string>, params?: any): Observable<any> {
    const body = new URLSearchParams(data).toString();
    const headers = this.getHeaders(false).set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post(`${this.apiUrl}/${path}`, body, {
      headers,
      params,
    });
  }

  put(path: string, data: any, params?: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${path}`, data, {
      headers: this.getHeaders(),
      params,
    });
  }

  delete(path: string, params?: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${path}`, {
      headers: this.getHeaders(),
      params,
    });
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
    });
  }
}
