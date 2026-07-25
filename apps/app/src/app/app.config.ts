import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideXuiECharts } from '@xui/echarts';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    // `@xui/echarts` never imports the library itself, so the chart previews need it handed over.
    // Loaded on demand, so only a page with a chart on it pays for it.
    provideXuiECharts({ echarts: () => import('echarts') }),
    provideRouter(
      routes,
      // The component page takes its resolved doc as a signal input rather than reading the route.
      withComponentInputBinding(),
      // Deep links have to land on the heading they name, and going back to a page has to land
      // where it was left.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    )
  ]
};
