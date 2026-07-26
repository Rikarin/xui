import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

export type XuiStepStatus = 'wait' | 'process' | 'finish' | 'error';

/**
 * One step inside {@link XuiSteps}. `title`/`description` describe it; `status`
 * overrides the status the parent would otherwise derive from `current`.
 */
@Component({
  selector: 'xui-step',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiStep {
  readonly title = input<string>('');
  readonly description = input<string>('');
  /** Force a status instead of deriving it from the active step. */
  readonly status = input<XuiStepStatus>();
}
