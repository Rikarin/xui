import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  model,
  output,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { createQueryList } from '@xui/core/query';
import { XuiIcon } from '@xui/icon';
import { XuiPopoverImports } from '@xui/popover';
import { XuiSelectOption } from '@xui/select';
import { XuiTag } from '@xui/tag';
import type { ClassValue } from 'clsx';

const defaultMatch = (text: string, query: string): boolean => text.toLowerCase().includes(query.toLowerCase());

/**
 * A filterable multi-select: an inline field of removable chips plus a query
 * input opens a popover of options with a check on the chosen ones. Clicking an
 * option toggles it (the popover stays open). `[(selectedItems)]` two-way binding.
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
      [disabled]="disabled()"
      placement="bottom-start"
    >
      @for (item of selectedItems(); track trackItem($index, item)) {
        <xui-tag minimal color="primary" [removable]="!disabled()" (removed)="remove(item)">{{
          displayText(item)
        }}</xui-tag>
      }

      <input
        #search
        type="text"
        class="text-foreground placeholder:text-foreground-subtle min-w-24 flex-1 bg-transparent py-1 outline-none"
        [placeholder]="selectedItems().length ? '' : placeholder()"
        [value]="query()"
        [disabled]="disabled()"
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
  viewProviders: [provideIcons({ matCheckRound })]
})
export class XuiMultiSelect<T> {
  readonly class = input<ClassValue>('');

  readonly items = input<readonly T[]>([]);
  readonly itemText = input<(item: T) => string>((item: T) => (item == null ? '' : String(item)));
  readonly itemPredicate = input<(query: string, item: T) => boolean>();
  readonly itemDisabled = input<(item: T) => boolean>(() => false);

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly placeholder = input<string>('Select…');
  readonly noResultsText = input<string>('No results.');

  /** The chosen items. Two-way bindable with `[(selectedItems)]`. */
  readonly selectedItems = model<T[]>([]);

  readonly itemAdded = output<T>();
  readonly itemRemoved = output<T>();

  protected readonly open = model(false);
  protected readonly query = signal('');

  protected readonly optionTemplate = contentChild(XuiSelectOption<T>);

  protected readonly list = createQueryList<T>({
    items: this.items,
    query: this.query,
    itemText: item => this.itemText()(item),
    itemDisabled: item => this.itemDisabled()(item),
    itemListPredicate: (q, items) => {
      if (!q) {
        return items as T[];
      }

      const predicate = this.itemPredicate();
      return items.filter(item => (predicate ? predicate(q, item) : defaultMatch(this.itemText()(item), q)));
    }
  });

  protected readonly computedClass = computed(() => xui('block', this.class()));

  protected readonly controlClass = computed(() =>
    xui(
      'border-border bg-surface-inset flex min-h-(--control-height-md) w-full flex-wrap items-center gap-1.5 rounded-lg border px-(--control-padding-sm) py-1 text-sm',
      'focus-within:border-focus cursor-text transition-colors',
      this.disabled() && 'cursor-not-allowed opacity-50'
    )
  );

  protected displayText(item: T): string {
    return this.itemText()(item);
  }

  protected trackItem(index: number, item: T): unknown {
    return item ?? index;
  }

  protected isSelected(item: T): boolean {
    return this.selectedItems().includes(item);
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
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.open.set(true);
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
          this.toggle(active);
        }
        break;
      }
      case 'Backspace':
        // Remove the last chip when the query is empty.
        if (this.query() === '' && this.selectedItems().length) {
          this.remove(this.selectedItems()[this.selectedItems().length - 1]);
        }
        break;
      case 'Escape':
        this.open.set(false);
        break;
      default:
        return;
    }
  }

  protected toggle(item: T): void {
    if (this.list.isDisabled(item)) {
      return;
    }

    this.isSelected(item) ? this.remove(item) : this.add(item);
  }

  private add(item: T): void {
    this.selectedItems.update(items => [...items, item]);
    this.query.set('');
    this.itemAdded.emit(item);
  }

  protected remove(item: T): void {
    this.selectedItems.update(items => items.filter(i => i !== item));
    this.itemRemoved.emit(item);
  }
}
