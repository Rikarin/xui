import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { xui } from '@xui/core';
import type { ChangeFn, TouchFn } from '@xui/core/forms';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

const editableVariants = cva('block w-full rounded-sm bg-transparent transition-colors', {
  variants: {
    editing: {
      false:
        'cursor-text hover:bg-surface-inset/60 data-disabled:cursor-not-allowed data-disabled:hover:bg-transparent',
      true: 'outline-focus outline-2'
    }
  },
  defaultVariants: { editing: false }
});

export type XuiEditableTextVariants = VariantProps<typeof editableVariants>;

export const XUI_EDITABLE_TEXT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => XuiEditableText),
  multi: true
};

/**
 * Inline click-to-edit text: shows a label until clicked, then swaps to a field.
 * Enter (or blur) confirms, Escape reverts. `multiline` uses a textarea; there
 * Enter inserts a newline unless `confirmOnEnterKey` is set.
 */
@Component({
  selector: 'xui-editable-text',
  imports: [],
  template: `
    @if (editing()) {
      @if (multiline()) {
        <textarea
          #field
          [class]="fieldClass()"
          [value]="draft()"
          [attr.maxlength]="maxLength() ?? null"
          [placeholder]="placeholder()"
          rows="1"
          (input)="onInput($event)"
          (keydown)="onKeydown($event)"
          (blur)="confirm()"
        ></textarea>
      } @else {
        <input
          #field
          type="text"
          [class]="fieldClass()"
          [value]="draft()"
          [attr.maxlength]="maxLength() ?? null"
          [placeholder]="placeholder()"
          (input)="onInput($event)"
          (keydown)="onKeydown($event)"
          (blur)="confirm()"
        />
      }
    } @else {
      <span
        [class]="displayClass()"
        [attr.data-disabled]="isDisabled() ? '' : null"
        [attr.role]="isDisabled() ? null : 'button'"
        [attr.tabindex]="isDisabled() ? null : 0"
        (click)="startEdit()"
        (focus)="startEdit()"
        (keydown.enter)="startEdit(); $event.preventDefault()"
        (keydown.space)="startEdit(); $event.preventDefault()"
        >{{ value() || placeholder() }}</span
      >
    }
  `,
  host: {
    '[class]': 'computedClass()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null'
  },
  providers: [XUI_EDITABLE_TEXT_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiEditableText implements ControlValueAccessor {
  readonly class = input<ClassValue>('');

  /** The confirmed text. Two-way bindable with `[(value)]`. */
  readonly value = model<string>('');

  readonly placeholder = input<string>('');
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly multiline = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** In multiline mode, whether Enter confirms rather than inserting a newline. */
  readonly confirmOnEnterKey = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Select the whole value when editing starts. */
  readonly selectAllOnFocus = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  readonly maxLength = input<number | null, NumberInput>(null, {
    transform: (v: NumberInput) => (v == null || v === '' ? null : numberAttribute(v))
  });

  /** Emits the confirmed value. */
  readonly confirmed = output<string>();
  /** Emits when editing is abandoned via Escape. */
  readonly cancelled = output<void>();
  /** Emits when editing begins. */
  readonly edited = output<void>();
  /** Emits the draft on every keystroke while editing. */
  readonly changed = output<string>();

  protected readonly editing = signal(false);
  protected readonly draft = signal('');

  private readonly field = viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('field');

  private onChange?: ChangeFn<string>;
  private onTouched?: TouchFn;
  private readonly disabledByForm = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  protected readonly computedClass = computed(() => xui('block', this.class()));
  protected readonly displayClass = computed(() =>
    xui(editableVariants({ editing: false }), 'px-1.5 py-1', !this.value() && 'text-foreground-subtle')
  );
  protected readonly fieldClass = computed(() =>
    xui(editableVariants({ editing: true }), 'resize-none px-1.5 py-1 text-foreground')
  );

  constructor() {
    // Focus (and optionally select) the field as soon as editing turns on.
    effect(() => {
      if (!this.editing()) {
        return;
      }

      const el = this.field()?.nativeElement;
      if (el) {
        el.focus();
        if (untracked(() => this.selectAllOnFocus())) {
          el.select();
        }
      }
    });
  }

  protected startEdit(): void {
    if (this.isDisabled() || this.editing()) {
      return;
    }

    this.draft.set(this.value());
    this.editing.set(true);
    this.edited.emit();
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.draft.set(next);
    this.changed.emit(next);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancel();
      return;
    }

    const enterConfirms = !this.multiline() || this.confirmOnEnterKey();
    if (event.key === 'Enter' && enterConfirms && !event.shiftKey) {
      event.preventDefault();
      this.confirm();
    }
  }

  protected confirm(): void {
    if (!this.editing()) {
      return;
    }

    const next = this.draft();
    this.editing.set(false);
    this.value.set(next);
    this.confirmed.emit(next);
    this.onChange?.(next);
    this.onTouched?.();
  }

  protected cancel(): void {
    if (!this.editing()) {
      return;
    }

    this.editing.set(false);
    this.draft.set(this.value());
    this.cancelled.emit();
    this.onTouched?.();
  }

  // --- ControlValueAccessor ---
  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: ChangeFn<string>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }
}
