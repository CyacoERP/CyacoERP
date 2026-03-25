import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthServicio } from '../../modules/auth/services/auth.servicio';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authServicio: AuthServicio) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authServicio.obtenerToken();

    if (token) {
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
      return next.handle(clonedReq);
    }

    return next.handle(req);
  }
}
