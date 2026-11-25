import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

export const apiCredentialsInterceptor: HttpInterceptorFn = (request, next) => {
  // Verificamos si es una petición a nuestra API
  const isApiRequest = environment.apiUrl
    ? request.url.startsWith(environment.apiUrl)
    : request.url.startsWith('/api/');

  if (!isApiRequest) {
    return next(request);
  }

  // Leemos el token que guardamos en el login
  const token = localStorage.getItem('token');

  // Si hay token, clonamos la petición y agregamos la cabecera Authorization
  if (token) {
    const clonedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  // Si no hay token, la petición sigue su curso (ej. para el login)
  return next(request);
};