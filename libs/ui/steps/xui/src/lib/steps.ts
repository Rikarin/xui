import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  model,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XuiStep, type StepStatus } from './step';

/**
 * A step / wizard progress indicator. Wrap `<xui-step>` entries and bind
 * `current` (two-way) to the active index; each step's status is derived
 * (`finish` before, `process` at, `wait` after) unless the step overrides it.
 * With `clickable`, clicking a step moves `current`.
 *
 * ```html
 * <xui-steps [(current)]="step">
 *   <xui-step title="Cart" />
 *   <xui-step title="Pay" description="Card or PayPal" />
 *   <xui-step title="Done" />
 * </xui-steps>
 * ```
 */
@Component({
  selector: 'xui-steps',
  template: `
    @for (step of steps(); track $index; let i = $index, last = $last) {
      <div [class]="itemClass()">
        <button type="button" [class]="headerClass()" [disabled]="!clickable()" (click)="select(i)">
          <span [class]="circleClass(statusAt(i))">
            @if (statusAt(i) === 'finish') {
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
                <path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            } @else if (statusAt(i) === 'error') {
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
              </svg>
            } @else {
              {{ i + 1 }}
            }
          </span>
          <span class="flex flex-col text-left">
            <span [class]="titleClass(statusAt(i))">{{ step.title() }}</span>
            @if (step.description()) {
              <span class="text-foreground-muted text-xs">{{ step.description() }}</span>
            }
          </span>
        </button>
        @if (!last) {
          <span [class]="connectorClass(statusAt(i))"></span>
        }
      </div>
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiSteps {
  readonly class = input<ClassValue>('');

  readonly current = model<number>(0);
  readonly direction = input<'horizontal' | 'vertical'>('horizontal');
  readonly clickable = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly steps = contentChildren(XuiStep);

  protected statusAt(index: number): StepStatus {
    const override = this.steps()[index]?.status();
    if (override) {
      return override;
    }
    const current = this.current();
    return index < current ? 'finish' : index === current ? 'process' : 'wait';
  }

  protected select(index: number): void {
    if (this.clickable()) {
      this.current.set(index);
    }
  }

  private get vertical(): boolean {
    return this.direction() === 'vertical';
  }

  protected readonly computedClass = computed(() =>
    xui('flex', this.direction() === 'vertical' ? 'flex-col gap-1' : 'flex-row items-start', this.class())
  );
  protected readonly itemClass = computed(() =>
    xui('flex', this.vertical ? 'flex-col' : 'flex-1 items-center gap-3 last:flex-none')
  );
  protected readonly headerClass = computed(() =>
    xui(
      'flex items-center gap-3 rounded',
      'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
      this.clickable() ? 'cursor-pointer' : 'cursor-default'
    )
  );

  protected circleClass(status: StepStatus): string {
    return xui(
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
      status === 'process'
        ? 'bg-primary text-primary-foreground border-primary'
        : status === 'finish'
          ? 'border-primary text-primary'
          : status === 'error'
            ? 'border-error text-error'
            : 'border-border text-foreground-muted'
    );
  }

  protected titleClass(status: StepStatus): string {
    return xui(
      'text-sm font-medium',
      status === 'wait' ? 'text-foreground-muted' : status === 'error' ? 'text-error' : 'text-foreground'
    );
  }

  protected connectorClass(status: StepStatus): string {
    const done = status === 'finish';
    return this.vertical
      ? xui('ml-4 min-h-4 w-px flex-1 self-stretch', done ? 'bg-primary' : 'bg-border')
      : xui('h-px flex-1', done ? 'bg-primary' : 'bg-border');
  }
}
