import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  signal,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matUploadFileRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import type { ChangeFn, TouchFn } from '@xui/core/forms';
import { XuiIcon } from '@xui/icon';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

const fileInputVariants = cva(
  'border-border bg-surface-inset text-foreground-muted focus-within:border-focus flex cursor-pointer items-center gap-2 rounded-lg border pr-1 transition-colors has-disabled:cursor-not-allowed has-disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-11 pl-3 text-base',
        sm: 'h-9 pl-2.5 text-sm'
      },
      fill: {
        true: 'w-full',
        false: 'w-auto'
      }
    },
    defaultVariants: { size: 'default', fill: false }
  }
);

export type XuiFileInputVariants = VariantProps<typeof fileInputVariants>;

/**
 * A styled file picker.
 *
 * ```html
 * <xui-file-input [(ngModel)]="files" accept="image/*" multiple />
 * ```
 *
 * Wraps a real hidden `<input type="file">`, so the native picker, `accept` and
 * `multiple` all work — this only dresses the trigger and shows the selection.
 * Its value is the `FileList` (or `null`), and it is a `ControlValueAccessor`.
 * A file input is write-only in the DOM for security, so `writeValue` can only
 * clear it, never pre-fill a selection.
 */
@Component({
  selector: 'xui-file-input',
  imports: [NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matUploadFileRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => XuiFileInput), multi: true }],
  template: `
    <label [class]="computedClass()">
      <ng-icon xui size="md" name="matUploadFileRound" class="shrink-0" />
      <span class="min-w-0 flex-1 truncate" [class.text-foreground]="hasSelection()">{{ label() }}</span>
      <span
        class="bg-surface-raised border-border text-foreground shrink-0 rounded-md border px-3 py-1 text-sm font-medium"
      >
        {{ buttonText() }}
      </span>
      <input
        #field
        type="file"
        class="sr-only"
        [attr.accept]="accept()"
        [multiple]="multiple()"
        [disabled]="disabledState()"
        [attr.aria-label]="ariaLabel() ?? text()"
        (change)="onSelect(field.files)"
        (blur)="onTouched?.()"
      />
    </label>
  `,
  host: {
    class: 'block'
  }
})
export class XuiFileInput implements ControlValueAccessor {
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  /** The user-defined classes on the trigger. Merged last so they win. */
  readonly class = input<ClassValue>('');
  readonly size = input<XuiFileInputVariants['size']>('default');
  readonly fill = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Placeholder shown before anything is chosen. */
  readonly text = input('Choose a file…');
  readonly buttonText = input('Browse');
  readonly accept = input<string | null>(null);
  readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  private readonly disabledByForm = signal(false);
  protected readonly disabledState = computed(() => this.disabled() || this.disabledByForm());

  private readonly selection = signal<FileList | null>(null);
  protected readonly hasSelection = computed(() => (this.selection()?.length ?? 0) > 0);

  /** The current selection: the picker's filename(s), or the placeholder. */
  protected readonly label = computed(() => {
    const files = this.selection();

    if (!files || files.length === 0) {
      return this.text();
    }

    return files.length === 1 ? files[0].name : `${files.length} files`;
  });

  protected readonly computedClass = computed(() =>
    xui(fileInputVariants({ size: this.size(), fill: this.fill() }), this.class())
  );

  private onChange?: ChangeFn<FileList | null>;
  protected onTouched?: TouchFn;

  protected onSelect(files: FileList | null): void {
    const value = files && files.length ? files : null;
    this.selection.set(value);
    this.onChange?.(value);
    this.onTouched?.();
  }

  writeValue(value: FileList | null): void {
    // The browser forbids programmatically setting a file input's value, so the
    // only write we can honour is a reset to empty.
    if (!value) {
      this.selection.set(null);
      this.field().nativeElement.value = '';
    }
  }

  registerOnChange(fn: ChangeFn<FileList | null>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }
}
