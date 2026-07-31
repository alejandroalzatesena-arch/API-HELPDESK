import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User, UserRole } from 'src/app/models/user.model';
import { AuthResponse, MeResponse } from 'src/app/models/api-response.model';

const STORAGE_ACCESS_KEY = 'helpdesk_access_token';
const STORAGE_REFRESH_KEY = 'helpdesk_refresh_token';
const STORAGE_USER_KEY = 'helpdesk_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(
    this.getStoredUser()
  );

  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get accessToken(): string | null {
    return localStorage.getItem(STORAGE_ACCESS_KEY);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(STORAGE_REFRESH_KEY);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((response) => this.saveSession(response)));
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, { name, email, password })
      .pipe(tap((response) => this.saveSession(response)));
  }

  logout(): Observable<{ message: string }> {
    const refreshToken = this.refreshToken;

    if (!refreshToken) {
      this.clearSession();
      return of({ message: 'Sesión cerrada correctamente.' });
    }

    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/auth/logout`, { refreshToken })
      .pipe(tap(() => this.clearSession()));
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = this.refreshToken;

    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token disponible.'));
    }

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(tap((response) => this.saveSession(response)));
  }

  me(): Observable<User> {
    return this.http.get<MeResponse>(`${environment.apiUrl}/auth/me`).pipe(map((res) => res.user));
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.currentUser;
    return !!user && roles.includes(user.role);
  }

  clearSession(): void {
    localStorage.removeItem(STORAGE_ACCESS_KEY);
    localStorage.removeItem(STORAGE_REFRESH_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    this.currentUserSubject.next(null);
  }

  saveSession(response: AuthResponse): void {
    localStorage.setItem(STORAGE_ACCESS_KEY, response.accessToken);
    localStorage.setItem(STORAGE_REFRESH_KEY, response.refreshToken);

    const previousUser = this.currentUserSubject.value;
    const user: User = {
      id: response.user?.id ?? previousUser?.id ?? '',
      name: response.user?.name ?? previousUser?.name ?? '',
      email: response.user?.email ?? previousUser?.email ?? '',
      role: response.user?.role ?? previousUser?.role ?? 'client',
      createdAt: response.user?.createdAt ?? previousUser?.createdAt,
    };

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
