import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { XuiTitleModule } from 'xui';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, XuiTitleModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
