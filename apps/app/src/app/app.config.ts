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
import { routes } from './app.routes';

/**
 * How far down the window a heading lands when the router jumps to it: half the viewport, less half
 * a heading, which leaves it in the middle of the screen rather than tucked under the sticky header.
 *
 * It has to agree with the `scroll-margin` `xuiProseAnchor` puts on the heading, which is what the
 * browser's own scroll uses — the one that runs on a page loaded with a fragment already in the URL,
 * and on a plain `#` link from the outline.
 */
const HEADING_SCROLL_OFFSET = () => window.innerHeight / 2 - 24;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
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
