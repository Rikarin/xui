import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Directive,
  effect,
  ElementRef,
  input,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCloseRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';
import { XuiInput } from './input';

/**
 * A non-interactive adornment pinned to the leading edge of an input — an icon,
 * a currency symbol, a short prefix. Pointer events pass through to the input.
 */
// Centre by translate rather than by stretching `inset-y-0`: a sized adornment
// (an `ng-icon` with an explicit height) would over-constrain top+bottom and pin
// itself to the top edge. `top-1/2 -translate-y-1/2` centres it at any height.
// The adornment sizes its own icon, the way a button does: `<ng-icon xui>` defaults to 24px, which
// inside a 30px field leaves 3px of air and reads as an icon that outgrew its box.
@Directive({
  selector: '[xuiInputLeftElement]',
  exportAs: 'xuiInputLeftElement',
  host: {
    class:
      // eslint-disable-next-line local/no-hand-z-index -- the affix floats above the input inside the group, not an overlay
      'absolute start-(--control-padding-sm) top-1/2 z-10 flex -translate-y-1/2 items-center text-foreground-muted [--ng-icon__size:1rem]! [&_ng-icon]:[--ng-icon__size:1rem]! [&_svg]:size-4 [&:has(button)]:pointer-events-auto pointer-events-none'
  }
})
export class XuiInputLeftElement {}

/** The trailing-edge counterpart of {@link XuiInputLeftElement} — often a button. */
@Directive({
  selector: '[xuiInputRightElement]',
  exportAs: 'xuiInputRightElement',
  host: {
    class:
      // eslint-disable-next-line local/no-hand-z-index -- the affix floats above the input inside the group, not an overlay
      'absolute end-(--control-padding-sm) top-1/2 z-10 flex -translate-y-1/2 items-center text-foreground-muted [--ng-icon__size:1rem]! [&_ng-icon]:[--ng-icon__size:1rem]! [&_svg]:size-4 [&:has(button)]:pointer-events-auto pointer-events-none'
  }
})
export class XuiInputRightElement {}

/**
 * Frames a single `[xuiInput]` with optional leading/trailing elements and an
 * optional clear button, reserving the padding the input needs so its text never
 * runs under an adornment.
 *
 * ```html
 * <xui-input-group clearable>
 *   <ng-icon xuiInputLeftElement name="matSearchRound" />
 *   <input xuiInput [(ngModel)]="query" placeholder="Search…" />
 * </xui-input-group>
 * ```
 */
@Component({
  selector: 'xui-input-group',
  imports: [NgIcon, XuiIcon],
  // eslint-disable-next-line local/no-hand-z-index -- the clear button floats above the input inside the group, not an overlay
  template: `
    <ng-content />
    @if (clearable() && hasValue() && !disabled()) {
      <button
        type="button"
        class="text-foreground-muted hover:text-foreground absolute end-(--control-padding-sm) top-1/2 z-10 flex -translate-y-1/2 items-center transition-colors [--ng-icon__size:1rem]! [&_ng-icon]:[--ng-icon__size:1rem]! [&_svg]:size-4"
        aria-label="Clear"
        (click)="clear()"
      >
        <ng-icon xui size="sm" name="matCloseRound" />
      </button>
    }
  `,
  host: {
    '[class]': 'computedClass()',
    '(input)': 'syncValue()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matCloseRound })]
})
export class XuiInputGroup {
  readonly class = input<ClassValue>('');

  /** Show a clear button on the trailing edge whenever the input holds a value. */
  readonly clearable = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  private readonly input = contentChild(XuiInput);
  private readonly inputEl = contentChild(XuiInput, { read: ElementRef });
  private readonly leftElement = contentChild(XuiInputLeftElement);
  private readonly rightElement = contentChild(XuiInputRightElement);

  protected readonly hasValue = signal(false);
  protected readonly disabled = computed(() => !!this.inputEl()?.nativeElement.disabled);

  protected readonly computedClass = computed(() => xui('relative inline-flex items-center', this.class()));

  constructor() {
    // Reserve inner padding for whatever adornments are present. The clear button
    // occupies the same slot as a trailing element, so either one pads the end.
    effect(() => {
      const input = this.input();
      if (!input) {
        return;
      }

      input.padStart.set(!!this.leftElement());
      input.padEnd.set(!!this.rightElement() || this.clearable());

      // Seed from whatever value the input mounted with (attribute or written by
      // a form control), so a pre-filled field shows its clear button right away.
      this.syncValue();
    });
  }

  protected syncValue(): void {
    this.hasValue.set(!!this.inputEl()?.nativeElement.value);
  }

  protected clear(): void {
    const el = this.inputEl()?.nativeElement;
    if (!el) {
      return;
    }

    el.value = '';
    // Drive the CVA / ngModel through the same path a user keystroke would.
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
  }
}
