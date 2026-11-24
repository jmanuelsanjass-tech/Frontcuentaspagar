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

  // Solo clonamos la petición agregando withCredentials: true
  // Esto asegura que la cookie JSESSIONID viaje al backend y regrese al navegador.
  const credentialedRequest = request.clone({ 
    withCredentials: true 
  });

  return next(credentialedRequest);
};