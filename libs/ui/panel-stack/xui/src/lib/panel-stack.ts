import type { BooleanInput } from '@angular/cdk/coercion';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matChevronLeftRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';
import { XUI_PANEL_DATA, XUI_PANEL_STACK, type XuiPanel } from './panel-stack.types';

/**
 * A stack of screens with a back-navigating header — a master/detail flow in a
 * fixed space, the way a settings drill-down or a wizard reads.
 *
 * ```html
 * <xui-panel-stack [initialPanel]="{ title: 'Settings', content: settingsTpl }" />
 * <ng-template #settingsTpl let-stack="stack">
 *   <button (click)="stack.openPanel({ title: 'Account', content: accountTpl })">Account →</button>
 * </ng-template>
 * ```
 *
 * Only the top panel renders; pushing slides it in from the right, popping
 * slides back from the left (Web Animations API, no `@angular/animations`,
 * reduced-motion aware). Panel content drives navigation through the `stack`
 * handed to a template, or injected (`XUI_PANEL_STACK`) by a component panel.
 */
@Component({
  selector: 'xui-panel-stack',
  imports: [NgTemplateOutlet, NgComponentOutlet, NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matChevronLeftRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showPanelHeader()) {
      <header class="border-border flex h-11 shrink-0 items-center border-b px-1">
        @if (depth() > 1) {
          <button
            type="button"
            class="text-foreground-muted hover:bg-hover-overlay hover:text-foreground flex h-9 items-center gap-0.5 rounded-md ps-1.5 pe-3 text-sm focus-visible:outline-5 focus-visible:outline-offset-2"
            (click)="closePanel()"
          >
            <ng-icon xui size="md" name="matChevronLeftRound" />
            {{ previousTitle() }}
          </button>
        }
        <span class="text-foreground pointer-events-none absolute left-1/2 -translate-x-1/2 text-sm font-semibold">
          {{ current().title }}
        </span>
      </header>
    }

    <div #view class="min-h-0 flex-1 overflow-auto">
      @if (templateContent(); as tpl) {
        <ng-container *ngTemplateOutlet="tpl; context: { $implicit: current().data, stack: controller }" />
      } @else if (componentContent(); as cmp) {
        <ng-container *ngComponentOutlet="cmp; injector: panelInjector()" />
      }
    </div>
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiPanelStack<D = unknown> {
  private readonly host = inject(Injector);
  private readonly view = viewChild.required<ElementRef<HTMLElement>>('view');

  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');
  readonly initialPanel = input.required<XuiPanel<D>>();
  readonly showPanelHeader = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  readonly opened = output<XuiPanel>();
  readonly closed = output<XuiPanel>();

  private readonly stack = signal<XuiPanel[]>([]);

  protected readonly current = computed(() => {
    const panels = this.stack();

    return panels.length ? panels[panels.length - 1] : (this.initialPanel() as XuiPanel);
  });
  protected readonly depth = computed(() => Math.max(this.stack().length, 1));
  protected readonly previousTitle = computed(() => {
    const panels = this.stack();

    return panels.length > 1 ? panels[panels.length - 2].title : '';
  });

  /** The handle passed to template panels and provided to component panels. */
  protected readonly controller = {
    openPanel: <P>(panel: XuiPanel<P>) => this.openPanel(panel as XuiPanel),
    closePanel: () => this.closePanel()
  };

  protected readonly templateContent = computed(() => {
    const content = this.current().content;

    return content instanceof TemplateRef ? (content as TemplateRef<unknown>) : null;
  });
  protected readonly componentContent = computed(() => {
    const content = this.current().content;

    return content instanceof TemplateRef ? null : content;
  });

  protected readonly panelInjector = computed(() =>
    Injector.create({
      providers: [
        { provide: XUI_PANEL_STACK, useValue: this.controller },
        { provide: XUI_PANEL_DATA, useValue: this.current().data }
      ],
      parent: this.host
    })
  );

  protected readonly computedClass = computed(() =>
    xui('bg-surface-raised border-border relative flex flex-col overflow-hidden rounded-lg border', this.class())
  );

  constructor() {
    // Seed the stack from the initial panel once it is available.
    effect(() => {
      const initial = this.initialPanel();

      untracked(() => {
        if (!this.stack().length) {
          this.stack.set([initial]);
        }
      });
    });

    // Slide whenever the depth changes — right-to-left on push, the reverse on pop.
    let previousDepth = 1;

    effect(() => {
      const depth = this.depth();

      untracked(() => {
        if (depth !== previousDepth) {
          this.slide(depth > previousDepth ? 1 : -1);
          previousDepth = depth;
        }
      });
    });
  }

  openPanel<P>(panel: XuiPanel<P>): void {
    this.stack.update(panels => [...panels, panel as XuiPanel]);
    this.opened.emit(panel as XuiPanel);
  }

  closePanel(): void {
    const panels = this.stack();

    if (panels.length <= 1) {
      return;
    }

    this.stack.set(panels.slice(0, -1));
    this.closed.emit(panels[panels.length - 1]);
  }

  private slide(direction: 1 | -1): void {
    if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const element = this.view().nativeElement;
    element.animate(
      [
        { transform: `translateX(${direction * 24}px)`, opacity: 0 },
        { transform: 'none', opacity: 1 }
      ],
      {
        duration: 180,
        easing: 'ease-out'
      }
    );
  }
}
