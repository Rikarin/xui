import { BrowserModule } from '@angular/platform-browser';
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
} from 'xui';
import { RouterModule } from '@angular/router';
import { CardComponent } from './components/card/card.component';
import { OverviewComponent } from './components/overview/overview.component';
import { GettingStartedComponent } from './components/getting-started/getting-started.component';
import { ButtonComponent } from './components/button/button.component';
import { BannerComponent } from './components/banner/banner.component';

const routes = [
  {
    path: '',
    component: OverviewComponent,
    pathMatch: 'full',
  },
  { path: 'getting-started', component: GettingStartedComponent },
  { path: 'card', component: CardComponent },
  { path: 'button', component: ButtonComponent },
  { path: 'banner', component: BannerComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    OverviewComponent,
    GettingStartedComponent,
    CardComponent,
    ButtonComponent,
    BannerComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    BrowserAnimationsModule,
    HighlightModule,

    XuiTitleModule,
    XuiLayoutModule,
    XuiCardModule,
    XuiMenuModule,
    XuiButtonModule,
    XuiBannerModule,
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        fullLibraryLoader: () => import('highlight.js'),
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
