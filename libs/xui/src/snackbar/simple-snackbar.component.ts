import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { XUI_SNACK_BAR_DATA } from './snack-bar-config';

@Component({
  selector: 'simple-snack-bar',
  exportAs: 'xuiSnackBar',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div>
      {{ data.message }}
    </div>

    <div *ngIf="hasAction">
      <button xui xSize="sm" xType="raised" xColor="success" (click)="action()">{{ data.action }}</button>
    </div>`,
  host: {
    class: 'xui-simple-snackbar'
  }
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
