import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { XUI_SNACK_BAR_DATA } from './snack-bar-config';

@Component({
  selector: 'xui-simple-snack-bar',
  exportAs: 'xuiSnackBar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="x-snackbar">
    <div>{{ data.message | translate }}</div>
    <div *ngIf="hasAction">
      <xui-button size="small" type="raised" color="success" (click)="action()">{{
        data.action | translate
      }}</xui-button>
    </div>
  </div>`
})
export class SimpleSnackBar implements TextOnlySnackBar {
  constructor(
    public snackBarRef: MatSnackBarRef<SimpleSnackBar>,
    @Inject(XUI_SNACK_BAR_DATA) public data: { message: string; action: string }
  ) {}

  action(): void {
    this.snackBarRef.dismissWithAction();
  }

  get hasAction(): boolean {
    return !!this.data.action;
  }
}
