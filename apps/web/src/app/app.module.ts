import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';
import { environment } from '../environments/environment';
import { MatIconRegistry } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { RootComponent } from './root.component';
import { XUI_CONFIG } from '@xui/components';
import { ThemingService } from '@xui/theme-core';
import { provideHighlightOptions } from 'ngx-highlightjs';

const routes: Routes = [
  { path: 'theme-designer', loadChildren: () => import('./designer/designer.module').then(x => x.DesignerModule) },
  { path: 'docs', loadChildren: () => import('./docs/docs.module').then(x => x.DocsModule) },
  { path: '', redirectTo: '/docs', pathMatch: 'full' }
];

@NgModule({
  declarations: [RootComponent],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    NgxGoogleAnalyticsModule.forRoot(environment.ga),
    NgxGoogleAnalyticsRouterModule,

    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),

    TranslateModule.forRoot()
  ],
  providers: [
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
    provideHighlightOptions({
      lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      languages: {
        typescript: () => import('highlight.js/lib/languages/typescript'),
        scss: () => import('highlight.js/lib/languages/scss'),
        xml: () => import('highlight.js/lib/languages/xml')
      }
    })
  ],
  bootstrap: [RootComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer, translations: TranslateService) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));

    translations.setDefaultLang('en-US');
  }
}
