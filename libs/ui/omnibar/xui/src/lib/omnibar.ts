import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matSearchRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { createQueryList } from '@xui/core/query';
import { XuiIcon } from '@xui/icon';
import { XuiSelectOption } from '@xui/select';
import type { ClassValue } from 'clsx';

const defaultMatch = (text: string, query: string): boolean => text.toLowerCase().includes(query.toLowerCase());

/**
 * A ⌘K-style command palette: a top-centred overlay with a search field and a
 * keyboard-navigable result list. Toggle with `[(isOpen)]`; Escape or a backdrop
 * click closes. Items render with a custom `[xuiSelectOption]` template.
 */
@Component({
  selector: 'xui-omnibar',
  imports: [NgTemplateOutlet, NgIcon, XuiIcon],
  template: `
    @if (isOpen()) {
      <!-- Backdrop click closes; keyboard users use Escape. -->
      <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
      <div class="fixed inset-0 z-50 flex justify-center bg-black/40" (click)="onBackdrop($event)">
        <div [class]="panelClass()" role="dialog" aria-modal="true" [attr.aria-label]="ariaLabel()">
          <div class="border-border relative border-b">
            <ng-icon
              xui
              name="matSearchRound"
              size="md"
              class="text-foreground-muted pointer-events-none absolute top-1/2 start-4 -translate-y-1/2"
            />
            <input
              #search
              type="text"
              role="combobox"
              [attr.aria-expanded]="true"
              [attr.aria-controls]="listId"
              class="text-foreground placeholder:text-foreground-subtle w-full bg-transparent py-4 pe-4 ps-12 text-base outline-none"
              [placeholder]="placeholder()"
              [value]="query()"
              (input)="onQuery($event)"
              (keydown)="onKeydown($event)"
            />
          </div>

          <ul [id]="listId" role="listbox" class="m-0 max-h-80 list-none overflow-y-auto p-2">
            @for (item of list.filteredItems(); track trackItem($index, item)) {
              <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
              <li
                role="option"
                [class]="optionClass(item)"
                [attr.aria-selected]="list.isActive(item)"
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
                      selected: false,
                      index: $index
                    }"
                  />
                } @else {
                  {{ displayText(item) }}
                }
              </li>
            } @empty {
              <li class="text-foreground-muted px-3 py-6 text-center text-sm">{{ noResultsText() }}</li>
            }
          </ul>
        </div>
      </div>
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matSearchRound })]
})
export class XuiOmnibar<T> {
  private readonly injector = inject(Injector);
  protected readonly listId = uniqueId('xui-omnibar-list');

  readonly class = input<ClassValue>('');
  readonly ariaLabel = input<string>('Command palette', { alias: 'aria-label' });

  readonly items = input<readonly T[]>([]);
  readonly itemText = input<(item: T) => string>((item: T) => (item == null ? '' : String(item)));
  readonly itemPredicate = input<(query: string, item: T) => boolean>();
  readonly itemDisabled = input<(item: T) => boolean>(() => false);

  readonly placeholder = input<string>('Type a command or search…');
  readonly noResultsText = input<string>('No results.');
  readonly resetOnClose = input<boolean>(true);

  /** Whether the palette is showing. Two-way bindable with `[(isOpen)]`. */
  readonly isOpen = model(false);

  readonly itemSelect = output<T>();

  protected readonly query = signal('');
  protected readonly optionTemplate = contentChild(XuiSelectOption<T>);
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');

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

  protected readonly computedClass = computed(() => xui('contents', this.class()));

  protected readonly panelClass = computed(() =>
    xui(
      'bg-surface-raised border-border relative mt-[12vh] h-fit w-full max-w-xl overflow-hidden rounded-xl border shadow-2xl'
    )
  );

  constructor() {
    // Focus the field on open; reset the query on close.
    effect(() => {
      const open = this.isOpen();
      untracked(() => {
        if (open) {
          this.list.activateFirst();
          afterNextRender(() => this.search()?.nativeElement.focus(), { injector: this.injector });
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
      'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
      this.list.isActive(item) && 'bg-primary/10',
      this.list.isDisabled(item) && 'pointer-events-none opacity-50'
    );
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.list.activateFirst();
  }

  protected onKeydown(event: KeyboardEvent): void {
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
        event.preventDefault();
        this.close();
        break;
      default:
        return;
    }
  }

  protected choose(item: T): void {
    if (this.list.isDisabled(item)) {
      return;
    }

    this.itemSelect.emit(item);
    this.close();
  }

  protected onBackdrop(event: MouseEvent): void {
    // Only a click on the backdrop itself (not a child) closes the palette.
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected close(): void {
    this.isOpen.set(false);
  }
}
