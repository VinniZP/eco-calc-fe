import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export function getSession() {
  const storedData = localStorage.getItem('worldTicketData');

  if (!storedData) {
    return {};
  }

  try {
    const parsedData = JSON.parse(storedData);
    
    if (parsedData.worldTicket) {
      return {
        'X-Auth-Token': parsedData.worldTicket
      };
    }

    return {};
  } catch {
    return {};
  }
}

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const session = getSession();
  if (session) {
    req = req.clone({
      setHeaders: session,
    });
  }
  return next(req);
}

