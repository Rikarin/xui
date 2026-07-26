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
 * One resizable pane inside {@link XuiSplitter}. `defaultSize` is its initial
 * percentage (0 = auto-distribute the remaining space); `min`/`max` bound
 * resizing.
 */
@Component({
  selector: 'xui-splitter-panel',
  template: `<ng-template #content><ng-content /></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiSplitterPanel {
  /** Initial size as a percentage; 0 means "share the leftover space equally". */
  readonly defaultSize = input<number, NumberInput>(0, { transform: numberAttribute });
  /** Smallest size this panel may be dragged to, as a percentage of the splitter. */
  readonly min = input<number, NumberInput>(0, { transform: numberAttribute });
  /** Largest size this panel may be dragged to, as a percentage of the splitter. */
  readonly max = input<number, NumberInput>(100, { transform: numberAttribute });

  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}
