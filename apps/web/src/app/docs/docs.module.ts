import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './components/overview/overview.component';
import { GettingStartedComponent } from './components/getting-started/getting-started.component';
import { ThemingComponent } from './components/theming/theming.component';
import { HIGHLIGHT_OPTIONS, HighlightModule, HighlightOptions } from 'ngx-highlightjs';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { ComponentsModule } from './components/components.module';
import { TranslateService } from '@ngx-translate/core';
import { CdkMenuModule } from '@angular/cdk/menu';
import { XuiCardModule, XuiIconComponent, XuiLayoutModule, XuiMenuModule, XuiSwitchComponent } from 'xui';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      { path: '', component: OverviewComponent },
      { path: 'getting-started', component: GettingStartedComponent },
      { path: 'theming', component: ThemingComponent },

      { path: 'charts', loadChildren: () => import('./charts/charts.module').then(x => x.ChartsModule) },
      {
        path: 'xui',
        loadChildren: () => import('./xui-components/xui-components.module').then(x => x.XuiComponentsModule)
      }
    ]
  }
];

@NgModule({
  declarations: [AppComponent, ThemingComponent, GettingStartedComponent],
  imports: [
    CommonModule,
    ComponentsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    HighlightModule,
    HighlightPlusModule,

    CdkMenuModule,
    XuiIconComponent,
    XuiCardModule,
    XuiSwitchComponent,
    XuiLayoutModule,
    XuiMenuModule
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
  ]
})
export class DocsModule {
  constructor(translations: TranslateService) {
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
