import {
  provideNgDocApp,
  provideSearchEngine,
  NgDocDefaultSearchEngine,
  providePageSkeleton,
  NG_DOC_DEFAULT_PAGE_SKELETON,
  provideMainPageProcessor,
  NG_DOC_DEFAULT_PAGE_PROCESSORS,
  provideMermaid
} from '@ng-doc/app';
import { NG_DOC_ROUTING, provideNgDocContext } from '@ng-doc/generated';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { ThemingService } from '@xui/theme-core';
import { XUI_CONFIG } from '@xui/components';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';
import { environment } from '../environments/environment';
import { NgxEchartsModule } from 'ngx-echarts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    // provideZoneChangeDetection({ eventCoalescing: true }),
    // provideExperimentalZonelessChangeDetection(),

    importProvidersFrom(
      TranslateModule.forRoot(),
      NgxGoogleAnalyticsModule.forRoot(environment.ga),
      NgxGoogleAnalyticsRouterModule
      // NgxEchartsModule.forRoot({ echarts: () => import('echarts') })
    ),

    ThemingService,
    // Test global configuration and ensure that config is not leaked by directive usage
    {
      provide: XUI_CONFIG,
      useValue: {
        input: {
          size: 'large'
        }
      }
    },

    // TODO: remove after migration
    provideHighlightOptions({
      // lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
      // coreLibraryLoader: () => import('highlight.js/lib/core'),
      // languages: {
      //   typescript: () => import('highlight.js/lib/languages/typescript'),
      //   scss: () => import('highlight.js/lib/languages/scss'),
      //   xml: () => import('highlight.js/lib/languages/xml')
      // }
    }),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideAnimations(),
    provideRouter(
      NG_DOC_ROUTING,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    provideNgDocContext(),
    provideNgDocApp(),
    provideMermaid(),
    provideSearchEngine(NgDocDefaultSearchEngine),
    providePageSkeleton(NG_DOC_DEFAULT_PAGE_SKELETON),
    provideMainPageProcessor(NG_DOC_DEFAULT_PAGE_PROCESSORS)
  ]
};
