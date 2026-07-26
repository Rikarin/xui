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
import { xui } from '@xui/core';
import { createQueryList } from '@xui/core/query';
import { XuiPopoverImports } from '@xui/popover';
import { XuiSelectOption } from '@xui/select';
import type { ClassValue } from 'clsx';

const defaultMatch = (text: string, query: string): boolean => text.toLowerCase().includes(query.toLowerCase());

/**
 * A typeahead autocomplete: the text input itself is the target. Typing filters a
 * popover list; choosing an item fills the input with its text. Unlike
 * `xui-select`, there is no separate trigger. `[(selectedItem)]` two-way binding.
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
      [disabled]="disabled()"
      [attr.aria-expanded]="open()"
      [attr.aria-autocomplete]="'list'"
      [xuiPopover]="panel"
      [(open)]="open"
      [role]="'listbox'"
      [matchTargetWidth]="true"
      [minimal]="true"
      [disabled]="disabled()"
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
    </ng-template>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiSuggest<T> {
  readonly class = input<ClassValue>('');

  readonly items = input<readonly T[]>([]);
  readonly itemText = input<(item: T) => string>((item: T) => (item == null ? '' : String(item)));
  readonly itemPredicate = input<(query: string, item: T) => boolean>();
  readonly itemDisabled = input<(item: T) => boolean>(() => false);

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly placeholder = input<string>('Search…');
  readonly noResultsText = input<string>('No results.');

  /** The chosen item. Two-way bindable with `[(selectedItem)]`. */
  readonly selectedItem = model<T | null>(null);

  readonly selectionChange = output<T>();

  protected readonly open = model(false);
  protected readonly query = signal('');
  /** Whether the user is actively editing (so the input shows the query). */
  private readonly editing = signal(false);

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

  /** The input shows the live query while editing, else the selected item's text. */
  protected readonly displayValue = computed(() => {
    if (this.editing()) {
      return this.query();
    }

    const selected = this.selectedItem();
    return selected == null ? '' : this.itemText()(selected);
  });

  protected readonly computedClass = computed(() => xui('inline-block', this.class()));

  protected readonly inputClass = computed(() =>
    xui(
      'border-border bg-surface-inset text-foreground placeholder:text-foreground-subtle h-(--control-height-md) w-full min-w-44 rounded-lg border px-(--control-padding-md) text-sm',
      'focus-visible:border-focus transition-colors focus:outline-none',
      this.disabled() && 'cursor-not-allowed opacity-50'
    )
  );

  constructor() {
    // Stop editing (revert to the selected item's text) once the popover closes.
    effect(() => {
      if (!this.open()) {
        untracked(() => {
          this.editing.set(false);
          this.query.set('');
        });
      }
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

  protected onInput(event: Event): void {
    this.editing.set(true);
    this.open.set(true);
    this.query.set((event.target as HTMLInputElement).value);
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
          this.choose(active);
        }
        break;
      }
      case 'Escape':
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
