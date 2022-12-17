import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaveResetSnackbarComponent, SettingsComponent } from './settings.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { XuiIconModule } from '../icon';
import { PortalModule } from '@angular/cdk/portal';
import { XuiButtonModule } from '../button';
import { A11yModule } from '@angular/cdk/a11y';

@NgModule({
  declarations: [SettingsComponent, SaveResetSnackbarComponent],
  imports: [
    CommonModule,
    MatSnackBarModule,
    XuiIconModule,
    XuiButtonModule,
    PortalModule,
    A11yModule,
    TranslateModule.forChild()
  ],
  exports: [SettingsComponent]
})
export class XuiSettingsModule {}
