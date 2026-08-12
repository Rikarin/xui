import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  input,
  model,
  signal,
  untracked,
  viewChild,
  viewChildren,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { arrowDirectionOnAxis, injectUniqueId, injectXDirection } from '@xui/core/a11y';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { XuiTab } from './tab';
import { injectXuiTabsConfig } from './tabs.token';

export const tabsTabVariants = cva(
  [
    'relative inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent font-medium whitespace-nowrap',
    // `:hover` matches a disabled button too, so the lift is scoped to the enabled ones now that
    // the tab is no longer inert.
    'text-foreground-muted enabled:hover:text-foreground transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    // A disabled tab keeps its pointer events so the cursor can say it is unavailable —
    // `pointer-events-none` would leave the arrow unchanged, since the browser takes no cursor from
    // an element that receives no pointer events. The native `disabled` already swallows the click,
    // and `select()` guards the tab's own flag on top of that.
    'aria-selected:text-foreground disabled:cursor-not-allowed disabled:opacity-50'
  ],
  {
    variants: {
      // Without the animated bar, the selected tab shows a static underline.
      animated: { true: '', false: 'aria-selected:border-primary' },
      large: { true: 'px-4 py-2.5 text-base', false: 'px-3 py-2 text-sm' },
      fill: { true: 'flex-1 justify-center', false: '' }
    },
    defaultVariants: { animated: false, large: false, fill: false }
  }
);

export type XuiTabsVariants = VariantProps<typeof tabsTabVariants>;

/**
 * A tab set: a `role="tablist"` of titles over the panel of whichever `xui-tab` is selected.
 *
 * ```html
 * <xui-tabs [(selectedTabId)]="tab">
 *   <xui-tab id="overview" title="Overview">…</xui-tab>
 *   <xui-tab id="activity" title="Activity">…</xui-tab>
 * </xui-tabs>
 * ```
 *
 * Tabs come from projected `xui-tab` children, so a panel's content is written where it reads. The
 * keyboard contract follows the WAI-ARIA APG — arrows move along the list on whichever axis
 * `orientation` runs, skipping disabled tabs — and selection defaults to the first enabled tab.
 */
@Component({
  selector: 'xui-tabs',
  imports: [NgTemplateOutlet],
  template: `
    <div #list [class]="listClass()" role="tablist" [attr.aria-orientation]="orientation()">
      @for (tab of tabs(); track tab.id()) {
        <button
          #tabButton
          type="button"
          role="tab"
          [id]="tabId(tab.id())"
          [class]="tabClass()"
          [disabled]="tab.disabled()"
          [attr.aria-selected]="tab.id() === activeTabId()"
          [attr.aria-controls]="panelId(tab.id())"
          [tabindex]="tab.id() === activeTabId() ? 0 : -1"
          (click)="select(tab.id())"
          (keydown)="onKeydown($event)"
        >
          @if (tab.titleTemplate(); as t) {
            <ng-container [ngTemplateOutlet]="t.template" />
          } @else {
            {{ tab.title() }}
          }
        </button>
      }

      @if (animate()) {
        <div aria-hidden="true" [class]="indicatorClass()" [style]="indicatorStyle()"></div>
      }
    </div>

    @for (tab of tabs(); track tab.id()) {
      @if (tab.id() === activeTabId() || !renderActiveTabPanelOnly()) {
        <div
          role="tabpanel"
          [id]="panelId(tab.id())"
          [attr.aria-labelledby]="tabId(tab.id())"
          [hidden]="tab.id() !== activeTabId()"
          [class]="panelClass()"
        >
          <ng-container [ngTemplateOutlet]="tab.content()" />
        </div>
      }
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTabs {
  private readonly uid = injectUniqueId('xui-tabs');
  private readonly config = injectXuiTabsConfig();

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** The projected `xui-tab` children, in DOM order. Read-only: add or remove tabs in the template. */
  readonly tabs = contentChildren(XuiTab);

  /**
   * The active tab id. Two-way bindable with `[(selectedTabId)]`.
   *
   * Left `null` it settles on the first enabled tab and writes that back after
   * the first render; an id naming no live tab falls back the same way.
   */
  readonly selectedTabId = model<string | null>(null);

  /**
   * Run the tab list across the top (`horizontal`) or down the side (`vertical`). Also picks which arrow keys move the selection.
   */
  readonly orientation = input<'horizontal' | 'vertical'>(this.config.orientation);
  /** Stretch the tabs to share the list's full width. Horizontal orientation only. */
  readonly fill = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Use the roomier tab padding and base font size. */
  readonly large = input<boolean, BooleanInput>(this.config.large, { transform: booleanAttribute });

  /** Slide an indicator bar under the active tab instead of a static underline. */
  readonly animate = input<boolean, BooleanInput>(this.config.animate, { transform: booleanAttribute });

  /** Keep only the active panel in the DOM (the others are not rendered). */
  readonly renderActiveTabPanelOnly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
  protected readonly direction = injectXDirection();
  protected readonly indicatorStyle = signal<Record<string, string>>({});

  /**
   * Which tab is actually showing: the selected one while it is live and
   * enabled, else the first enabled tab.
   *
   * A computed rather than an effect writing `selectedTabId`, because it is only
   * ever read from the template — and by then every child's `id` binding has
   * been applied. An effect reads them while the content query is still
   * reconciling, which for tabs built by a `@for` block is before that block has
   * bound anything, and a required input read in that window throws NG0950.
   */
  protected readonly activeTabId = computed<string | null>(() => {
    const tabs = this.tabs();
    const selected = this.selectedTabId();

    if (selected != null && tabs.some(tab => tab.id() === selected && !tab.disabled())) {
      return selected;
    }

    return tabs.find(tab => !tab.disabled())?.id() ?? null;
  });

  protected tabId(id: string): string {
    return `${this.uid}-tab-${id}`;
  }

  protected panelId(id: string): string {
    return `${this.uid}-panel-${id}`;
  }

  protected readonly computedClass = computed(() =>
    xui('block', this.orientation() === 'vertical' && 'flex gap-4', this.class())
  );

  protected readonly listClass = computed(() =>
    xui(
      'relative flex',
      // `border-e` rather than `border-e`: the rule belongs on the edge the
      // panel sits against, which swaps sides in RTL.
      this.orientation() === 'vertical' ? 'flex-col border-e border-border' : 'items-end gap-1 border-b border-border',
      this.fill() && this.orientation() !== 'vertical' && 'w-full'
    )
  );

  protected readonly tabClass = computed(() =>
    xui(tabsTabVariants({ animated: this.animate(), large: this.large(), fill: this.fill() }))
  );

  protected readonly indicatorClass = computed(() =>
    xui(
      'bg-primary pointer-events-none absolute transition-all duration-200',
      this.orientation() === 'vertical' ? 'end-0 w-0.5' : 'bottom-0 h-0.5'
    )
  );

  protected readonly panelClass = computed(() => xui('pt-4', this.orientation() === 'vertical' && 'flex-1 pt-0 ps-4'));

  constructor() {
    // Publish the resolved selection so `[(selectedTabId)]` reports what is on
    // screen. After render, because that is the first moment every child's `id`
    // is bound — and because the view already renders correctly without it, the
    // server, which runs no after-render work, loses nothing.
    afterRenderEffect(() => {
      const active = this.activeTabId();

      untracked(() => {
        if (active != null && active !== this.selectedTabId()) {
          this.selectedTabId.set(active);
        }
      });
    });

    // Position the sliding indicator under the active tab button. After render
    // too: it measures laid-out boxes.
    afterRenderEffect(() => {
      if (!this.animate()) {
        return;
      }

      const active = this.activeTabId();
      const buttons = this.tabButtons();
      const tabs = this.tabs();
      const index = tabs.findIndex(t => t.id() === active);
      const el = buttons[index]?.nativeElement;
      if (!el) {
        return;
      }

      if (this.orientation() === 'vertical') {
        this.indicatorStyle.set({ top: `${el.offsetTop}px`, height: `${el.offsetHeight}px` });
        return;
      }

      // `offsetLeft` is measured from the list's left edge in both directions,
      // so in RTL the inline offset is the distance from its *right* edge.
      const list = this.list().nativeElement;
      const inlineStart =
        this.direction() === 'rtl' ? list.offsetWidth - el.offsetLeft - el.offsetWidth : el.offsetLeft;

      this.indicatorStyle.set({ insetInlineStart: `${inlineStart}px`, width: `${el.offsetWidth}px` });
    });
  }

  protected select(id: string): void {
    const tab = this.tabs().find(t => t.id() === id);
    if (tab && !tab.disabled()) {
      this.selectedTabId.set(id);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const enabled = this.tabs().filter(t => !t.disabled());
    if (!enabled.length) {
      return;
    }

    const currentIndex = enabled.findIndex(t => t.id() === this.activeTabId());
    // Only the arrows along the list's own axis move the selection, and the
    // horizontal pair swaps meaning in RTL.
    const step = arrowDirectionOnAxis(event.key, this.direction(), this.orientation());
    let target: number;

    if (step === 'next') {
      target = (currentIndex + 1) % enabled.length;
    } else if (step === 'previous') {
      target = (currentIndex - 1 + enabled.length) % enabled.length;
    } else if (event.key === 'Home') {
      target = 0;
    } else if (event.key === 'End') {
      target = enabled.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const tab = enabled[target];
    this.selectedTabId.set(tab.id());
    // Move focus to the newly selected tab (roving tabindex).
    const allIndex = this.tabs().findIndex(t => t.id() === tab.id());
    this.tabButtons()[allIndex]?.nativeElement.focus();
  }
}
