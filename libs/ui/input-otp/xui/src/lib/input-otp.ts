import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * A segmented one-time-code / PIN field. A single hidden input drives the whole
 * row — so native caret, selection, paste and autofill (`one-time-code`) all
 * work — while the visible slots render each character. `value` is two-way
 * bindable; `completed` fires once every slot is filled.
 *
 * ```html
 * <xui-input-otp [length]="6" [(value)]="code" (completed)="verify($event)" />
 * ```
 */
@Component({
  selector: 'xui-input-otp',
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <div [class]="rowClass()" (click)="focus()">
      @for (i of slots(); track i) {
        <div [class]="slotClass(i)">
          @if (charAt(i)) {
            <span>{{ mask() ? '•' : charAt(i) }}</span>
          } @else if (showCaret(i)) {
            <span class="bg-foreground h-4 w-px animate-pulse"></span>
          }
        </div>
      }
    </div>

    <input
      #field
      class="absolute inset-0 h-full w-full cursor-default opacity-0 outline-none"
      [value]="value()"
      [attr.inputmode]="inputType() === 'numeric' ? 'numeric' : 'text'"
      [attr.maxlength]="length()"
      [disabled]="disabled()"
      autocomplete="one-time-code"
      aria-label="One-time code"
      (input)="onInput($event)"
      (focus)="focused.set(true)"
      (blur)="focused.set(false)"
    />
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiInputOtp {
  readonly class = input<ClassValue>('');
  readonly length = input<number, NumberInput>(6, { transform: numberAttribute });
  readonly value = model<string>('');
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly inputType = input<'numeric' | 'text'>('numeric');
  /** Render each filled slot as a dot instead of the character. */
  readonly mask = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Fired once every slot is filled. */
  readonly completed = output<string>();

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  protected readonly focused = signal(false);

  protected readonly slots = computed(() => Array.from({ length: this.length() }, (_, i) => i));

  protected charAt(index: number): string {
    return this.value()[index] ?? '';
  }

  /** The caret sits in the first empty slot while focused. */
  protected showCaret(index: number): boolean {
    return this.focused() && index === this.value().length && index < this.length();
  }

  protected focus(): void {
    if (!this.disabled()) {
      this.field().nativeElement.focus();
    }
  }

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const cleaned = (this.inputType() === 'numeric' ? raw.replace(/\D/g, '') : raw).slice(0, this.length());
    this.value.set(cleaned);
    // Keep the native input in sync when sanitising dropped characters.
    (event.target as HTMLInputElement).value = cleaned;
    if (cleaned.length === this.length()) {
      this.completed.emit(cleaned);
    }
  }

  protected readonly computedClass = computed(() => xui('relative inline-flex', this.class()));
  protected readonly rowClass = computed(() => xui('flex items-center gap-2'));

  protected slotClass(index: number): string {
    const active = this.focused() && index === this.value().length;
    return xui(
      'flex size-(--control-height-lg) items-center justify-center rounded-md border text-lg font-medium tabular-nums transition-colors',
      'border-border bg-surface text-foreground',
      active && 'border-primary ring-primary/30 ring-2',
      this.disabled() && 'opacity-50'
    );
  }
}
