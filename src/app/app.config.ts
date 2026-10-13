import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
<<<<<<< HEAD
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
=======
    provideRouter(routes), provideClientHydration(), provideHttpClient()
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
  ]
};
