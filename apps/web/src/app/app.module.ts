import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import { AppComponent } from './app.component';
import { XuiLayoutModule, XuiTitleModule, XuiCardModule } from 'xui';
import { RouterModule } from '@angular/router';
import { CardComponent } from './components/card/card.component';
import { OverviewComponent } from './components/overview/overview.component';

const routes = [
  {
    path: '',
    component: OverviewComponent,
    pathMatch: 'full',
  },
  { path: 'card', component: CardComponent },
];

@NgModule({
  declarations: [AppComponent, OverviewComponent, CardComponent],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    BrowserAnimationsModule,
    HighlightModule,

    XuiTitleModule,
    XuiLayoutModule,
    XuiCardModule,
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
