import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import {
  type ApplicationConfig,
  inject,
  PLATFORM_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideXuiECharts } from '@xui/echarts';
import { routes } from './app.routes';
import { HEADING_SCROLL_OFFSET } from './shared/heading-anchor';

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
    ),
    provideAppInitializer(() => {
      // Where a heading lands when a link names it. The router's anchor scrolling does not use
      // `scrollIntoView` — it scrolls the window to the element's own offset — so `scroll-margin`
      // on the heading is ignored and the offset has to be handed to the scroller instead. It is
      // read on every jump, which is what keeps it honest when the window is resized.
      if (isPlatformBrowser(inject(PLATFORM_ID))) {
        const scroller = inject(ViewportScroller);

        scroller.setOffset(() => [0, HEADING_SCROLL_OFFSET()]);
      }
    })
  ]
};
