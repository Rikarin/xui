import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  ElementRef,
  input,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { XFormFieldControl } from '@xui/core/form-field';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { XuiError } from './error';

let nextId = 0;

const rootVariants = cva('', {
  variants: {
    inline: {
      false: 'block space-y-2',
      true: 'flex items-baseline gap-3'
    }
  },
  defaultVariants: { inline: false }
});

/** `color` tints the label and helper text with a deliberate accent. */
const colorText = cva('', {
  variants: {
    color: {
      none: '',
      primary: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error'
    }
  },
  defaultVariants: { color: 'none' }
});

export type FormFieldColor = NonNullable<VariantProps<typeof colorText>['color']>;

@Component({
  selector: 'xui-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (label() || subLabel()) {
      <div [class]="inline() ? 'shrink-0' : ''">
        @if (label()) {
          <label [attr.for]="labelFor()" [class]="labelClass()">
            {{ label() }}
            @if (labelInfo()) {
              <span class="text-foreground-subtle font-normal">{{ labelInfo() }}</span>
            }
          </label>
        }
        @if (subLabel()) {
          <span class="text-foreground-muted block text-xs">{{ subLabel() }}</span>
        }
      </div>
    }

    <div [class]="inline() ? 'flex-1 space-y-1.5' : 'space-y-1.5'">
      <ng-content />

      @switch (hasDisplayedMessage()) {
        @case ('error') {
          <ng-content select="xui-error" />
        }
        @default {
          <ng-content select="xui-hint" />
          @if (helperText()) {
            <span [class]="helperClass()">{{ helperText() }}</span>
          }
        }
      }
    </div>
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiFormField {
  readonly control = contentChild(XFormFieldControl);
  private readonly controlEl = contentChild(XFormFieldControl, { read: ElementRef });
  readonly errorChildren = contentChildren(XuiError);

  readonly class = input<ClassValue>('');

  /** The primary label rendered above (or beside, when `inline`) the control. */
  readonly label = input<string>('');

  /** Secondary text shown next to the label, e.g. "(optional)". */
  readonly labelInfo = input<string>('');

  /** A smaller description under the label. */
  readonly subLabel = input<string>('');

  /** Muted helper text under the control, hidden while an error is shown. */
  readonly helperText = input<string>('');

  /** A deliberate accent for the label and helper text. */
  readonly color = input<FormFieldColor>('none');

  /** Lay the label beside the control rather than above it. */
  readonly inline = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  private readonly generatedId = `xui-form-field-${nextId++}`;

  protected readonly computedClass = computed(() => xui(rootVariants({ inline: this.inline() }), this.class()));

  protected readonly labelClass = computed(() =>
    xui('text-foreground block text-sm font-medium', colorText({ color: this.color() }))
  );

  protected readonly helperClass = computed(() =>
    xui('block text-sm text-foreground-subtle', colorText({ color: this.color() }))
  );

  /**
   * The id the `<label>` points at — the control's own id when it has one, else
   * the id we assign below. Both branches agree with the effect's assignment.
   */
  protected readonly labelFor = computed(() => {
    if (!this.label()) {
      return null;
    }

    const el = this.controlEl()?.nativeElement as HTMLElement | undefined;
    return el?.id || this.generatedId;
  });

  protected readonly hasDisplayedMessage = computed<'error' | 'hint'>(() =>
    this.errorChildren() && this.errorChildren().length > 0 && this.control()?.errorState() ? 'error' : 'hint'
  );

  constructor() {
    effect(() => {
      if (!this.control()) {
        throw new Error('xui-form-field must contain an XFormFieldControl.');
      }
    });

    // Give the projected control our generated id (unless it already has one) so
    // the rendered <label for> genuinely points at it.
    effect(() => {
      const el = this.controlEl()?.nativeElement as HTMLElement | undefined;
      if (this.label() && el && !el.id) {
        el.id = this.generatedId;
      }
    });
  }
}
