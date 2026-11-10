import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { environment } from '../environments/environment';

interface CsrfTokenResponse {
  headerName: string;
  token: string;
}

export const apiCredentialsInterceptor: HttpInterceptorFn = (request, next) => {
  const isApiRequest = environment.apiUrl
    ? request.url.startsWith(environment.apiUrl)
    : request.url.startsWith('/api/');

  if (!isApiRequest) {
    return next(request);
  }

  const credentialedRequest = request.clone({ withCredentials: true });
  if (['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(request.method)) {
    return next(credentialedRequest);
  }

  const http = inject(HttpClient);
  return http
    .get<CsrfTokenResponse>(`${environment.apiUrl}/api/auth/csrf`, {
      withCredentials: true,
    })
    .pipe(
      switchMap(({ headerName, token }) =>
        next(credentialedRequest.clone({ setHeaders: { [headerName]: token } })),
      ),
    );
};
