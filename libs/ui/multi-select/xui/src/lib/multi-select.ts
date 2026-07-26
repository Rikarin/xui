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
  output,
  signal,
  untracked,
  ViewEncapsulation
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { createXActiveOption, createXItemListPredicate, createXQueryList, trackXItem } from '@xui/core/query';
import { XuiIcon } from '@xui/icon';
import { XuiPopoverImports } from '@xui/popover';
import { XuiSelectOption } from '@xui/select';
import { XuiTag } from '@xui/tag';
import type { ClassValue } from 'clsx';

/**
 * A filterable multi-select: an inline field of removable chips plus a query
 * input opens a popover of options with a check on the chosen ones. Clicking an
 * option toggles it (the popover stays open). `[(values)]` two-way binding.
 */
@Component({
  selector: 'xui-multi-select',
  imports: [NgTemplateOutlet, NgIcon, XuiIcon, XuiTag, XuiPopoverImports],
  template: `
    <div
      [class]="controlClass()"
      [xuiPopover]="panel"
      [(open)]="open"
      [role]="'listbox'"
      [matchTargetWidth]="true"
      [minimal]="true"
      [disabled]="isDisabled()"
      placement="bottom-start"
    >
      @for (item of values(); track trackItem($index, item)) {
        <xui-tag minimal color="primary" [removable]="!isDisabled()" (removed)="remove(item)">{{
          displayText(item)
        }}</xui-tag>
      }

      <input
        #search
        type="text"
        class="text-foreground placeholder:text-foreground-subtle min-w-24 flex-1 bg-transparent py-1 outline-none"
        [placeholder]="values().length ? '' : placeholder()"
        [value]="query()"
        [disabled]="isDisabled()"
        (input)="onQuery($event)"
        (keydown)="onKeydown($event)"
      />
    </div>

    <ng-template #panel>
      <ul role="listbox" aria-multiselectable="true" class="m-0 max-h-60 list-none overflow-y-auto p-1 text-sm">
        @for (item of list.filteredItems(); track trackItem($index, item)) {
          <!-- Keyboard navigation runs through the query input, so options are
               pointer targets rather than individual tab stops. -->
          <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
          <li
            role="option"
            [class]="optionClass(item)"
            [attr.aria-selected]="isSelected(item)"
            (click)="toggle(item)"
            (mouseenter)="list.setActiveItem(item)"
          >
            <ng-icon xui name="matCheckRound" size="sm" [class]="isSelected(item) ? 'text-primary' : 'invisible'" />
            @if (optionTemplate(); as tpl) {
              <ng-container
                [ngTemplateOutlet]="tpl.template"
                [ngTemplateOutletContext]="{
                  $implicit: item,
                  item: item,
                  active: list.isActive(item),
                  selected: isSelected(item),
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matCheckRound })],
  providers: [provideXValueAccessor(() => XuiMultiSelect)]
})
export class XuiMultiSelect<T> implements ControlValueAccessor {
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** The options to choose from. */
  readonly items = input<readonly T[]>([]);
  /**
   * How an item is labelled. Also what the default filter matches against, so give it the text the user would type.
   */
  readonly itemText = input<(item: T) => string>((item: T) => (item == null ? '' : String(item)));
  /** Custom filter for one item against the query. Defaults to a case-insensitive substring match on `itemText`. */
  readonly itemPredicate = input<(query: string, item: T) => boolean>();
  /** Which items cannot be selected. They stay in the list, greyed out. */
  readonly itemDisabled = input<(item: T) => boolean>(() => false);

  /** Block interaction and dim the control. */
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Text shown in the empty field. Hidden once anything is selected. */
  readonly placeholder = input<string>('Select…');
  /** Shown in place of the list when the query matches nothing. */
  readonly noResultsText = input<string>('No results.');

  /** The chosen items. Two-way bindable with `[(values)]`, or via `formControl`/`ngModel`. */
  readonly values = model<T[]>([]);

  protected readonly cva = createXValueAccessor<T[]>({
    onWrite: values => this.values.set(values ?? []),
    disabled: this.disabled
  });
  protected readonly isDisabled = this.cva.disabled;

  /** Whether the popover has ever been open — so the initial closed state is not "touched". */
  private hasOpened = false;

  /** Emits the item that was just selected. */
  readonly itemAdded = output<T>();
  /** Emits the item that was just deselected. */
  readonly itemRemoved = output<T>();

  protected readonly open = model(false);
  protected readonly query = signal('');

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

  // Keyboard navigation over the filtered list (ArrowDown re-opens the popover;
  // Enter toggles rather than selects).
  private readonly nav = createXActiveOption<T>({
    list: this.list,
    select: item => this.toggle(item),
    close: () => this.open.set(false),
    open: () => this.open.set(true)
  });

  protected readonly computedClass = computed(() => xui('block', this.class()));

  protected readonly controlClass = computed(() =>
    xui(
      'border-border bg-surface-inset flex min-h-(--control-height-md) w-full flex-wrap items-center gap-1.5 rounded-lg border px-(--control-padding-sm) py-1 text-sm',
      'focus-within:border-focus cursor-text transition-colors',
      this.isDisabled() && 'cursor-not-allowed opacity-50'
    )
  );

  constructor() {
    // Mark the control touched once the popover closes after having been open.
    effect(() => {
      if (this.open()) {
        this.hasOpened = true;
      } else if (this.hasOpened) {
        untracked(() => this.cva.markTouched());
      }
    });
  }

  protected displayText(item: T): string {
    return this.itemText()(item);
  }

  protected readonly trackItem = trackXItem;

  protected isSelected(item: T): boolean {
    return this.values().includes(item);
  }

  protected optionClass(item: T): string {
    return xui(
      'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5',
      this.list.isActive(item) && 'bg-primary/10',
      this.list.isDisabled(item) && 'pointer-events-none opacity-50'
    );
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.open.set(true);
    this.list.activateFirst();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.nav.onKeydown(event)) {
      return;
    }

    // Remove the last chip when Backspace is pressed on an empty query.
    if (event.key === 'Backspace' && this.query() === '' && this.values().length) {
      this.remove(this.values()[this.values().length - 1]);
    }
  }

  protected toggle(item: T): void {
    if (this.list.isDisabled(item)) {
      return;
    }

    this.isSelected(item) ? this.remove(item) : this.add(item);
  }

  private add(item: T): void {
    this.values.update(items => [...items, item]);
    this.cva.notifyChange(this.values());
    this.query.set('');
    this.itemAdded.emit(item);
  }

  protected remove(item: T): void {
    if (this.isDisabled()) {
      return;
    }

    this.values.update(items => items.filter(i => i !== item));
    this.cva.notifyChange(this.values());
    this.itemRemoved.emit(item);
  }

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
