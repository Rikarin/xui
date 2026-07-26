import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  Injector,
  input,
  model,
  signal,
  type Signal,
  untracked,
  ViewEncapsulation
} from '@angular/core';
import type { ControlValueAccessor, NgControl } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matExpandMoreRound, matSearchRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { XFormFieldControl } from '@xui/core/form-field';
import { createXErrorState, createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { createXActiveOption, createXItemListPredicate, createXQueryList, trackXItem } from '@xui/core/query';
import { XuiIcon } from '@xui/icon';
import { XuiPopoverImports } from '@xui/popover';
import type { ClassValue } from 'clsx';
import { XuiSelectOption } from './select-option';

/**
 * A filterable single-select dropdown: a trigger button opens a popover with a
 * search field and a keyboard-navigable list. Items can be rendered with a custom
 * `[xuiSelectOption]` template. `[(value)]` two-way binding.
 */
@Component({
  selector: 'xui-select',
  imports: [NgTemplateOutlet, NgIcon, XuiIcon, XuiPopoverImports],
  template: `
    <button
      type="button"
      [id]="triggerId"
      [attr.role]="'combobox'"
      [class]="triggerClass()"
      [disabled]="isDisabled()"
      [attr.disabled]="isDisabled() ? '' : null"
      [attr.aria-haspopup]="'listbox'"
      [attr.aria-expanded]="open()"
      [attr.aria-label]="effectiveAriaLabel()"
      [attr.aria-labelledby]="ariaLabelledby()"
      [xuiPopover]="panel"
      [(open)]="open"
      [role]="'listbox'"
      [matchTargetWidth]="matchTargetWidth()"
      [minimal]="true"
      placement="bottom-start"
    >
      <span [class]="value() ? 'truncate' : 'text-foreground-subtle truncate'">{{
        value() ? displayText(value()!) : placeholder()
      }}</span>
      <ng-icon xui name="matExpandMoreRound" size="sm" class="text-foreground-muted ms-2 shrink-0" />
    </button>

    <ng-template #panel>
      <div class="flex max-h-72 flex-col overflow-hidden text-sm">
        @if (filterable()) {
          <div class="border-border relative border-b">
            <ng-icon
              xui
              name="matSearchRound"
              size="sm"
              class="text-foreground-muted pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2"
            />
            <input
              [id]="searchId"
              type="text"
              class="text-foreground placeholder:text-foreground-subtle w-full bg-transparent py-2 ps-8 pe-2 outline-none"
              [placeholder]="searchPlaceholder()"
              [value]="query()"
              (input)="onQuery($event)"
              (keydown)="onSearchKeydown($event)"
            />
          </div>
        }

        <ul role="listbox" class="m-0 max-h-60 list-none overflow-y-auto p-1">
          @for (item of list.filteredItems(); track trackItem($index, item)) {
            <!-- Keyboard navigation runs through the search input (Arrow/Enter),
                 so options are pointer targets, not individual tab stops. -->
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <li
              role="option"
              [class]="optionClass(item)"
              [attr.aria-selected]="item === value()"
              (click)="choose(item)"
              (mouseenter)="list.setActiveItem(item)"
            >
              @if (optionTemplate(); as tpl) {
                <ng-container
                  [ngTemplateOutlet]="tpl.template"
                  [ngTemplateOutletContext]="{
                    $implicit: item,
                    item: item,
                    active: list.isActive(item),
                    selected: item === value(),
                    index: $index
                  }"
                />
              } @else {
                {{ displayText(item) }}
              }
            </li>
          } @empty {
            <li class="text-foreground-muted px-2 py-2">{{ noResultsText() }}</li>
          }
        </ul>
      </div>
    </ng-template>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matExpandMoreRound, matSearchRound })],
  providers: [
    {
      provide: XFormFieldControl,
      useExisting: forwardRef(() => XuiSelect)
    },
    provideXValueAccessor(() => XuiSelect)
  ]
})
export class XuiSelect<T> implements XFormFieldControl, ControlValueAccessor {
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly formState = createXErrorState();
  protected readonly searchId = uniqueId('xui-select-search');
  protected readonly triggerId = uniqueId('xui-select-trigger');

  /** Error state for `xui-form-field`, derived from the optional bound form control. */
  readonly errorState = this.formState.errorState;

  /** Points the form field's `<label for>` at the trigger button, not the host. */
  readonly controlId: Signal<string | null> = signal(this.triggerId).asReadonly();

  get ngControl(): NgControl | null {
    return this.formState.ngControl();
  }

  readonly class = input<ClassValue>('');

  readonly items = input<readonly T[]>([]);
  readonly itemText = input<(item: T) => string>((item: T) => (item == null ? '' : String(item)));
  readonly itemPredicate = input<(query: string, item: T) => boolean>();
  readonly itemListPredicate = input<(query: string, items: readonly T[]) => T[]>();
  readonly itemDisabled = input<(item: T) => boolean>(() => false);

  readonly filterable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly matchTargetWidth = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /** Clear the query (and thus the filter) each time the popover closes. */
  readonly resetOnClose = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  readonly placeholder = input<string>('Select…');

  /**
   * Names the control. A `combobox` takes its *value* from its content, so the
   * name has to come from a label — without one axe reports `button-name` and a
   * screen reader announces the current value with no idea what it is for. Falls
   * back to the placeholder, which is at least descriptive.
   */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });
  readonly searchPlaceholder = input<string>('Filter…');
  readonly noResultsText = input<string>('No results.');

  /** The chosen item. Two-way bindable with `[(value)]`, or via `formControl`/`ngModel`. */
  readonly value = model<T | null>(null);

  protected readonly cva = createXValueAccessor<T | null>({
    onWrite: value => this.value.set(value ?? null),
    disabled: this.disabled
  });
  protected readonly isDisabled = this.cva.disabled;

  /** Whether the popover has ever been open — so the initial closed state is not "touched". */
  private hasOpened = false;

  protected readonly open = model(false);
  protected readonly query = signal('');

  protected readonly optionTemplate = contentChild(XuiSelectOption<T>);

  // Everything flows through a single reactive list predicate so filtering reacts
  // to the query and every configurable input.
  protected readonly list = createXQueryList<T>({
    items: this.items,
    query: this.query,
    itemText: item => this.itemText()(item),
    itemDisabled: item => this.itemDisabled()(item),
    itemListPredicate: createXItemListPredicate({
      itemText: this.itemText,
      itemPredicate: this.itemPredicate,
      itemListPredicate: this.itemListPredicate
    })
  });

  // Keyboard navigation over the filtered list (Tab also yields focus and closes).
  private readonly nav = createXActiveOption<T>({
    list: this.list,
    select: item => this.choose(item),
    close: () => this.open.set(false),
    closeOnTab: true
  });

  protected readonly computedClass = computed(() => xui('inline-block', this.class()));

  protected readonly effectiveAriaLabel = computed(() =>
    this.ariaLabelledby() ? null : (this.ariaLabel() ?? this.placeholder())
  );

  protected readonly triggerClass = computed(() =>
    xui(
      'border-border bg-surface-inset text-foreground flex h-(--control-height-md) w-full min-w-44 items-center justify-between rounded-lg border px-(--control-padding-md) text-sm',
      'focus-visible:border-focus transition-colors focus:outline-none',
      this.isDisabled() && 'cursor-not-allowed opacity-50'
    )
  );

  constructor() {
    // Re-seed the active item + focus search on open; reset the query and mark
    // the control touched on close.
    effect(() => {
      const open = this.open();
      untracked(() => {
        if (open) {
          this.hasOpened = true;
          this.list.activateFirst();
          // The search input renders in the popover's overlay, outside this view's
          // query scope, so focus it by id once it has mounted.
          afterNextRender(() => this.document.getElementById(this.searchId)?.focus(), { injector: this.injector });
        } else {
          if (this.resetOnClose()) {
            this.query.set('');
          }
          if (this.hasOpened) {
            this.cva.markTouched();
          }
        }
      });
    });
  }

  protected displayText(item: T): string {
    return this.itemText()(item);
  }

  protected readonly trackItem = trackXItem;

  protected optionClass(item: T): string {
    return xui(
      'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5',
      this.list.isActive(item) && 'bg-primary/10',
      item === this.value() && 'text-primary font-medium',
      this.list.isDisabled(item) && 'pointer-events-none opacity-50'
    );
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.list.activateFirst();
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    this.nav.onKeydown(event);
  }

  protected choose(item: T): void {
    if (this.list.isDisabled(item)) {
      return;
    }

    this.value.set(item);
    this.cva.notifyChange(item);
    this.open.set(false);
  }

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
