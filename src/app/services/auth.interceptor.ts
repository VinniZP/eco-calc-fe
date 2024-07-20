import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export function getSession() {
  const token = localStorage.getItem('authtoken');
  const tokenType = localStorage.getItem('authtokentype');
  if (token && tokenType) {
    return {
      token,
      tokenType,
    };
  }
  return null;
}

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const session = getSession();
  if (session) {
    req = req.clone({
      setHeaders: {
        'x-auth-token': `${session.token}`,
        'x-auth-token-type': `${session.tokenType}`,
      },
    });
  }
  return next(req);
}
