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
import { injectXuiFormFieldConfig } from './form-field.token';

let nextId = 0;

export const formFieldRootVariants = cva('', {
  variants: {
    inline: {
      false: 'block space-y-2',
      true: 'flex items-baseline gap-3'
    }
  },
  defaultVariants: { inline: false }
});

/** `color` tints the label and helper text with a deliberate accent. */
export const formFieldColorText = cva('', {
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

export type XuiFormFieldColor = NonNullable<VariantProps<typeof formFieldColorText>['color']>;

/**
 * Wraps a control with its label, helper text and validation message, and wires the three together.
 *
 * ```html
 * <xui-form-field label="Email" labelInfo="(required)" helperText="We never share it.">
 *   <input xuiInput [formControl]="email" />
 *   <xui-error>Enter a valid address.</xui-error>
 * </xui-form-field>
 * ```
 *
 * It finds the projected control through `XFormFieldControl`, so any xUI control registered under that
 * token works — input, textarea, select, numeric-input, file-input, html-select. The `<label for>` is
 * pointed at the real focusable element (the control's `controlId` when it wraps an inner input, else
 * its host, which the field gives an id if it has none), and the projected `xui-error` replaces the
 * hint only while the control actually reports an error. Throws if it contains no control.
 */
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
  private readonly config = injectXuiFormFieldConfig();

  /** The projected control, found through `XFormFieldControl`. Read-only; the field throws if there is none. */
  readonly control = contentChild(XFormFieldControl);
  private readonly controlEl = contentChild(XFormFieldControl, { read: ElementRef });
  /** The projected `xui-error` messages. Shown in place of the hint while the control reports an error. */
  readonly errorChildren = contentChildren(XuiError);

  /** Extra classes, merged into the component's own rather than replacing them. */
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
  readonly color = input<XuiFormFieldColor>(this.config.color);

  /** Lay the label beside the control rather than above it. */
  readonly inline = input<boolean, BooleanInput>(this.config.inline, { transform: booleanAttribute });

  private readonly generatedId = `xui-form-field-${nextId++}`;

  protected readonly computedClass = computed(() =>
    xui(formFieldRootVariants({ inline: this.inline() }), this.class())
  );

  protected readonly labelClass = computed(() =>
    xui('text-foreground block text-sm font-medium', formFieldColorText({ color: this.color() }))
  );

  protected readonly helperClass = computed(() =>
    xui('block text-sm text-foreground-subtle', formFieldColorText({ color: this.color() }))
  );

  /**
   * The id the `<label>` points at — the control's declared `controlId` when it
   * has one (the focusable element inside a wrapping component), else the host
   * element's own id, else the id we assign below. The fallback branches agree
   * with the effect's assignment.
   */
  protected readonly labelFor = computed(() => {
    if (!this.label()) {
      return null;
    }

    const providedId = this.control()?.controlId?.();

    if (providedId) {
      return providedId;
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

    // Give the projected control our generated id (unless it already has one, or
    // it points the label at an inner element via `controlId`) so the rendered
    // <label for> genuinely points at it.
    effect(() => {
      const el = this.controlEl()?.nativeElement as HTMLElement | undefined;
      if (this.label() && el && !el.id && !this.control()?.controlId?.()) {
        el.id = this.generatedId;
      }
    });
  }
}
