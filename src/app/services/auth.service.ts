import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = '/api/auth';
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly authenticated = signal(
    this.isBrowser && localStorage.getItem('authenticated') === 'true',
  );

  login(username: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/login`, { username, password });
  }

  register(username: string, password: string, rol: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, { username, password, rol }, {
      responseType: 'text',
    });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {});
  }

  markAuthenticated(): void {
    if (this.isBrowser) {
      localStorage.setItem('authenticated', 'true');
    }
    this.authenticated.set(true);
  }

  clearAuthentication(): void {
    if (this.isBrowser) {
      localStorage.removeItem('authenticated');
    }
    this.authenticated.set(false);
  }

  isLoggedIn(): boolean {
    return this.authenticated();
  }
}
