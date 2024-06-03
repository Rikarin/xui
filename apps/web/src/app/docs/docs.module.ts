import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './components/overview/overview.component';
import { GettingStartedComponent } from './components/getting-started/getting-started.component';
import { ThemingComponent } from './components/theming/theming.component';
import { ComponentsModule } from './components/components.module';
import { TranslateService } from '@ngx-translate/core';
import { CdkMenuModule } from '@angular/cdk/menu';
import { XuiCardModule, XuiIcon, XuiLayoutModule, XuiMenuModule, XuiSwitch } from '@xui/components';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';

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
  declarations: [AppComponent, ThemingComponent, OverviewComponent, GettingStartedComponent],
  imports: [
    CommonModule,
    ComponentsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    HighlightModule,
    HighlightPlusModule,

    CdkMenuModule,
    XuiIcon,
    XuiCardModule,
    XuiSwitch,
    XuiLayoutModule,
    XuiMenuModule
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
