import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PortalModule } from '@angular/cdk/portal';
import { SimpleSnackBar } from './simple-snack-bar';
import { XuiButtonModule } from '../button';
import { OverlayModule } from '@angular/cdk/overlay';
import { XuiSnackBar } from './snack-bar';
import { XuiFocusModule } from '../utils/focus.service';

@NgModule({
  imports: [
    CommonModule,
    XuiButtonModule,
    OverlayModule,
    PortalModule,
    SimpleSnackBar,
    TranslateModule.forChild(),
    XuiFocusModule
  ],
  providers: [XuiSnackBar]
})
export class XuiSnackbarModule {}
