import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  signal,
  viewChild,
  type Signal
} from '@angular/core';
import { ControlValueAccessor, type NgControl } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matUploadFileRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { injectUniqueId } from '@xui/core/a11y';
import { XFormFieldControl } from '@xui/core/form-field';
import { createXErrorState, createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { XuiIcon } from '@xui/icon';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiFileInputConfig } from './file-input.token';

export const fileInputVariants = cva(
  'border-border bg-surface-inset text-foreground-muted focus-within:border-focus flex cursor-pointer items-center gap-2 rounded-lg border pe-1 transition-colors has-disabled:cursor-not-allowed has-disabled:opacity-50',
  {
    variants: {
      size: {
        md: 'h-(--control-height-md) ps-(--control-padding-md) text-sm',
        sm: 'h-(--control-height-sm) ps-(--control-padding-sm) text-xs'
      },
      fill: {
        true: 'w-full',
        false: 'w-auto'
      }
    },
    defaultVariants: { size: 'md', fill: false }
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
  encapsulation: ViewEncapsulation.None,
  providers: [
    provideXValueAccessor(() => XuiFileInput),
    {
      provide: XFormFieldControl,
      useExisting: forwardRef(() => XuiFileInput)
    }
  ],
  template: `
    <label [class]="computedClass()">
      <ng-icon xui size="sm" name="matUploadFileRound" class="shrink-0" />
      <span class="min-w-0 flex-1 truncate" [class.text-foreground]="hasSelection()">{{ label() }}</span>
      <span
        class="bg-surface-raised border-border text-foreground my-0.5 me-0.5 flex shrink-0 items-center rounded-md border px-(--control-padding-sm) text-xs font-medium"
      >
        {{ buttonText() }}
      </span>
      <input
        #field
        [id]="fieldId"
        type="file"
        class="sr-only"
        [attr.accept]="accept()"
        [multiple]="multiple()"
        [disabled]="isDisabled()"
        [attr.aria-label]="ariaLabel() ?? text()"
        (change)="onSelect(field.files)"
        (blur)="cva.markTouched()"
      />
    </label>
  `,
  host: {
    class: 'block'
  }
})
export class XuiFileInput implements ControlValueAccessor, XFormFieldControl {
  private readonly config = injectXuiFileInputConfig();
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly formState = createXErrorState();
  protected readonly fieldId = injectUniqueId('xui-file-input');

  /** Error state for `xui-form-field`, derived from the optional bound form control. */
  readonly errorState = this.formState.errorState;

  /** Points the form field's `<label for>` at the real file input, not the host. */
  readonly controlId: Signal<string | null> = signal(this.fieldId).asReadonly();

  get ngControl(): NgControl | null {
    return this.formState.ngControl();
  }

  /** The user-defined classes on the trigger. Merged last so they win. */
  readonly class = input<ClassValue>('');
  /** Control height, from the shared control scale. */
  readonly size = input<XuiFileInputVariants['size']>(this.config.size);
  /** Stretch to the available width instead of hugging its contents. */
  readonly fill = input<boolean, BooleanInput>(this.config.fill, { transform: booleanAttribute });

  /** Placeholder shown before anything is chosen. */
  readonly text = input('Choose a file…');
  /** Label of the browse button. */
  readonly buttonText = input('Browse');
  /**
   * Passed to the native input's `accept` — a comma-separated list of extensions or MIME types. A filter for the file
   * chooser, not validation: check the chosen files yourself.
   */
  readonly accept = input<string | null>(null);
  /** Allow more than one file to be chosen. */
  readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Accessible name for the control. Falls back to the displayed text, which is the file name once one is chosen. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  /** Block interaction and dim the control. */
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly cva = createXValueAccessor<FileList | null>({
    // The browser forbids programmatically setting a file input's value, so the
    // only write we can honour is a reset to empty.
    onWrite: value => {
      if (!value) {
        this.selection.set(null);
        this.field().nativeElement.value = '';
      }
    },
    disabled: this.disabled
  });
  protected readonly isDisabled = this.cva.disabled;

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

  protected onSelect(files: FileList | null): void {
    const value = files && files.length ? files : null;
    this.selection.set(value);
    this.cva.notifyChange(value);
    this.cva.markTouched();
  }

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
