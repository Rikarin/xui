import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  input,
  model,
  signal,
  untracked,
  ViewEncapsulation
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { xui } from '@xui/core';
import { createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { createXActiveOption, createXItemListPredicate, createXQueryList, trackXItem } from '@xui/core/query';
import { XuiPopoverImports } from '@xui/popover';
import { XuiSelectOption } from '@xui/select';
import type { ClassValue } from 'clsx';

/**
 * A typeahead autocomplete: the text input itself is the target. Typing filters a
 * popover list; choosing an item fills the input with its text. Unlike
 * `xui-select`, there is no separate trigger. `[(value)]` two-way binding.
 */
@Component({
  selector: 'xui-suggest',
  imports: [NgTemplateOutlet, XuiPopoverImports],
  template: `
    <input
      #input
      type="text"
      [attr.role]="'combobox'"
      [class]="inputClass()"
      [value]="displayValue()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [attr.disabled]="isDisabled() ? '' : null"
      [attr.aria-expanded]="open()"
      [attr.aria-autocomplete]="'list'"
      [xuiPopover]="panel"
      [(open)]="open"
      [role]="'listbox'"
      [matchTargetWidth]="true"
      [minimal]="true"
      [disabled]="isDisabled()"
      interactionKind="click-target"
      placement="bottom-start"
      (input)="onInput($event)"
      (focus)="open.set(true)"
      (keydown)="onKeydown($event)"
    />

    <ng-template #panel>
      <ul role="listbox" class="m-0 max-h-60 list-none overflow-y-auto p-1 text-sm">
        @for (item of list.filteredItems(); track trackItem($index, item)) {
          <!-- Keyboard navigation runs through the input, so options are pointer
               targets rather than individual tab stops. -->
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
    </ng-template>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  providers: [provideXValueAccessor(() => XuiSuggest)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiSuggest<T> implements ControlValueAccessor {
  readonly class = input<ClassValue>('');

  readonly items = input<readonly T[]>([]);
  readonly itemText = input<(item: T) => string>((item: T) => (item == null ? '' : String(item)));
  readonly itemPredicate = input<(query: string, item: T) => boolean>();
  readonly itemDisabled = input<(item: T) => boolean>(() => false);

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly placeholder = input<string>('Search…');
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
  /** Whether the user is actively editing (so the input shows the query). */
  private readonly editing = signal(false);

  protected readonly optionTemplate = contentChild(XuiSelectOption<T>);

  protected readonly list = createXQueryList<T>({
    items: this.items,
    query: this.query,
    itemText: item => this.itemText()(item),
    itemDisabled: item => this.itemDisabled()(item),
    itemListPredicate: createXItemListPredicate({
      itemText: this.itemText,
      itemPredicate: this.itemPredicate
    })
  });

  // Keyboard navigation over the filtered list (ArrowDown re-opens the popover).
  private readonly nav = createXActiveOption<T>({
    list: this.list,
    select: item => this.choose(item),
    close: () => this.open.set(false),
    open: () => this.open.set(true)
  });

  /** The input shows the live query while editing, else the selected item's text. */
  protected readonly displayValue = computed(() => {
    if (this.editing()) {
      return this.query();
    }

    const selected = this.value();
    return selected == null ? '' : this.itemText()(selected);
  });

  protected readonly computedClass = computed(() => xui('inline-block', this.class()));

  protected readonly inputClass = computed(() =>
    xui(
      'border-border bg-surface-inset text-foreground placeholder:text-foreground-subtle h-(--control-height-md) w-full min-w-44 rounded-lg border px-(--control-padding-md) text-sm',
      'focus-visible:border-focus transition-colors focus:outline-none',
      this.isDisabled() && 'cursor-not-allowed opacity-50'
    )
  );

  constructor() {
    // Stop editing (revert to the selected item's text) and mark the control
    // touched once the popover closes.
    effect(() => {
      if (this.open()) {
        this.hasOpened = true;
      } else {
        untracked(() => {
          this.editing.set(false);
          this.query.set('');
          if (this.hasOpened) {
            this.cva.markTouched();
          }
        });
      }
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

  protected onInput(event: Event): void {
    this.editing.set(true);
    this.open.set(true);
    this.query.set((event.target as HTMLInputElement).value);
    this.list.activateFirst();
  }

  protected onKeydown(event: KeyboardEvent): void {
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
