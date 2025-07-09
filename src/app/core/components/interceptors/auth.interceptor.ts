import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthStore } from '../../store/auth.store';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthStore) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.auth.token();
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}
