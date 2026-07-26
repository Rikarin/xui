import { bootstrapApplication } from '@angular/platform-browser';
import { provideXuiECharts } from '@xui/echarts';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { providePreviews } from './app/core/previews';
import { PREVIEWS } from './generated/previews';

/**
 * The browser entry point, and where everything only the browser runs is provided.
 *
 * The demos and the charting library are both a great deal of code that never executes during a
 * server render — a preview mounts after hydration — and a worker has a size limit. Kept out of
 * `appConfig`, which the server shares, they stay out of the server bundle entirely.
 */
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    providePreviews(PREVIEWS),
    // `@xui/echarts` never imports the library itself, so the chart previews hand it over. Loaded on
    // demand, so only a page with a chart on it pays for it.
    provideXuiECharts({ echarts: () => import('echarts') })
  ]
}).catch(err => console.error(err));
