import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  input
} from '@angular/core';
import { xui } from '@xui/core';
import { XFormFieldControl } from '@xui/core/form-field';
import type { ClassValue } from 'clsx';
import { XuiError } from './error';

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
    '[class]': 'computedClass()'
  }
})
export class XuiFormField {
  readonly control = contentChild(XFormFieldControl);
  readonly errorChildren = contentChildren(XuiError);
  readonly class = input<ClassValue>('');

  protected computedClass = computed(() => xui('block space-y-2', this.class()));

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
