import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { XuiConfigService, WithConfig } from '@xui/components';

@Component({
  selector: 'xui-simple-snack-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ data.message | translate }}</div>
    <div *ngIf="hasAction">
      <xui-button size="small" type="raised" color="success" (click)="action()">{{
        data.action | translate
      }}</xui-button>
    </div>`
})
export class SimpleSnackBar implements TextOnlySnackBar {
  @Input() @WithConfig() data!: { message: string; action: string };

  @HostBinding('class.x-snackbar')
  get hostMainClass(): boolean {
    return true;
  }

  constructor(
    public snackBarRef: MatSnackBarRef<SimpleSnackBar>,
    private configService: XuiConfigService
  ) {}

  action(): void {
    this.snackBarRef.dismissWithAction();
  }

  get hasAction(): boolean {
    return !!this.data.action;
  }
}
