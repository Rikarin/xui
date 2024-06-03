import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaveResetSnackbarComponent, SettingsComponent } from './settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { PortalModule } from '@angular/cdk/portal';
import { XuiButtonModule } from '../button';
import { A11yModule } from '@angular/cdk/a11y';
import { XuiIconComponent } from '../icon';

@NgModule({
  declarations: [SettingsComponent, SaveResetSnackbarComponent],
  imports: [CommonModule, XuiIconComponent, XuiButtonModule, PortalModule, A11yModule, TranslateModule.forChild()],
  exports: [SettingsComponent]
})
export class XuiSettingsModule {}
