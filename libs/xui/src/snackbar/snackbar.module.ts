import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { PortalModule } from '@angular/cdk/portal';
import { SimpleSnackBar } from './simple-snackbar.component';
import { XuiButtonModule } from '../button';

@NgModule({
  declarations: [SimpleSnackBar],
  imports: [CommonModule, MatSnackBarModule, XuiButtonModule, PortalModule, TranslateModule.forChild()]
})
export class XuiSnackbarModule {}
