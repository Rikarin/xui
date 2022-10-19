import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaveResetSnackbarComponent, XuiSettingsComponent } from './settings.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { XuiIconModule } from '../icon';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
  declarations: [XuiSettingsComponent, SaveResetSnackbarComponent],
  imports: [CommonModule, MatSnackBarModule, TranslateModule.forChild(), XuiIconModule, PortalModule],
  exports: [XuiSettingsComponent]
})
export class XuiSettingsModule {}
