import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
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
  numberAttribute,
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
import { isXMacPlatform, isXTextEntryTarget, matchesXCombo, parseXCombo } from '@xui/core/hotkeys';
import { injectXOverlay, type XOverlayRef } from '@xui/core/overlay';
import {
  createXActiveOption,
  createXItemListPredicate,
  createXQueryList,
  matchXRanges,
  splitXMatchRanges,
  type XMatchRange,
  type XMatchSegment
} from '@xui/core/query';
import { XuiIcon } from '@xui/icon';
import { XuiSelectOption } from '@xui/select';
import { XuiSpinner } from '@xui/spinner';
import { XuiTag } from '@xui/tag';
import type { ClassValue } from 'clsx';
import { isObservable, type Subscription } from 'rxjs';
import { XuiOmnibarEmpty } from './omnibar-empty';
import type { XuiOmnibarProvider, XuiOmnibarRow, XuiOmnibarTag } from './omnibar.types';

/** A row plus everything the template needs to draw it, worked out once per result set. */
type Row<T> = XuiOmnibarRow<T> & { segments?: XMatchSegment[] };

/**
 * A ⌘K-style command palette: a top-centred overlay with a search field and a
 * keyboard-navigable result list. Toggle with `[(open)]`, or let it bind its own
 * `hotkey`; Escape or a backdrop click closes. Items render with a custom
 * `[xuiSelectOption]` template.
 *
 * ```html
 * <xui-omnibar [items]="commands()" [itemText]="label" (itemSelected)="run($event)" />
 * ```
 *
 * The palette mounts on the modal `@xui/core/overlay` layer — backdrop, focus
 * trap, background `inert`, focus restore and page-scroll lock all come from
 * there, exactly like `xui-dialog`.
 *
 * It scales from a handful of commands to a search over everything: given
 * `items` it filters locally, given an `itemsProvider` it debounces the query,
 * awaits the answer and shows a spinner meanwhile. Results can be grouped,
 * faceted with filter chips and marked where they matched; past
 * `virtualScrollThreshold` rows the list virtualises, so the size of the index
 * stops mattering.
 *
 * Focus stays in the search field throughout — the active row is published with
 * `aria-activedescendant` rather than by moving focus, which is what lets a
 * reader keep typing while the selection moves.
 */
@Component({
  selector: 'xui-omnibar',
  imports: [
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
    NgTemplateOutlet,
    NgIcon,
    XuiIcon,
    XuiSpinner,
    XuiTag
  ],
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
            autocomplete="off"
            [attr.aria-expanded]="true"
            [attr.aria-controls]="listId"
            [attr.aria-activedescendant]="activeOptionId()"
            class="text-foreground placeholder:text-foreground-subtle w-full bg-transparent py-4 ps-12 pe-12 text-base outline-none"
            [placeholder]="placeholder()"
            [value]="query()"
            (input)="onQuery($event)"
            (keydown)="onKeydown($event)"
          />
          @if (loading()) {
            <xui-spinner
              size="xs"
              color="inherit"
              class="text-foreground-muted absolute end-4 top-1/2 -translate-y-1/2"
              >{{ loadingText() }}</xui-spinner
            >
          }
        </div>

        @if (tags().length) {
          <div class="border-border flex flex-wrap items-center gap-1.5 border-b px-3 py-2">
            @for (tag of tags(); track tag.id) {
              <xui-tag
                interactive
                round
                role="checkbox"
                tabindex="0"
                [minimal]="!isTagSelected(tag)"
                [color]="isTagSelected(tag) ? 'primary' : 'none'"
                [icon]="tag.icon ?? null"
                [attr.aria-checked]="isTagSelected(tag)"
                (click)="toggleTag(tag)"
                (keydown.enter)="toggleTag(tag)"
                (keydown.space)="toggleTag(tag); $event.preventDefault()"
                >{{ tag.label }}</xui-tag
              >
            }
          </div>
        }

        <ng-template #rowTpl let-row>
          @if (row.kind === 'group') {
            <!-- Sticky is a positioned box, and the rows scrolling under it are not, so it already
                 paints on top — no z-index, which would be a stacking decision this does not own. -->
            <div
              role="presentation"
              class="bg-surface-raised text-foreground-subtle sticky top-0 flex items-center px-3 py-1.5 text-xs font-semibold tracking-wide uppercase"
            >
              {{ row.label }}
            </div>
          } @else {
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <div
              role="option"
              [id]="optionId(row.index)"
              [class]="optionClass(row.item)"
              [attr.aria-selected]="list.isActive(row.item)"
              [attr.aria-disabled]="list.isDisabled(row.item) || null"
              (click)="choose(row.item)"
              (mouseenter)="list.setActiveItem(row.item)"
            >
              @if (optionTemplate(); as tpl) {
                <ng-container
                  [ngTemplateOutlet]="tpl.template"
                  [ngTemplateOutletContext]="{
                    $implicit: row.item,
                    item: row.item,
                    active: list.isActive(row.item),
                    selected: false,
                    index: row.index
                  }"
                />
              } @else {
                <!-- prettier-ignore -->
                <span class="truncate">@for (segment of row.segments; track $index) {@if (segment.match) {<mark class="bg-primary/20 text-primary rounded-sm">{{ segment.text }}</mark>} @else {{{ segment.text }}}}</span>
              }
            </div>
          }
        </ng-template>

        @if (virtualised()) {
          <cdk-virtual-scroll-viewport
            [id]="listId"
            role="listbox"
            class="h-80 p-2"
            [itemSize]="itemSize()"
            [attr.aria-label]="ariaLabel()"
          >
            <ng-container *cdkVirtualFor="let entry of rows(); trackBy: trackRow">
              <ng-container [ngTemplateOutlet]="rowTpl" [ngTemplateOutletContext]="{ $implicit: entry }" />
            </ng-container>
          </cdk-virtual-scroll-viewport>
        } @else {
          <div [id]="listId" role="listbox" class="max-h-80 overflow-y-auto p-2" [attr.aria-label]="ariaLabel()">
            @for (entry of rows(); track trackRow($index, entry)) {
              <ng-container [ngTemplateOutlet]="rowTpl" [ngTemplateOutletContext]="{ $implicit: entry }" />
            } @empty {
              <div class="text-foreground-muted px-3 py-6 text-center text-sm">
                @if (emptyTemplate(); as tpl) {
                  <ng-container
                    [ngTemplateOutlet]="tpl"
                    [ngTemplateOutletContext]="{ $implicit: query(), query: query() }"
                  />
                } @else {
                  {{ noResultsText() }}
                }
              </div>
            }
          </div>
        }
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
  private readonly viewport = viewChild(CdkVirtualScrollViewport);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly listId = uniqueId('xui-omnibar-list');
  protected readonly searchId = uniqueId('xui-omnibar-search');
  private ref: XOverlayRef | null = null;
  private destroyed = false;

  private readonly loadingState = signal(false);

  /** Whether an `itemsProvider` request is in flight. */
  readonly loading = this.loadingState.asReadonly();

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  /** Accessible name for the palette dialog, and for its result list. */
  readonly ariaLabel = input<string>('Command palette', { alias: 'aria-label' });

  /** The commands to search over. Ignored while an `itemsProvider` is set. */
  readonly items = input<readonly T[]>([]);

  /**
   * Fetch the results rather than filtering `items` locally.
   *
   * The query is debounced by `debounce`, only the newest response is kept, and
   * whatever comes back is shown as it arrived — a provider has already decided
   * what matches, so nothing filters it a second time. The filter chips still
   * apply, since they narrow whatever the palette is currently holding.
   */
  readonly itemsProvider = input<XuiOmnibarProvider<T> | null>(null);

  /** How long typing has to settle before `itemsProvider` runs, in milliseconds. */
  readonly debounce = input<number, NumberInput>(150, { transform: numberAttribute });

  /**
   * Shown while the query is empty — whatever somebody reached for last time.
   *
   * The palette remembers nothing itself: what counts as recent is the
   * application's call, made from the `itemSelected` it already receives.
   */
  readonly recentItems = input<readonly T[]>([]);

  /** Heading over the recent items. */
  readonly recentLabel = input<string>('Recent');

  /**
   * Which group an item belongs under. Results are bucketed in first-seen order
   * and the arrow keys walk them in exactly that order, so the keyboard and the
   * screen never disagree about what comes next.
   */
  readonly itemGroup = input<((item: T) => string) | null>(null);

  /** The filter chips shown above the results. */
  readonly tags = input<readonly XuiOmnibarTag[]>([]);

  /** Which chips are on. Two-way bindable with `[(selectedTags)]`. */
  readonly selectedTags = model<readonly string[]>([]);

  /** An item's tag ids. With chips on, an item survives if it carries any of them. */
  readonly itemTags = input<((item: T) => readonly string[]) | null>(null);

  /**
   * How an item is labelled. Also what the default filter matches against, so give it the text the user would type.
   */
  readonly itemText = input<(item: T) => string>((item: T) => (item == null ? '' : String(item)));
  /** Custom filter for one item against the query. Defaults to a case-insensitive substring match on `itemText`. */
  readonly itemPredicate = input<(query: string, item: T) => boolean>();
  /** Which items cannot be chosen. They stay in the list, greyed out. */
  readonly itemDisabled = input<(item: T) => boolean>(() => false);

  /**
   * Where an item matched, for the marks in its label. Defaults to matching the
   * query's words against `itemText` — override it when the ranking came from a
   * search index that already knows where the hits were.
   */
  readonly itemRanges = input<((item: T, query: string) => readonly XMatchRange[]) | null>(null);

  /** Mark the matched runs of a label. Ignored when a `[xuiSelectOption]` template owns the row. */
  readonly highlightMatches = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /**
   * Row count past which the list virtualises. Above it every row is a fixed
   * `itemSize` tall, which is the price of not rendering ten thousand of them.
   */
  readonly virtualScrollThreshold = input<number, NumberInput>(200, { transform: numberAttribute });

  /** Row height used while virtualising, in pixels. */
  readonly itemSize = input<number, NumberInput>(44, { transform: numberAttribute });

  /**
   * Combo — or combos — that open the palette from anywhere: `mod+k`, `/`,
   * `['mod+k', '/']`. `null` leaves the shortcut to the application.
   *
   * A combo with no modifier is ignored while a text field has focus, so `/`
   * still types a slash where a slash is what was meant.
   */
  readonly hotkey = input<string | readonly string[] | null>('mod+k');

  /** Text shown in the empty query field. */
  readonly placeholder = input<string>('Type a command or search…');
  /** Shown in place of the list when the query matches nothing. Replaced by a `[xuiOmnibarEmpty]` template. */
  readonly noResultsText = input<string>('No results.');
  /** Accessible label for the loading spinner. */
  readonly loadingText = input<string>('Searching');
  /** Clear the query when the palette closes, so it opens fresh next time. */
  readonly resetOnClose = input<boolean>(true);

  /** Whether the palette is showing. Two-way bindable with `[(open)]`. */
  readonly open = model(false);

  /** Emits the chosen command. Where the action goes — the palette only closes. */
  readonly itemSelected = output<T>();

  protected readonly query = signal('');
  protected readonly optionTemplate = contentChild(XuiSelectOption<T>);
  protected readonly emptyTemplate = contentChild(XuiOmnibarEmpty, { read: TemplateRef });

  private readonly asyncItems = signal<readonly T[]>([]);
  private readonly isMac = isXMacPlatform(this.document.defaultView?.navigator);

  /** With nothing typed, the recents stand in for the results. */
  protected readonly showRecents = computed(() => !this.query().trim() && this.recentItems().length > 0);

  private readonly baseItems = computed(() => (this.itemsProvider() ? this.asyncItems() : this.items()));

  private readonly taggedItems = computed<readonly T[]>(() => {
    const selected = this.selectedTags();
    const itemTags = this.itemTags();
    const items = this.baseItems();

    if (!selected.length || !itemTags) {
      return items;
    }

    return items.filter(item => itemTags(item).some(tag => selected.includes(tag)));
  });

  /**
   * The list the keyboard walks. Grouping reorders it here rather than at render
   * time, so "the next item" means the same thing to the arrow keys as it does
   * to the eye.
   */
  private readonly sourceItems = computed<readonly T[]>(() => {
    if (this.showRecents()) {
      return this.recentItems();
    }

    const group = this.itemGroup();
    const items = this.taggedItems();

    if (!group) {
      return items;
    }

    const buckets = new Map<string, T[]>();

    for (const item of items) {
      const key = group(item);
      const bucket = buckets.get(key);

      if (bucket) {
        bucket.push(item);
      } else {
        buckets.set(key, [item]);
      }
    }

    return [...buckets.values()].flat();
  });

  private readonly localPredicate = createXItemListPredicate<T>({
    itemText: this.itemText,
    itemPredicate: this.itemPredicate
  });

  protected readonly list = createXQueryList<T>({
    items: this.sourceItems,
    query: this.query,
    itemText: item => this.itemText()(item),
    itemDisabled: item => this.itemDisabled()(item),
    // A provider has already filtered, and the recents are what an empty query
    // is *for* — filtering either again could only take things away.
    itemListPredicate: (query, items) =>
      this.itemsProvider() || this.showRecents() ? [...items] : this.localPredicate(query, items)
  });

  // Keyboard navigation over the filtered list (Escape must not bubble out of the modal).
  private readonly nav = createXActiveOption<T>({
    list: this.list,
    select: item => this.choose(item),
    close: () => this.close(),
    preventEscapeDefault: true
  });

  /** The rows on screen: the results, with a heading wherever the group changes. */
  protected readonly rows = computed<Row<T>[]>(() => {
    const items = this.list.filteredItems();
    const rows: Row<T>[] = [];
    let group: string | null = null;

    items.forEach((item, index) => {
      const label = this.groupLabelOf(item);

      if (label !== null && label !== group) {
        rows.push({ kind: 'group', label });
        group = label;
      }

      rows.push({ kind: 'item', item, index, segments: this.segmentsOf(item) });
    });

    return rows;
  });

  protected readonly virtualised = computed(() => this.rows().length > this.virtualScrollThreshold());

  protected readonly activeOptionId = computed(() => {
    const index = this.nav.activeIndex();

    return index < 0 ? null : this.optionId(index);
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

    this.runProviderOnQuery();
    this.keepActiveRowInView();
    this.bindHotkey();
  }

  protected trackRow = (index: number, row: Row<T>): unknown => (row.kind === 'group' ? `group:${row.label}` : index);

  protected optionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  protected isTagSelected(tag: XuiOmnibarTag): boolean {
    return this.selectedTags().includes(tag.id);
  }

  protected toggleTag(tag: XuiOmnibarTag): void {
    this.selectedTags.update(selected =>
      selected.includes(tag.id) ? selected.filter(id => id !== tag.id) : [...selected, tag.id]
    );
    this.list.activateFirst();
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

  /** The heading an item sits under, or `null` when the list is ungrouped. */
  private groupLabelOf(item: T): string | null {
    if (this.showRecents()) {
      return this.recentLabel();
    }

    return this.itemGroup()?.(item) ?? null;
  }

  private segmentsOf(item: T): XMatchSegment[] {
    const text = this.itemText()(item);
    const query = this.query();

    if (!this.highlightMatches() || !query.trim() || this.showRecents()) {
      return [{ text, match: false }];
    }

    return splitXMatchRanges(text, this.itemRanges()?.(item, query) ?? matchXRanges(text, query));
  }

  /**
   * Debounce the query, run the provider, keep only the newest answer.
   *
   * The cleanup cancels the pending timer and unsubscribes, so a request whose
   * query has already been typed over cannot win a race against a later one.
   */
  private runProviderOnQuery(): void {
    effect(onCleanup => {
      const provider = this.itemsProvider();
      const query = this.query();
      const open = this.open();
      const delay = this.debounce();

      // A closed palette has nothing to show, and a keystroke nobody is looking
      // at is still somebody else's rate limit.
      if (!provider || !open) {
        return;
      }

      let cancelled = false;
      let subscription: Subscription | undefined;

      const settle = (items: readonly T[]) => {
        if (cancelled) {
          return;
        }

        untracked(() => {
          this.asyncItems.set(items);
          this.loadingState.set(false);
          this.list.activateFirst();
        });
      };

      const fail = () => {
        if (!cancelled) {
          untracked(() => this.loadingState.set(false));
        }
      };

      const timer = setTimeout(() => {
        untracked(() => this.loadingState.set(true));

        const result = provider(query);

        if (isObservable(result)) {
          subscription = result.subscribe({ next: settle, error: fail });
        } else {
          result.then(settle, fail);
        }
      }, delay);

      onCleanup(() => {
        cancelled = true;
        clearTimeout(timer);
        subscription?.unsubscribe();
      });
    });
  }

  /**
   * Keep the active row visible as the arrows move it.
   *
   * After render, because both branches measure: the virtual viewport is told an
   * offset, and the plain list scrolls the row's own element.
   */
  private keepActiveRowInView(): void {
    afterRenderEffect(() => {
      const active = this.list.activeItem();
      const rows = this.rows();
      const viewport = this.viewport();

      if (active == null || !this.open()) {
        return;
      }

      const rowIndex = rows.findIndex(row => row.kind === 'item' && row.item === active);
      const row = rows[rowIndex];

      if (!row || row.kind !== 'item') {
        return;
      }

      if (!viewport) {
        const element = this.document.getElementById(this.optionId(row.index));

        // Guarded rather than called: an environment with no layout — jsdom, a
        // prerender — has the element but not the method.
        element?.scrollIntoView?.({ block: 'nearest' });

        return;
      }

      // `scrollToIndex` puts the row at the top, which turns one arrow press
      // into a jump. Scroll by the smallest amount that brings it into view.
      const size = this.itemSize();
      const offset = viewport.measureScrollOffset();
      const height = viewport.getViewportSize();
      const top = rowIndex * size;

      if (top < offset) {
        viewport.scrollToOffset(top);
      } else if (top + size > offset + height) {
        viewport.scrollToOffset(top + size - height);
      }
    });
  }

  /** Open the palette on its own shortcut, from anywhere in the document. */
  private bindHotkey(): void {
    if (!this.document.defaultView) {
      return;
    }

    const listener = (event: KeyboardEvent): void => {
      const hotkey = this.hotkey();

      if (!hotkey || this.open()) {
        return;
      }

      for (const combo of typeof hotkey === 'string' ? [hotkey] : hotkey) {
        const parsed = parseXCombo(combo);
        const bare = !parsed.mod && !parsed.ctrl && !parsed.meta && !parsed.alt;

        if (bare && isXTextEntryTarget(event.target)) {
          continue;
        }

        if (matchesXCombo(parsed, event, this.isMac)) {
          event.preventDefault();
          this.open.set(true);

          return;
        }
      }
    };

    this.document.addEventListener('keydown', listener);
    this.destroyRef.onDestroy(() => this.document.removeEventListener('keydown', listener));
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
