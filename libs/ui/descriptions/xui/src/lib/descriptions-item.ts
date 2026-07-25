import { NumberInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  numberAttribute,
  TemplateRef,
  viewChild,
  ViewEncapsulation
} from '@angular/core';

/**
 * One label/value entry inside {@link XuiDescriptions}. Its projected content is
 * the value; `label` is the key and `span` widens it across grid columns.
 */
@Component({
  selector: 'xui-descriptions-item',
  template: `<ng-template #content><ng-content /></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiDescriptionsItem {
  readonly label = input<string>('');
  /** How many grid columns this item occupies. */
  readonly span = input<number, NumberInput>(1, { transform: numberAttribute });

  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}
