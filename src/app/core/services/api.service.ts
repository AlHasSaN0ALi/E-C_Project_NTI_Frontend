import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService
  ) {}

  // Generic HTTP methods
  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data);
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data);
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }

  // File upload method
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData);
  }

  // Multiple file upload method
  uploadFiles<T>(endpoint: string, files: File[], additionalData?: any): Observable<T> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('images', file);
    });
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData);
  }

  // Get with custom headers
  getWithHeaders<T>(endpoint: string, headers: HttpHeaders, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { 
      params: httpParams, 
      headers 
    });
  }

  // Post with custom headers
  postWithHeaders<T>(endpoint: string, data: any, headers: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, { headers });
  }

  // Put with custom headers
  putWithHeaders<T>(endpoint: string, data: any, headers: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, { headers });
  }

  // Delete with custom headers
  deleteWithHeaders<T>(endpoint: string, headers: HttpHeaders): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers });
  }

  // Get full URL for an endpoint
  getFullUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  // Get image URL
  getImageUrl(imagePath: string): string {
    return this.environmentService.getImageUrl(imagePath);
  }

  // Get endpoint URL
  getEndpointUrl(endpoint: keyof typeof environment.endpoints): string {
    return this.environmentService.getEndpointUrl(endpoint);
  }
}
