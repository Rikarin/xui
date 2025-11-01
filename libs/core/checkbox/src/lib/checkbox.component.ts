import { FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  type AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
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
  linkedSignal,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChangeFn, TouchFn } from '@xui/core/forms';

export const X_CHECKBOX_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => XCheckboxComponent),
  multi: true
};

let uniqueIdCounter = 0;
const CONTAINER_POST_FIX = '-checkbox';

@Component({
  selector: 'x-checkbox',
  template: `
    <button
      #checkBox
      type="button"
      role="checkbox"
      [id]="getCheckboxButtonId(state().id) ?? ''"
      [name]="getCheckboxButtonId(state().name) ?? ''"
      [class]="class()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-checked]="ariaChecked()"
      [attr.data-state]="dataState()"
      [attr.data-focus-visible]="focusVisible()"
      [attr.data-focus]="focused()"
      [attr.data-disabled]="state().disabled()"
      [disabled]="state().disabled()"
      [tabIndex]="state().disabled() ? -1 : 0"
      (click)="$event.preventDefault(); toggle()"
    >
      <ng-content />
    </button>
  `,
  host: {
    '[style]': '{display: "contents"}',
    '[attr.id]': 'state().id',
    '[attr.name]': 'state().name',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-describedby]': 'null',
    '[attr.data-state]': 'dataState()',
    '[attr.data-focus-visible]': 'focusVisible()',
    '[attr.data-focus]': 'focused()',
    '[attr.data-disabled]': 'state().disabled()'
  },
  providers: [X_CHECKBOX_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XCheckboxComponent implements AfterContentInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly focusVisible = signal(false);
  protected readonly focused = signal(false);

  /**
   * Current checked state of checkbox.
   * Can be boolean (true/false) or 'indeterminate'.
   * Can be bound with [(checked)] for two-way binding.
   */
  readonly checked = model<XCheckboxValue>(false);

  /**
   * Read-only signal of the current checkbox state.
   * Use this when you only need to read the state without changing it.
   */
  readonly isChecked = this.checked.asReadonly();

  /**
   * Computed data-state attribute value based on a checked state.
   * Returns 'checked', 'unchecked', or 'indeterminate'.
   */
  protected readonly dataState = computed(() => {
    const checked = this.checked();
    if (checked === 'indeterminate') return 'indeterminate';
    return checked ? 'checked' : 'unchecked';
  });

  /**
   * Computed aria-checked attribute value for accessibility.
   * Returns 'true', 'false', or 'mixed' (for indeterminate).
   */
  protected readonly ariaChecked = computed(() => {
    const checked = this.checked();
    if (checked === 'indeterminate') return 'mixed';
    return checked ? 'true' : 'false';
  });

  /**
   * Unique identifier for a checkbox component.
   * When provided, the inner button gets ID without '-checkbox' suffix.
   * Auto-generates ID if not provided.
   */
  public readonly id = input<string | null>(uniqueIdCounter++ + '');

  /**
   * Form control name for checkbox.
   * When provided, the inner button gets the name without '-checkbox' suffix.
   */
  public readonly name = input<string | null>(null);

  /**
   * CSS classes applied to the inner button element.
   */
  public readonly class = input<string | null>(null);

  /**
   * Accessibility label for screen readers.
   * Use when no visible label exists.
   */
  public readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  /**
   * ID of an element that labels this checkbox for accessibility.
   * Auto-set when a checkbox is inside a label element.
   */
  public readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });
  public readonly mutableAriaLabelledby = linkedSignal(() => this.ariaLabelledby());

  /**
   * ID of the element that describes this checkbox for accessibility.
   */
  public readonly ariaDescribedby = input<string | null>(null, { alias: 'aria-describedby' });

  /**
   * Whether a checkbox is required in a form.
   */
  public readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /**
   * Whether the checkbox is disabled.
   * Disabled checkboxes cannot be toggled and indicate the disabled state through a data-disabled attribute.
   */
  public readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /**
   * Computed state for checkbox container and accessibility.
   * Manages ID, name, and disabled state.
   */
  protected readonly state = computed(() => {
    const name = this.name();
    const id = this.id();
    return {
      disabled: signal(this.disabled()),
      name: name ? name + CONTAINER_POST_FIX : null,
      id: id ? id + CONTAINER_POST_FIX : null
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected _onChange: ChangeFn<XCheckboxValue> = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onTouched: TouchFn = () => {};

  /**
   * Reference to the checkbox button element in the template.
   */
  public readonly checkbox = viewChild.required<ElementRef<HTMLButtonElement>>('checkBox');

  /**
   * Event emitted when the checkbox value changes.
   * Emits a new checked state (true/false/'indeterminate').
   */
  public readonly changed = output<XCheckboxValue>();

  /**
   * Event emitted when the checkbox is blurred (loses focus).
   * Used for form validation.
   */
  public readonly touched = output<void>();

  constructor() {
    effect(() => {
      const state = this.state();
      const isDisabled = state.disabled();

      if (!this.elementRef.nativeElement || !this.isBrowser) {
        return;
      }

      const newLabelId = state.id + '-label';
      const checkboxButtonId = this.getCheckboxButtonId(state.id);
      const labelElement =
        this.elementRef.nativeElement.closest('label') ??
        this.document.querySelector(`label[for="${checkboxButtonId}"]`);

      if (!labelElement) return;
      const existingLabelId = labelElement.id;

      this.renderer.setAttribute(labelElement, 'data-disabled', isDisabled ? 'true' : 'false');
      this.mutableAriaLabelledby.set(existingLabelId || newLabelId);

      if (!existingLabelId || existingLabelId.length === 0) {
        this.renderer.setAttribute(labelElement, 'id', newLabelId);
      }
    });
  }

  /**
   * Toggles checkbox between checked/unchecked states.
   * If the checkbox is indeterminate, sets to check.
   * Does nothing if the checkbox is disabled.
   */
  toggle() {
    if (this.state().disabled()) return;

    this._onTouched();
    this.touched.emit();

    const previousChecked = this.checked();
    this.checked.set(previousChecked === 'indeterminate' ? true : !previousChecked);
    this._onChange(this.checked());
    this.changed.emit(this.checked());
  }

  ngAfterContentInit() {
    this.focusMonitor
      .monitor(this.elementRef, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(focusOrigin => {
        if (focusOrigin) this.focused.set(true);
        if (focusOrigin === 'keyboard' || focusOrigin === 'program') {
          this.focusVisible.set(true);
          this.cdr.markForCheck();
        }
        if (!focusOrigin) {
          // When a focused element becomes disabled, the browser *immediately* fires a blur event.
          // Angular does not expect events to be risen during change detection, so any state
          // change (such as a form control's ng-touched) will cause a changed-after-checked error.
          // See https://github.com/angular/angular/issues/17793. To work around this, we defer
          // telling the form control it has been touched until the next tick.
          Promise.resolve().then(() => {
            this.focusVisible.set(false);
            this.focused.set(false);
            this._onTouched();
            this.touched.emit();
            this.cdr.markForCheck();
          });
        }
      });
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.elementRef);
  }

  /**
   * Gets proper ID for an inner button element.
   * Removes '-checkbox' suffix if present in container ID.
   *
   * @param idPassedToContainer - ID applied to container element
   * @returns ID to use for inner button or null
   */
  protected getCheckboxButtonId(idPassedToContainer: string | null | undefined): string | null {
    return idPassedToContainer ? idPassedToContainer.replace(CONTAINER_POST_FIX, '') : null;
  }

  /**
   * Updates internal state when control value changes from outside.
   * Handles boolean and 'indeterminate' values.
   * Part of ControlValueAccessor interface.
   *
   * @param value - New checkbox state (true/false/'indeterminate')
   */
  writeValue(value: XCheckboxValue): void {
    if (value === 'indeterminate') {
      this.checked.set('indeterminate');
    } else {
      this.checked.set(value);
    }
  }

  /**
   * Registers callback for value changes.
   * Part of ControlValueAccessor interface.
   *
   * @param fn - Function to call when value changes
   */
  registerOnChange(fn: ChangeFn<XCheckboxValue>): void {
    this._onChange = fn;
  }

  /**
   * Registers callback for touched events.
   * Part of ControlValueAccessor interface.
   *
   * @param fn - Function to call when control is touched
   */
  registerOnTouched(fn: TouchFn): void {
    this._onTouched = fn;
  }

  /**
   * Updates disabled state from form control.
   * Part of ControlValueAccessor interface.
   *
   * @param isDisabled - Whether checkbox should be disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.state().disabled.set(isDisabled);
    this.cdr.markForCheck();
  }
}

type XCheckboxValue = boolean | 'indeterminate';
