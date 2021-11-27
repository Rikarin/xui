import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import { AppComponent } from './app.component';
import {
  XuiLayoutModule,
  XuiTitleModule,
  XuiCardModule,
  XuiMenuModule,
  XuiButtonModule,
  XuiBannerModule,
  XuiTooltipModule
} from 'xui';
import { RouterModule } from '@angular/router';
import { CardComponent } from './components/card/card.component';
import { OverviewComponent } from './components/overview/overview.component';
import { GettingStartedComponent } from './components/getting-started/getting-started.component';
import { ButtonComponent } from './components/button/button.component';
import { BannerComponent } from './components/banner/banner.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { LayoutComponent } from './components/layout/layout.component';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';
import { environment } from '../environments/environment';
import { SelectComponent } from './components/select/select.component';
import { MatIconRegistry } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';

const routes = [
  {
    path: '',
    component: OverviewComponent,
    pathMatch: 'full'
  },
  { path: 'getting-started', component: GettingStartedComponent },
  { path: 'card', component: CardComponent },
  { path: 'button', component: ButtonComponent },
  { path: 'banner', component: BannerComponent },
  { path: 'breadcrumb', component: BreadcrumbComponent },
  { path: 'layout', component: LayoutComponent },
  { path: 'select', component: SelectComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    OverviewComponent,
    GettingStartedComponent,
    CardComponent,
    ButtonComponent,
    BannerComponent,
    BreadcrumbComponent,
    LayoutComponent,
    SelectComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    BrowserAnimationsModule,
    HighlightModule,
    HttpClientModule,

    NgxGoogleAnalyticsModule.forRoot(environment.ga),
    NgxGoogleAnalyticsRouterModule,

    XuiTitleModule,
    XuiLayoutModule,
    XuiCardModule,
    XuiMenuModule,
    XuiButtonModule,
    XuiBannerModule,
    XuiTooltipModule
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        fullLibraryLoader: () => import('highlight.js')
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
  }
}
