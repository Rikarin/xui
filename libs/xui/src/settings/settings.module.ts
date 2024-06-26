import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiSettings } from './settings';
import { TranslateModule } from '@ngx-translate/core';
import { PortalModule } from '@angular/cdk/portal';
import { XuiButtonModule } from '../button';
import { A11yModule } from '@angular/cdk/a11y';
import { XuiIcon } from '../icon';
import { SaveResetSnackbar } from './settings-snackbar';
import { XuiFocusModule } from '../utils/focus.service';

@NgModule({
  declarations: [XuiSettings, SaveResetSnackbar],
  imports: [
    CommonModule,
    XuiIcon,
    XuiButtonModule,
    PortalModule,
    A11yModule,
    TranslateModule.forChild(),
    XuiFocusModule
  ],
  exports: [XuiSettings]
})
export class XuiSettingsModule {}
