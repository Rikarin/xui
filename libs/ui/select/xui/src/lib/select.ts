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
  inject,
  Injector,
  input,
  model,
  output,
  signal,
  untracked,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matExpandMoreRound, matSearchRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { createQueryList } from '@xui/core/query';
import { XuiIcon } from '@xui/icon';
import { XuiPopoverImports } from '@xui/popover';
import type { ClassValue } from 'clsx';
import { XuiSelectOption } from './select-option';

const defaultMatch = (text: string, query: string): boolean => text.toLowerCase().includes(query.toLowerCase());

/**
 * A filterable single-select dropdown: a trigger button opens a popover with a
 * search field and a keyboard-navigable list. Items can be rendered with a custom
 * `[xuiSelectOption]` template. `[(selectedItem)]` two-way binding.
 */
@Component({
  selector: 'xui-select',
  imports: [NgTemplateOutlet, NgIcon, XuiIcon, XuiPopoverImports],
  template: `
    <button
      type="button"
      [attr.role]="'combobox'"
      [class]="triggerClass()"
      [disabled]="disabled()"
      [attr.aria-haspopup]="'listbox'"
      [attr.aria-expanded]="open()"
      [attr.aria-label]="effectiveAriaLabel()"
      [attr.aria-labelledby]="ariaLabelledby()"
      [xuiPopover]="panel"
      [(isOpen)]="open"
      [role]="'listbox'"
      [matchTargetWidth]="matchTargetWidth()"
      [minimal]="true"
      placement="bottom-start"
    >
      <span [class]="selectedItem() ? 'truncate' : 'text-foreground-subtle truncate'">{{
        selectedItem() ? displayText(selectedItem()!) : placeholder()
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
              [attr.aria-selected]="item === selectedItem()"
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
                    selected: item === selectedItem(),
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
  viewProviders: [provideIcons({ matExpandMoreRound, matSearchRound })]
})
export class XuiSelect<T> {
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  protected readonly searchId = uniqueId('xui-select-search');

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

  /** The chosen item. Two-way bindable with `[(selectedItem)]`. */
  readonly selectedItem = model<T | null>(null);

  readonly selectionChange = output<T>();

  protected readonly open = model(false);
  protected readonly query = signal('');

  protected readonly optionTemplate = contentChild(XuiSelectOption<T>);

  // Everything flows through a single reactive list predicate so filtering reacts
  // to the query and every configurable input.
  protected readonly list = createQueryList<T>({
    items: this.items,
    query: this.query,
    itemText: item => this.itemText()(item),
    itemDisabled: item => this.itemDisabled()(item),
    itemListPredicate: (q, items) => {
      const listPredicate = this.itemListPredicate();
      if (listPredicate) {
        return listPredicate(q, items);
      }

      if (!q) {
        return items as T[];
      }

      const predicate = this.itemPredicate();
      return items.filter(item => (predicate ? predicate(q, item) : defaultMatch(this.itemText()(item), q)));
    }
  });

  protected readonly computedClass = computed(() => xui('inline-block', this.class()));

  protected readonly effectiveAriaLabel = computed(() =>
    this.ariaLabelledby() ? null : (this.ariaLabel() ?? this.placeholder())
  );

  protected readonly triggerClass = computed(() =>
    xui(
      'border-border bg-surface-inset text-foreground flex h-10 w-full min-w-44 items-center justify-between rounded-lg border px-3 text-sm',
      'focus-visible:border-focus transition-colors focus:outline-none',
      this.disabled() && 'cursor-not-allowed opacity-50'
    )
  );

  constructor() {
    // Re-seed the active item + focus search on open; reset the query on close.
    effect(() => {
      const open = this.open();
      untracked(() => {
        if (open) {
          this.list.activateFirst();
          // The search input renders in the popover's overlay, outside this view's
          // query scope, so focus it by id once it has mounted.
          afterNextRender(() => this.document.getElementById(this.searchId)?.focus(), { injector: this.injector });
        } else if (this.resetOnClose()) {
          this.query.set('');
        }
      });
    });
  }

  protected displayText(item: T): string {
    return this.itemText()(item);
  }

  protected trackItem(index: number, item: T): unknown {
    return item ?? index;
  }

  protected optionClass(item: T): string {
    return xui(
      'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5',
      this.list.isActive(item) && 'bg-primary/10',
      item === this.selectedItem() && 'text-primary font-medium',
      this.list.isDisabled(item) && 'pointer-events-none opacity-50'
    );
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.list.activateFirst();
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.list.moveActiveItem(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.list.moveActiveItem(-1);
        break;
      case 'Enter': {
        event.preventDefault();
        const active = this.list.activeItem();
        if (active != null) {
          this.choose(active);
        }
        break;
      }
      case 'Escape':
      case 'Tab':
        this.open.set(false);
        break;
      default:
        return;
    }
  }

  protected choose(item: T): void {
    if (this.list.isDisabled(item)) {
      return;
    }

    this.selectedItem.set(item);
    this.selectionChange.emit(item);
    this.open.set(false);
  }
}
