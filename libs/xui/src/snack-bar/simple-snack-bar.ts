import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { SnackBarRef } from './snack-bar-ref';
import { XUI_SNACK_BAR_DATA } from './snack-bar.types';
import { XuiButtonModule } from '../button';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Interface for a simple snack bar component that has a message and a single action.
 */
export interface TextOnlySnackBar {
  data: { message: string; action: string };
  snackBarRef: SnackBarRef<TextOnlySnackBar>;
  action: () => void;
  hasAction: boolean;
}

@Component({
  selector: 'xui-simple-snack-bar',
  exportAs: 'xuiSnackBar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [XuiButtonModule, TranslateModule],
  template: `<div>{{ data.message | translate }}</div>
    @if (hasAction) {
      <xui-button size="small" type="raised" color="success" (click)="action()">
        {{ data.action | translate }}
      </xui-button>
    }`,
  host: {
    class: 'x-simple-snack-bar'
  }
})
export class SimpleSnackBar implements TextOnlySnackBar {
  constructor(
    public snackBarRef: SnackBarRef<SimpleSnackBar>,
    @Inject(XUI_SNACK_BAR_DATA) public data: { message: string; action: string }
  ) {}

  action(): void {
    this.snackBarRef.dismissWithAction();
  }

  get hasAction(): boolean {
    return !!this.data.action;
  }
}
