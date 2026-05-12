
import { Injectable,inject, provideAppInitializer } from '@angular/core';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {ConfigService, initConfig, UserService, initUser} from './data/data-service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideAppInitializer(() => initConfig(inject(ConfigService))()),
    provideAppInitializer(() => initUser(inject(UserService))())
  ]
};
