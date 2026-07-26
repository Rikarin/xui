import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  model,
  output,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matSearchRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { injectXOverlay, type XOverlayRef } from '@xui/core/overlay';
import { createXActiveOption, createXItemListPredicate, createXQueryList, trackXItem } from '@xui/core/query';
import { XuiIcon } from '@xui/icon';
import { XuiSelectOption } from '@xui/select';
import type { ClassValue } from 'clsx';

/**
 * A ⌘K-style command palette: a top-centred overlay with a search field and a
 * keyboard-navigable result list. Toggle with `[(open)]`; Escape or a backdrop
 * click closes. Items render with a custom `[xuiSelectOption]` template.
 *
 * The palette mounts on the modal `@xui/core/overlay` layer — backdrop, focus
 * trap, background `inert`, focus restore and page-scroll lock all come from
 * there, exactly like `xui-dialog`.
 */
@Component({
  selector: 'xui-omnibar',
  imports: [NgTemplateOutlet, NgIcon, XuiIcon],
  template: `
    <ng-template #surface>
      <div [class]="panelClass()">
        <div class="border-border relative border-b">
          <ng-icon
            xui
            name="matSearchRound"
            size="md"
            class="text-foreground-muted pointer-events-none absolute start-4 top-1/2 -translate-y-1/2"
          />
          <input
            [id]="searchId"
            type="text"
            role="combobox"
            [attr.aria-expanded]="true"
            [attr.aria-controls]="listId"
            class="text-foreground placeholder:text-foreground-subtle w-full bg-transparent py-4 ps-12 pe-4 text-base outline-none"
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
    </ng-template>
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
  private readonly document = inject(DOCUMENT);
  private readonly overlay = injectXOverlay();
  private readonly surface = viewChild.required<TemplateRef<unknown>>('surface');
  private readonly destroyRef = inject(DestroyRef);
  protected readonly listId = uniqueId('xui-omnibar-list');
  protected readonly searchId = uniqueId('xui-omnibar-search');
  private ref: XOverlayRef | null = null;
  private destroyed = false;

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  /** Accessible name for the palette dialog. */
  readonly ariaLabel = input<string>('Command palette', { alias: 'aria-label' });

  /** The commands to search over. */
  readonly items = input<readonly T[]>([]);
  /**
   * How an item is labelled. Also what the default filter matches against, so give it the text the user would type.
   */
  readonly itemText = input<(item: T) => string>((item: T) => (item == null ? '' : String(item)));
  /** Custom filter for one item against the query. Defaults to a case-insensitive substring match on `itemText`. */
  readonly itemPredicate = input<(query: string, item: T) => boolean>();
  /** Which items cannot be chosen. They stay in the list, greyed out. */
  readonly itemDisabled = input<(item: T) => boolean>(() => false);

  /** Text shown in the empty query field. */
  readonly placeholder = input<string>('Type a command or search…');
  /** Shown in place of the list when the query matches nothing. */
  readonly noResultsText = input<string>('No results.');
  /** Clear the query when the palette closes, so it opens fresh next time. */
  readonly resetOnClose = input<boolean>(true);

  /** Whether the palette is showing. Two-way bindable with `[(open)]`. */
  readonly open = model(false);

  /** Emits the chosen command. Where the action goes — the palette only closes. */
  readonly itemSelected = output<T>();

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

  // Keyboard navigation over the filtered list (Escape must not bubble out of the modal).
  private readonly nav = createXActiveOption<T>({
    list: this.list,
    select: item => this.choose(item),
    close: () => this.close(),
    preventEscapeDefault: true
  });

  protected readonly computedClass = computed(() => xui('contents', this.class()));

  protected readonly panelClass = computed(() =>
    xui('bg-surface-raised border-border w-full max-w-xl overflow-hidden rounded-xl border shadow-overlay')
  );

  constructor() {
    this.destroyRef.onDestroy(() => (this.destroyed = true));

    // The `open` model is the single source of truth; the overlay follows it.
    effect(() => {
      const open = this.open();

      untracked(() => (open ? this.attach() : this.detach()));
    });

    // Focus the field on open; reset the query on close.
    effect(() => {
      const open = this.open();
      untracked(() => {
        if (open) {
          this.list.activateFirst();
          // The field renders in the overlay, outside this view's query scope,
          // so focus it by id once it has mounted.
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

  protected readonly trackItem = trackXItem;

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
    this.nav.onKeydown(event);
  }

  protected choose(item: T): void {
    if (this.list.isDisabled(item)) {
      return;
    }

    this.itemSelected.emit(item);
    this.close();
  }

  protected close(): void {
    this.open.set(false);
  }

  private attach(): void {
    if (this.ref) {
      return;
    }

    const ref = this.overlay.open(this.surface(), {
      position: 'global',
      // Top-centred like a command palette, not viewport-centred like a dialog.
      globalPosition: { top: '12vh', centerHorizontally: true },
      hasBackdrop: true,
      backdropClass: 'bg-foreground/40',
      scrollStrategy: 'block',
      closeOnOutsideClick: false,
      closeOnBackdropClick: true,
      trapFocus: true,
      autoFocus: true,
      restoreFocus: true,
      role: 'dialog',
      ariaLabel: this.ariaLabel()
    });

    this.ref = ref;

    // The overlay can close itself (Escape, backdrop click). Fold that back into
    // the model so `open` never lies about what is on screen; a stale ref's late
    // close must not clobber a palette that was reopened in the meantime. On
    // destroy the factory closes the overlay too — that is teardown, and writing
    // the model then would emit on a destroyed output.
    void ref.closed.then(() => {
      if (this.ref !== ref || this.destroyed) {
        return;
      }

      this.ref = null;
      untracked(() => this.open.set(false));
    });
  }

  private detach(): void {
    // Null synchronously so a reopen in the same tick does not see a stale ref.
    const ref = this.ref;
    this.ref = null;
    ref?.close();
  }
}
