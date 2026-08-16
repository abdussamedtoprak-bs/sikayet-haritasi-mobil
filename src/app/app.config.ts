import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, getApps } from 'firebase/app';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

// Firebase'i bir kez başlat.
// getApps() kontrolü, SSR'da her istekte yeniden başlatılmasını engeller.
if (!getApps().length) {
  initializeApp(environment.firebase);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration()
  ]
};