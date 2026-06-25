import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    let finalUrl = request.url;
    if (finalUrl.includes('localhost:3000')) {
      finalUrl = finalUrl.replace('http://localhost:3000', environment.apiUrl);
    }

    if (token) {
      request = request.clone({
        url: finalUrl,
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    } else {
      request = request.clone({
        url: finalUrl
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          alert("Sessione scaduta o Credenziali Errate");
          localStorage.clear();
          this.router.navigate(['/login']);
        }
        else if (error.status === 403) {
          alert("Accesso negato: non hai i permessi necessari per questa operazione.");
        }

        return throwError(() => error);
      })
    );
  }
}