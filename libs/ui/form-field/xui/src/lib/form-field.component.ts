import { Component, computed, contentChild, contentChildren, effect } from '@angular/core';
import { XCoreFormFieldControl } from '@xui/core/form-field';
import { XuiErrorComponent } from './error.component';

@Component({
  selector: 'xui-form-field',
  imports: [],
  template: `
    <ng-content></ng-content>

    @switch (hasDisplayedMessage()) {
      @case ('error') {
        <ng-content select="xui-error"></ng-content>
      }
      @default {
        <ng-content select="xui-hint"></ng-content>
      }
    }
  `,
  host: {
    class: 'block space-y-2'
  }
})
export class XuiFormFieldComponent {
  readonly control = contentChild(XCoreFormFieldControl);
  readonly errorChildren = contentChildren(XuiErrorComponent);

  protected readonly hasDisplayedMessage = computed<'error' | 'hint'>(() =>
    this.errorChildren() && this.errorChildren().length > 0 && this.control()?.errorState() ? 'error' : 'hint'
  );

  constructor() {
    effect(() => {
      if (!this.control()) {
        throw new Error('xui-form-field must contain an XCoreFormFieldControl.');
      }
    });
  }
}
