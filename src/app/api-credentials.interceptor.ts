import { HttpInterceptorFn } from '@angular/common/http';

export const apiCredentialsInterceptor: HttpInterceptorFn = (request, next) => {
  // Si la URL contiene /api/ (sin importar si es absoluta o relativa)
  if (request.url.includes('/api/')) {
    const credentialedRequest = request.clone({ 
      withCredentials: true 
    });
    return next(credentialedRequest);
  }

  return next(request);
};