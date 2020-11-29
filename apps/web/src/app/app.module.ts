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
} from 'xui';
import { RouterModule } from '@angular/router';
import { CardComponent } from './components/card/card.component';
import { OverviewComponent } from './components/overview/overview.component';
import { GettingStartedComponent } from './components/getting-started/getting-started.component';
import { ButtonComponent } from './components/button/button.component';

const routes = [
  {
    path: '',
    component: OverviewComponent,
    pathMatch: 'full',
  },
  { path: 'getting-started', component: GettingStartedComponent },
  { path: 'card', component: CardComponent },
  { path: 'button', component: ButtonComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    OverviewComponent,
    GettingStartedComponent,
    CardComponent,
    ButtonComponent,
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
