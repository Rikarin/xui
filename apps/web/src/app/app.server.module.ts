import { NgModule } from '@angular/core';
import { RootComponent } from './root.component';
import { MatIconRegistry } from '@angular/material/icon';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';
import { environment } from '../environments/environment';
import { NgxEchartsModule } from 'ngx-echarts';
import { ServerModule } from '@angular/platform-server';
import { ThemingService } from '@xui/theme-core';

// TODO: fix this
const routes: Routes = [
  { path: 'theme-designer', loadChildren: () => import('./designer/designer.module').then(x => x.DesignerModule) },
  { path: 'docs', loadChildren: () => import('./docs/docs.module').then(x => x.DocsModule) },
  { path: '', redirectTo: '/docs', pathMatch: 'full' }
];

@NgModule({
  declarations: [RootComponent],
  bootstrap: [RootComponent],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    BrowserAnimationsModule,

    NgxGoogleAnalyticsModule.forRoot(environment.ga),
    NgxGoogleAnalyticsRouterModule,

    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),

    TranslateModule.forRoot(),
    ServerModule
  ],
  providers: [ThemingService, provideHttpClient(withInterceptorsFromDi())]
})
export class AppServerModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer, translations: TranslateService) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('http://localhost:4200/assets/mdi.svg'));

    translations.setDefaultLang('en-US');
  }
}
