import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  input,
  model,
  signal,
  viewChild,
  viewChildren,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { arrowDirectionOnAxis, injectXDirection, uniqueId } from '@xui/core/a11y';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { XuiTab } from './tab';
import { injectXuiTabsConfig } from './tabs.token';

const tabVariants = cva(
  [
    'relative inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent font-medium whitespace-nowrap',
    'text-foreground-muted hover:text-foreground transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    'aria-selected:text-foreground disabled:pointer-events-none disabled:opacity-50'
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

export type XuiTabsVariants = VariantProps<typeof tabVariants>;

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
          [attr.aria-selected]="tab.id() === selectedTabId()"
          [attr.aria-controls]="panelId(tab.id())"
          [tabindex]="tab.id() === selectedTabId() ? 0 : -1"
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
      @if (tab.id() === selectedTabId() || !renderActiveTabPanelOnly()) {
        <div
          role="tabpanel"
          [id]="panelId(tab.id())"
          [attr.aria-labelledby]="tabId(tab.id())"
          [hidden]="tab.id() !== selectedTabId()"
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
  private readonly uid = uniqueId('xui-tabs');
  private readonly config = injectXuiTabsConfig();

  readonly class = input<ClassValue>('');

  readonly tabs = contentChildren(XuiTab);

  /** The active tab id. Two-way bindable with `[(selectedTabId)]`. */
  readonly selectedTabId = model<string | null>(null);

  readonly orientation = input<'horizontal' | 'vertical'>(this.config.orientation);
  readonly fill = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly large = input<boolean, BooleanInput>(this.config.large, { transform: booleanAttribute });

  /** Slide an indicator bar under the active tab instead of a static underline. */
  readonly animate = input<boolean, BooleanInput>(this.config.animate, { transform: booleanAttribute });

  /** Keep only the active panel in the DOM (the others are not rendered). */
  readonly renderActiveTabPanelOnly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
  protected readonly direction = injectXDirection();
  protected readonly indicatorStyle = signal<Record<string, string>>({});

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
    xui(tabVariants({ animated: this.animate(), large: this.large(), fill: this.fill() }))
  );

  protected readonly indicatorClass = computed(() =>
    xui(
      'bg-primary pointer-events-none absolute transition-all duration-200',
      this.orientation() === 'vertical' ? 'end-0 w-0.5' : 'bottom-0 h-0.5'
    )
  );

  protected readonly panelClass = computed(() => xui('pt-4', this.orientation() === 'vertical' && 'flex-1 pt-0 ps-4'));

  constructor() {
    // Default the selection to the first non-disabled tab.
    effect(() => {
      const tabs = this.tabs();
      if (!tabs.length) {
        return;
      }

      const current = this.selectedTabId();
      const stillPresent = current != null && tabs.some(t => t.id() === current && !t.disabled());
      if (!stillPresent) {
        const first = tabs.find(t => !t.disabled());
        if (first) {
          this.selectedTabId.set(first.id());
        }
      }
    });

    // Position the sliding indicator under the active tab button.
    effect(() => {
      if (!this.animate()) {
        return;
      }

      const selected = this.selectedTabId();
      const buttons = this.tabButtons();
      const tabs = this.tabs();
      const index = tabs.findIndex(t => t.id() === selected);
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

    const currentIndex = enabled.findIndex(t => t.id() === this.selectedTabId());
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
