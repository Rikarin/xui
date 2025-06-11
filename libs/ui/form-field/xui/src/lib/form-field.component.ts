import { ChangeDetectionStrategy, Component, computed, contentChild, contentChildren, effect } from '@angular/core';
import { XFormFieldControl } from '@xui/core/form-field';
import { XuiErrorComponent } from './error.component';

@Component({
  selector: 'xui-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />

    @switch (hasDisplayedMessage()) {
      @case ('error') {
        <ng-content select="xui-error" />
      }
      @default {
        <ng-content select="xui-hint" />
      }
    }
  `,
  host: {
    class: 'block space-y-2'
  }
})
export class XuiFormFieldComponent {
  readonly control = contentChild(XFormFieldControl);
  readonly errorChildren = contentChildren(XuiErrorComponent);

  protected readonly hasDisplayedMessage = computed<'error' | 'hint'>(() =>
    this.errorChildren() && this.errorChildren().length > 0 && this.control()?.errorState() ? 'error' : 'hint'
  );

  constructor() {
    effect(() => {
      if (!this.control()) {
        throw new Error('xui-form-field must contain an XFormFieldControl.');
      }
    });
  }
}
