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
  XuiTooltipModule,
  XuiInputModule,
  XuiIconModule,
  XuiSettingsModule,
  XuiTabModule,
  XuiContextMenuModule,
  XuiProgressModule
} from 'xui';
import { RouterModule, Routes } from '@angular/router';
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
import { ThemingComponent } from './components/theming/theming.component';
import { InputComponent } from './components/input/input.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './components/settings/settings.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { CdkMenuModule } from '@angular/cdk/menu';
import { ProgressComponent } from './components/progress/progress.component';
import { ExampleComponent } from './components/example/example.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { XuiCheckboxModule } from '../../../../libs/xui/src/checkbox';
import { SwitchComponent } from './components/switch/switch.component';
import { XuiSwitchModule } from '../../../../libs/xui/src/switch/switch.module';

const routes: Routes = [
  {
    path: '',
    component: OverviewComponent,
    pathMatch: 'full'
  },
  { path: 'getting-started', component: GettingStartedComponent },
  { path: 'theming', component: ThemingComponent },
  { path: 'card', component: CardComponent },
  { path: 'button', component: ButtonComponent },
  { path: 'input', component: InputComponent },
  { path: 'banner', component: BannerComponent },
  { path: 'breadcrumb', component: BreadcrumbComponent },
  { path: 'layout', component: LayoutComponent },
  { path: 'select', component: SelectComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'tabs', component: TabsComponent },
  { path: 'context-menu', component: ContextMenuComponent },
  { path: 'progress', component: ProgressComponent },
  { path: 'checkbox', component: CheckboxComponent },
  { path: 'switch', component: SwitchComponent }
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
    SelectComponent,
    ThemingComponent,
    InputComponent,
    SettingsComponent,
    TabsComponent,
    ContextMenuComponent,
    ProgressComponent,
    ExampleComponent,
    CheckboxComponent,
    SwitchComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HighlightModule,
    HttpClientModule,

    NgxGoogleAnalyticsModule.forRoot(environment.ga),
    NgxGoogleAnalyticsRouterModule,

    TranslateModule.forRoot(),

    CdkMenuModule,

    XuiTitleModule,
    XuiLayoutModule,
    XuiCardModule,
    XuiMenuModule,
    XuiButtonModule,
    XuiBannerModule,
    XuiTooltipModule,
    XuiInputModule,
    XuiIconModule,
    XuiProgressModule,
    XuiSettingsModule,
    XuiTabModule,
    XuiContextMenuModule,
    XuiCheckboxModule,
    XuiSwitchModule
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
