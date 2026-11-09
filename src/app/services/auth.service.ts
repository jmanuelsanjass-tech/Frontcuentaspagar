import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthenticatedUser {
  username: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly currentUserState = signal(
    this.isBrowser ? this.readStoredUser() : null,
  );
  private readonly authenticated = signal(
    this.isBrowser && localStorage.getItem('authenticated') === 'true',
  );
  readonly currentUser = this.currentUserState.asReadonly();
  readonly userRoles = computed(() => this.currentUserState()?.roles ?? []);

  login(username: string, password: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/login`, { username, password });
  }

  register(username: string, password: string, rol: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, { username, password, rol }, {
      responseType: 'text',
    });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {});
  }

  startSession(response: unknown): boolean {
    if (!isAuthenticatedUser(response)) {
      return false;
    }

    const user: AuthenticatedUser = {
      username: response.username.trim(),
      roles: response.roles.map((role) => role.trim().toUpperCase()),
    };

    if (this.isBrowser) {
      localStorage.setItem('authenticatedUser', JSON.stringify(user));
      localStorage.setItem('authenticated', 'true');
    }
    this.currentUserState.set(user);
    this.authenticated.set(true);
    return true;
  }

  clearAuthentication(): void {
    if (this.isBrowser) {
      localStorage.removeItem('authenticatedUser');
      localStorage.removeItem('authenticated');
    }
    this.currentUserState.set(null);
    this.authenticated.set(false);
  }

  isLoggedIn(): boolean {
    return this.authenticated();
  }

  tieneRol(rol: string): boolean {
    return this.userRoles().includes(rol.trim().toUpperCase());
  }

  private readStoredUser(): AuthenticatedUser | null {
    const storedUser = localStorage.getItem('authenticatedUser');
    if (!storedUser) {
      return null;
    }

    try {
      const user: unknown = JSON.parse(storedUser);
      if (!isAuthenticatedUser(user)) {
        console.warn('La sesión guardada no contiene un usuario válido.');
        return null;
      }
      return {
        username: user.username.trim(),
        roles: user.roles.map((role) => role.trim().toUpperCase()),
      };
    } catch (error) {
      console.warn('No se pudo leer el usuario guardado de la sesión.', error);
      return null;
    }
  }
}

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    'username' in value &&
    typeof value.username === 'string' &&
    value.username.trim().length > 0 &&
    'roles' in value &&
    Array.isArray(value.roles) &&
    value.roles.every((role) => typeof role === 'string' && role.trim().length > 0)
  );
}
