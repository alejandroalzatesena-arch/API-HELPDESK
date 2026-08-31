import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, filter, skip, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenRefreshInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject$ = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (this.isTokenExpiredError(error) && !this.isRefreshRequest(request.url)) {
          return this.handleTokenExpired(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private isTokenExpiredError(error: HttpErrorResponse): boolean {
    return error.status === 401 && error.error?.error?.code === 'TOKEN_EXPIRED';
  }

  private isRefreshRequest(url: string): boolean {
    return url.includes('/auth/refresh');
  }

  private handleTokenExpired(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.authService.refreshToken) {
      this.authService.clearSession();
      return throwError(() => new Error('La sesión ha expirado. Inicia sesión nuevamente.'));
    }

    if (this.isRefreshing) {
      return this.waitForNewToken().pipe(
        switchMap((token) => next.handle(this.withToken(request, token))),
        catchError(() => {
          this.authService.clearSession();
          return throwError(() => new Error('No se pudo renovar la sesión.'));
        })
      );
    }

    this.isRefreshing = true;
    this.refreshSubject$.next(null);

    return this.authService.refresh().pipe(
      switchMap((authResponse) => {
        this.isRefreshing = false;
        this.refreshSubject$.next(authResponse.accessToken);
        return next.handle(this.withToken(request, authResponse.accessToken));
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.refreshSubject$.next(null);
        this.authService.clearSession();
        return throwError(() => error);
      })
    );
  }

  private waitForNewToken(): Observable<string | null> {
    return this.refreshSubject$.pipe(
      skip(1),
      distinctUntilChanged(),
      take(1)
    );
  }

  private withToken(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
    if (!token) {
      throw new Error('No se pudo renovar la sesión.');
    }
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}
