import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthServicio } from '../../modules/auth/services/auth.servicio';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authServicio: AuthServicio, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authServicio.obtenerToken();

    const peticion = token
      ? next.handle(req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) }))
      : next.handle(req);

    return peticion.pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado o inválido — limpiar sesión y redirigir a login
          this.authServicio.logout();
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
