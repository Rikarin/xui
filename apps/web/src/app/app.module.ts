import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HighlightModule, HIGHLIGHT_OPTIONS, HighlightOptions } from 'ngx-highlightjs';

import { AppComponent } from './app.component';
import { XuiLayoutModule, XuiCardModule, XuiMenuModule, XuiIconModule, XuiSwitchModule } from 'xui';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './components/overview/overview.component';
import { GettingStartedComponent } from './components/getting-started/getting-started.component';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';
import { environment } from '../environments/environment';
import { MatIconRegistry } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { ThemingComponent } from './components/theming/theming.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CdkMenuModule } from '@angular/cdk/menu';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { ComponentsModule } from './components/components.module';
import { NgxEchartsModule } from 'ngx-echarts';

const routes: Routes = [
  {
    path: '',
    component: OverviewComponent,
    pathMatch: 'full'
  },
  { path: 'getting-started', component: GettingStartedComponent },
  { path: 'theming', component: ThemingComponent },

  { path: 'charts', loadChildren: () => import('./charts/charts.module').then(x => x.ChartsModule) },
  { path: 'xui', loadChildren: () => import('./xui-components/xui-components.module').then(x => x.XuiComponentsModule) }
];

@NgModule({
  declarations: [AppComponent, OverviewComponent, GettingStartedComponent, ThemingComponent],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HighlightModule,
    HighlightPlusModule,

    NgxGoogleAnalyticsModule.forRoot(environment.ga),
    NgxGoogleAnalyticsRouterModule,

    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),

    TranslateModule.forRoot(),
    ComponentsModule,
    CdkMenuModule,
    XuiLayoutModule,
    XuiMenuModule,
    XuiIconModule,
    XuiCardModule,
    XuiSwitchModule
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: <HighlightOptions>{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        lineNumbersLoader: () => import('highlightjs-line-numbers.js'),
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          typescript: () => import('highlight.js/lib/languages/typescript'),
          scss: () => import('highlight.js/lib/languages/scss'),
          xml: () => import('highlight.js/lib/languages/xml')
        }
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer, translations: TranslateService) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));

    translations.setDefaultLang('en-US');
    translations.setTranslation('en-US', {
      xui: {
        settings: {
          save_changes_text: 'Save you changes before continue',
          save: 'Save',
          reset: 'Reset'
        },
        image_upload: {
          save: 'Save',
          no_image: 'No Image',
          change_image: 'Change Image'
        }
      },

      examples: {
        hello_world: 'Hello World!',
        random_string: 'Translated string'
      }
    });
  }
}
