import { FocusMonitor } from '@angular/cdk/a11y';
import { NgStyle, isPlatformBrowser } from '@angular/common';
import {
  type AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  type OnDestroy,
  PLATFORM_ID,
  Renderer2,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChangeFn, TouchFn } from '@xui/core/forms';

export const XCORE_CHECKBOX_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => XCoreCheckboxComponent),
  multi: true
};

export function indeterminateBooleanAttribute(value: unknown): XCoreCheckboxValue {
  if (value === 'indeterminate') {
    return 'indeterminate';
  }

  return booleanAttribute(value);
}

const CONTAINER_POST_FIX = '-checkbox';

@Component({
  selector: 'x-core-checkbox',
  imports: [NgStyle],
  template: `
    <input
      #checkBox
      tabindex="-1"
      type="checkbox"
      role="checkbox"
      [ngStyle]="{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: '0'
      }"
      [id]="id()"
      [name]="name()"
      [value]="value()"
      [checked]="isChecked()"
      [required]="required()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="ariaLabelledby()"
      [attr.aria-describedby]="ariaDescribedby()"
      [attr.aria-required]="required() || null"
      [attr.aria-checked]="ariaChecked()"
    />
    <ng-content />
  `,
  host: {
    '[attr.tabindex]': 'state().disabled() ? "-1" : "0"',
    '[attr.data-state]': 'dataState()',
    '[attr.data-focus-visible]': 'focusVisible()',
    '[attr.data-focus]': 'focused()',
    '[attr.data-disabled]': 'state().disabled()',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-describedby]': 'null',
    '[attr.id]': 'hostId()',
    '[attr.name]': 'hostName()'
  },
  providers: [XCORE_CHECKBOX_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XCoreCheckboxComponent implements AfterContentInit, OnDestroy {
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _focusVisible = signal(false);
  private readonly _focused = signal(false);

  readonly focusVisible = this._focusVisible.asReadonly();
  readonly focused = this._focused.asReadonly();
  readonly checked = model<XCoreCheckboxValue>(false);
  readonly isChecked = this.checked.asReadonly();

  protected readonly dataState = computed(() => {
    const checked = this.checked();
    return checked === 'indeterminate' ? 'indeterminate' : checked ? 'checked' : 'unchecked';
  });
  protected readonly ariaChecked = computed(() => {
    const checked = this.checked();
    return checked === 'indeterminate' ? 'mixed' : checked ? 'true' : 'false';
  });
  protected readonly value = computed(() => {
    const checked = this.checked();
    return checked === 'indeterminate' ? '' : checked ? 'on' : 'off';
  });

  /** Used to set the id on the underlying input element. */
  readonly id = input<string | null>(null);
  protected readonly hostId = computed(() => (this.id() ? this.id() + CONTAINER_POST_FIX : null));

  /** Used to set the name attribute on the underlying input element. */
  readonly name = input<string | null>(null);
  protected readonly hostName = computed(() => (this.name() ? this.name() + CONTAINER_POST_FIX : null));

  /** Used to set the aria-label attribute on the underlying input element. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  /** Used to set the aria-labelledby attribute on the underlying input element. */
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });
  readonly ariaDescribedby = input<string | null>(null, { alias: 'aria-describedby' });

  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly state = computed(() => ({
    disabled: signal(this.disabled())
  }));

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onChange: ChangeFn<XCoreCheckboxValue> = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: TouchFn = () => {};

  readonly checkbox = viewChild.required<ElementRef<HTMLInputElement>>('checkBox');
  readonly changed = output<XCoreCheckboxValue>();

  constructor() {
    effect(() => {
      const parent = this.renderer.parentNode(this.elementRef.nativeElement);
      if (!parent) {
        return;
      }

      // TODO: check if this works
      // check if parent is a label and assume it is for this checkbox
      if (parent?.tagName === 'LABEL') {
        this.renderer.setAttribute(parent, 'data-disabled', this.state().disabled() ? 'true' : 'false');
        return;
      }

      if (!this.isBrowser) {
        return;
      }

      const label = parent?.querySelector(`label[for="${this.id()}"]`);
      if (!label) {
        return;
      }

      this.renderer.setAttribute(label, 'data-disabled', this.state().disabled() ? 'true' : 'false');
    });
  }

  @HostListener('click', ['$event'])
  @HostListener('keyup.space', ['$event'])
  @HostListener('keyup.enter', ['$event'])
  toggle(event: Event) {
    if (this.state().disabled()) return;
    event.preventDefault();

    const previousChecked = this.checked();
    this.checked.set(previousChecked === 'indeterminate' ? true : !previousChecked);
    this.onChange(!previousChecked);
    this.changed.emit(!previousChecked);
  }

  ngAfterContentInit() {
    this.focusMonitor.monitor(this.elementRef, true).subscribe(focusOrigin => {
      if (focusOrigin) this._focused.set(true);

      if (focusOrigin === 'keyboard' || focusOrigin === 'program') {
        this._focusVisible.set(true);
      }

      if (!focusOrigin) {
        // When a focused element becomes disabled, the browser *immediately* fires a blur event.
        // Angular does not expect events to be raised during change detection, so any state
        // change (such as a form control's ng-touched) will cause a changed-after-checked error.
        // See https://github.com/angular/angular/issues/17793. To work around this, we defer
        // telling the form control it has been touched until the next tick.
        Promise.resolve().then(() => {
          this._focusVisible.set(false);
          this._focused.set(false);
          this.onTouched();
        });
      }
    });

    this.checkbox().nativeElement.indeterminate = this.checked() === 'indeterminate';
    if (this.checkbox().nativeElement.indeterminate) {
      this.checkbox().nativeElement.value = 'indeterminate';
    } else {
      this.checkbox().nativeElement.value = this.checked() ? 'on' : 'off';
    }
    this.checkbox().nativeElement.dispatchEvent(new Event('change'));
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.elementRef);
  }

  writeValue(value: XCoreCheckboxValue): void {
    if (value === 'indeterminate') {
      this.checked.set('indeterminate');
    } else {
      this.checked.set(!!value);
    }
  }

  registerOnChange(fn: ChangeFn<XCoreCheckboxValue>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchFn): void {
    this.onTouched = fn;
  }

  /** Implemented as a part of ControlValueAccessor. */
  setDisabledState(isDisabled: boolean): void {
    this.state().disabled.set(isDisabled);
  }

  /**
   * If the space key is pressed, prevent the default action to stop the page from scrolling.
   */
  @HostListener('keydown.space', ['$event'])
  protected preventScrolling(event: KeyboardEvent): void {
    event.preventDefault();
  }
}

type XCoreCheckboxValue = boolean | 'indeterminate';
