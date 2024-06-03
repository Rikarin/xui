import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaveResetSnackbar, XuiSettings } from './settings';
import { TranslateModule } from '@ngx-translate/core';
import { PortalModule } from '@angular/cdk/portal';
import { XuiButtonModule } from '../button';
import { A11yModule } from '@angular/cdk/a11y';
import { XuiIcon } from '../icon';

@NgModule({
  declarations: [XuiSettings, SaveResetSnackbar],
  imports: [CommonModule, XuiIcon, XuiButtonModule, PortalModule, A11yModule, TranslateModule.forChild()],
  exports: [XuiSettings]
})
export class XuiSettingsModule {}
