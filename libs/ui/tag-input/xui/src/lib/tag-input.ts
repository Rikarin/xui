import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCloseRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import type { XChangeFn, XTouchFn } from '@xui/core/forms';
import { XuiIcon } from '@xui/icon';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

const tagInputContainerVariants = cva(
  [
    'flex min-h-(--control-height-md) flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface-inset px-(--control-padding-sm) py-0.5 text-sm',
    'focus-within:border-focus transition-colors',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50'
  ],
  {
    variants: {
      fill: { true: 'w-full', false: 'min-w-72' }
    },
    defaultVariants: { fill: false }
  }
);

export type XuiTagInputVariants = VariantProps<typeof tagInputContainerVariants>;

export const XUI_TAG_INPUT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => XuiTagInput),
  multi: true
};

/**
 * A token/chip input: type and press Enter (or the separator) to add a tag, click
 * a tag's ✕ or press Backspace on an empty field to remove one. `[(values)]`
 * two-way binding and `ControlValueAccessor` over a `string[]`.
 */
@Component({
  selector: 'xui-tag-input',
  imports: [NgIcon, XuiIcon],
  template: `
    <!-- Clicking empty container space focuses the real input, which is itself
         focusable and keyboard-operable, so no separate key handler is needed. -->
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <div [class]="containerClass()" (click)="focusInput($event)">
      @for (tag of values(); track $index) {
        <span class="bg-surface-raised text-foreground inline-flex items-center gap-1 rounded px-2 py-0.5">
          {{ tag }}
          @if (!isDisabled()) {
            <button
              type="button"
              class="text-foreground-muted hover:text-foreground -me-0.5 flex items-center"
              [attr.aria-label]="'Remove ' + tag"
              (click)="removeAt($index); $event.stopPropagation()"
            >
              <ng-icon xui size="xs" name="matCloseRound" />
            </button>
          }
        </span>
      }

      <input
        #field
        type="text"
        class="text-foreground placeholder:text-foreground-subtle min-w-24 flex-1 bg-transparent outline-none"
        [value]="draft()"
        [placeholder]="values().length ? '' : placeholder()"
        [disabled]="isDisabled()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (paste)="onPaste($event)"
        (blur)="onBlur()"
      />
    </div>
  `,
  host: {
    '[class]': 'computedClass()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null'
  },
  providers: [XUI_TAG_INPUT_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matCloseRound })]
})
export class XuiTagInput implements ControlValueAccessor {
  readonly class = input<ClassValue>('');

  /** The current tags. Two-way bindable with `[(values)]`. */
  readonly values = model<string[]>([]);

  readonly placeholder = input<string>('');
  readonly fill = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Character that also commits the current draft (besides Enter). */
  readonly separator = input<string>(',');

  /** Commit the draft when the field loses focus. */
  readonly addOnBlur = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Split pasted text on the separator and add each piece. */
  readonly addOnPaste = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /** Reject a tag that already exists. */
  readonly allowDuplicates = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Emits each tag as it is added. */
  readonly added = output<string>();
  /** Emits each tag as it is removed. */
  readonly removed = output<string>();

  protected readonly draft = signal('');
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  private onChange?: XChangeFn<string[]>;
  private onTouched?: XTouchFn;
  private readonly disabledByForm = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  protected readonly computedClass = computed(() => xui('block', this.class()));
  protected readonly containerClass = computed(() => xui(tagInputContainerVariants({ fill: this.fill() })));

  protected onInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === this.separator()) {
      event.preventDefault();
      this.commitDraft();
      return;
    }

    // Backspace on an empty field trims the last tag.
    if (event.key === 'Backspace' && this.draft() === '' && this.values().length) {
      event.preventDefault();
      this.removeAt(this.values().length - 1);
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    if (!this.addOnPaste()) {
      return;
    }

    const text = event.clipboardData?.getData('text') ?? '';
    if (text.includes(this.separator())) {
      event.preventDefault();
      this.addTokens(text);
      this.draft.set('');
    }
  }

  protected onBlur(): void {
    if (this.addOnBlur()) {
      this.commitDraft();
    }

    this.onTouched?.();
  }

  protected focusInput(event: MouseEvent): void {
    // Clicking the container (but not a tag's button) focuses the field.
    if (this.isDisabled()) {
      return;
    }

    (event.currentTarget as HTMLElement).querySelector('input')?.focus();
  }

  private commitDraft(): void {
    this.addTokens(this.draft());
    this.draft.set('');
    // Clear the native field directly too: if the draft round-tripped within a
    // single change-detection pass, the `[value]` binding may not diff as changed.
    const el = this.field()?.nativeElement;
    if (el) {
      el.value = '';
    }
  }

  private addTokens(raw: string): void {
    const tokens = raw
      .split(this.separator())
      .map(t => t.trim())
      .filter(Boolean);
    if (!tokens.length) {
      return;
    }

    const next = [...this.values()];
    for (const token of tokens) {
      if (!this.allowDuplicates() && next.includes(token)) {
        continue;
      }

      next.push(token);
      this.added.emit(token);
    }

    if (next.length !== this.values().length) {
      this.commit(next);
    }
  }

  protected removeAt(index: number): void {
    if (this.isDisabled()) {
      return;
    }

    const tag = this.values()[index];
    const next = this.values().filter((_, i) => i !== index);
    this.commit(next);
    this.removed.emit(tag);
  }

  private commit(next: string[]): void {
    this.values.set(next);
    this.onChange?.(next);
  }

  // --- ControlValueAccessor ---
  writeValue(value: string[]): void {
    this.values.set(value ?? []);
  }

  registerOnChange(fn: XChangeFn<string[]>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: XTouchFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }
}
