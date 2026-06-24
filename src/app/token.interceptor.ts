import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    // 1. INIEZIONE: Mette il token del localStorage nella busta della richiesta
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    // 2. ASCOLTO DELLA RISPOSTA
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const tokenFresco = event.headers.get('X-Refresh-Token');
          if (tokenFresco) {
            localStorage.setItem('token', tokenFresco); // Aggiorna il disco fisso!
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          localStorage.clear();
          this.router.navigate(['/login']); // Sbatte fuori l'utente scaduto
        }
        return throwError(() => error);
      })
    );
  }
}