import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './components/overview/overview.component';
import { GettingStartedComponent } from './components/getting-started/getting-started.component';
import { ThemingComponent } from './components/theming/theming.component';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from './app.component';
import { ColorsComponent } from './components/colors/colors.component';

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      { path: '', component: OverviewComponent },
      { path: 'getting-started', component: GettingStartedComponent },
      { path: 'theming', component: ThemingComponent },
      { path: 'colors', component: ColorsComponent },

      { path: 'charts', loadChildren: () => import('./charts/charts.module').then(x => x.ChartsModule) },
      {
        path: 'xui',
        loadChildren: () => import('./xui-components/xui-components.module').then(x => x.XuiComponentsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
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
