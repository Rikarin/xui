import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideXuiECharts } from '@xui/echarts';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // `@xui/echarts` never imports the charting library itself, so the app hands it over — loaded on
    // demand, so a route without a chart on it never pays for it.
    provideXuiECharts({ echarts: () => import('echarts') }),
    provideRouter(
      routes,
      // Detail routes take their id straight off the path as a signal input.
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    )
  ]
};
