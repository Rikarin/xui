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
  viewChildren,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { XuiTab } from './tab';

const tabVariants = cva(
  [
    'relative inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent font-medium whitespace-nowrap',
    'text-foreground-muted hover:text-foreground transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus focus:outline-none',
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

export type TabsVariants = VariantProps<typeof tabVariants>;

@Component({
  selector: 'xui-tabs',
  imports: [NgTemplateOutlet],
  template: `
    <div #list [class]="listClass()" role="tablist" [attr.aria-orientation]="vertical() ? 'vertical' : 'horizontal'">
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

  readonly class = input<ClassValue>('');

  readonly tabs = contentChildren(XuiTab);

  /** The active tab id. Two-way bindable with `[(selectedTabId)]`. */
  readonly selectedTabId = model<string | null>(null);

  readonly vertical = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly fill = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly large = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Slide an indicator bar under the active tab instead of a static underline. */
  readonly animate = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Keep only the active panel in the DOM (the others are not rendered). */
  readonly renderActiveTabPanelOnly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
  protected readonly indicatorStyle = signal<Record<string, string>>({});

  protected tabId(id: string): string {
    return `${this.uid}-tab-${id}`;
  }

  protected panelId(id: string): string {
    return `${this.uid}-panel-${id}`;
  }

  protected readonly computedClass = computed(() => xui('block', this.vertical() && 'flex gap-4', this.class()));

  protected readonly listClass = computed(() =>
    xui(
      'relative flex',
      this.vertical() ? 'flex-col border-r border-border' : 'items-end gap-1 border-b border-border',
      this.fill() && !this.vertical() && 'w-full'
    )
  );

  protected readonly tabClass = computed(() =>
    xui(tabVariants({ animated: this.animate(), large: this.large(), fill: this.fill() }))
  );

  protected readonly indicatorClass = computed(() =>
    xui(
      'bg-primary pointer-events-none absolute transition-all duration-200',
      this.vertical() ? 'right-0 w-0.5' : 'bottom-0 h-0.5'
    )
  );

  protected readonly panelClass = computed(() => xui('pt-4', this.vertical() && 'flex-1 pt-0 pl-4'));

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

      this.indicatorStyle.set(
        this.vertical()
          ? { top: `${el.offsetTop}px`, height: `${el.offsetHeight}px` }
          : { left: `${el.offsetLeft}px`, width: `${el.offsetWidth}px` }
      );
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
    const next = this.vertical() ? 'ArrowDown' : 'ArrowRight';
    const prev = this.vertical() ? 'ArrowUp' : 'ArrowLeft';
    let target: number;

    switch (event.key) {
      case next:
        target = (currentIndex + 1) % enabled.length;
        break;
      case prev:
        target = (currentIndex - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = enabled.length - 1;
        break;
      default:
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
