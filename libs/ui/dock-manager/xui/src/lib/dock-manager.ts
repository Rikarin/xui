import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewContainerRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  type EmbeddedViewRef
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matCloseFullscreenRound,
  matCloseRound,
  matDockRound,
  matOpenInFullRound,
  matOpenInNewRound,
  matPushPinRound
} from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { arrowDirectionOnAxis, injectXDirection } from '@xui/core/a11y';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';
import {
  XUI_DOCK_CONTENT_MOUNTER,
  XuiDockContent,
  XuiDockContentOutlet,
  type XuiDockContentMounter
} from './dock-content';
import {
  isContentPane,
  isDocumentHost,
  isSplitPane,
  isTabGroupPane,
  type XuiDockContentPane,
  type XuiDockManagerLayout,
  type XuiDockPane,
  type XuiDockPaneStateEvent,
  type XuiDockPoint,
  type XuiDockPosition,
  type XuiDockSplitPane,
  type XuiDockTabGroupPane,
  type XuiDockUnpinnedLocation
} from './dock-manager.types';
import {
  canDockInto,
  collectContentPanes,
  defaultUnpinnedLocation,
  dockPaneAt,
  dockPaneKey,
  findMaximizedPane,
  floatDockPane,
  normalizeDockLayout,
  removeDockPane,
  selectedTabPane,
  unpinnedDockPanes,
  visibleDockChildren
} from './dock-manager.utils';

/** Thickness of the edge strips that hold unpinned panes' tabs, in pixels. */
const STRIP_SIZE = 32;

/** How close to the dock manager's own edge a drop docks against the whole layout. */
const OUTER_EDGE = 28;

/** A pane never resizes below this, so its header always stays grabbable. */
const MIN_PANE_SIZE = 48;

/** Where a floating window sits when its layout gives no `floatingLocation`. */
const FLOATING_ORIGIN: XuiDockPoint = { x: 40, y: 40 };

/** Pointer travel before a press on a header turns into a drag. */
const DRAG_THRESHOLD = 4;

/** The centre of a pane is a "tab it here" target; outside it, the nearest edge wins. */
const CENTRE_ZONE = 0.3;

/**
 * Dragging a floating window is mostly about *moving* it, so it only docks from
 * close to a pane's edge or from a small target at its centre. A header or tab
 * drag has no other purpose, so it docks from anywhere over a pane.
 */
const DOCK_BAND = 48;
const DOCK_HOTSPOT = 40;

interface DropTarget {
  pane: XuiDockPane;
  position: XuiDockPosition;
}

interface DragState {
  /** The pane being dragged — a content pane, or a floating window's root. */
  pane: XuiDockPane;
  /** Set when the gesture started on a floating window's title bar. */
  window: XuiDockSplitPane | null;
  x: number;
  y: number;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * An IDE-style docking layout: resizable split panes, tab groups, a document
 * host, collapsible edge panels and floating windows, all driven by one
 * serialisable {@link XuiDockManagerLayout} tree.
 *
 * ```html
 * <xui-dock-manager [(layout)]="layout" class="h-[32rem]">
 *   <ng-template xuiDockContent="explorer">…</ng-template>
 *   <ng-template xuiDockContent="editor">…</ng-template>
 * </xui-dock-manager>
 * ```
 *
 * The layout shape follows Ignite UI's `IgcDockManagerLayout`, so existing
 * layouts port over by dropping the `Igc` prefix and using string literals in
 * place of its enums.
 *
 * Panes carry no content of their own: each one names a `contentId`, and the
 * matching `[xuiDockContent]` template supplies the body. Those bodies are
 * instantiated once and then *moved* as the layout changes, so a pane keeps its
 * scroll position and component state when it is dragged to another dock, tabbed,
 * floated or collapsed.
 *
 * `layout` is two-way bindable and the dock manager edits the tree **in place**
 * before emitting, which is what keeps pane identity stable across a drag. Bind a
 * signal to it and snapshot with `cloneDockLayout()` if you need an undo buffer.
 *
 * Dragging is a pointer gesture. A header or tab drag docks the pane wherever it
 * is dropped over the layout — the centre of a pane tabs it, the edges split it —
 * and floats it if dropped outside. A floating window's title bar mostly *moves*
 * the window, and only docks it from close to a pane's edge or its centre.
 *
 * Every other operation — close, pin, maximize, float, tab selection, splitter
 * resize — is reachable from the keyboard, and the public methods (`closePane`,
 * `unpinPane`, `dockPane`, …) drive the same paths for code.
 */
@Component({
  selector: 'xui-dock-manager',
  imports: [NgTemplateOutlet, NgIcon, XuiIcon, XuiDockContentOutlet],
  viewProviders: [
    provideIcons({
      matCloseRound,
      matDockRound,
      matPushPinRound,
      matOpenInFullRound,
      matCloseFullscreenRound,
      matOpenInNewRound
    })
  ],
  providers: [{ provide: XUI_DOCK_CONTENT_MOUNTER, useExisting: forwardRef(() => XuiDockManager) }],
  template: `
    <!-- ─── one content pane: header chrome plus the body outlet ─────────── -->
    <ng-template #contentTpl let-pane let-hideHeader="hideHeader">
      <div
        [class]="frameClass(pane)"
        [attr.data-dock-key]="key(pane)"
        (pointerdown)="activate(pane)"
        (focusin)="activate(pane)"
      >
        @if (!hideHeader) {
          <div
            [class]="headerClass(pane)"
            (pointerdown)="startPaneDrag(pane, null, $event)"
            (dblclick)="toggleMaximized(pane)"
          >
            <span class="min-w-0 flex-1 truncate">{{ pane.header }}</span>
            <ng-container [ngTemplateOutlet]="paneActionsTpl" [ngTemplateOutletContext]="{ $implicit: pane }" />
          </div>
        }

        <div class="min-h-0 min-w-0 flex-1 overflow-auto" [xuiDockContentOutlet]="pane.contentId"></div>
      </div>
    </ng-template>

    <!-- ─── the pin / maximize / close cluster, shared by headers and tabs ── -->
    <ng-template #paneActionsTpl let-pane>
      <div class="flex shrink-0 items-center">
        @if (pane.allowPinning !== false && !pane.documentOnly) {
          <button
            type="button"
            [class]="actionClass()"
            [attr.aria-label]="(pane.isPinned === false ? 'Pin ' : 'Collapse ') + (pane.header || pane.contentId)"
            (click)="togglePinned(pane); $event.stopPropagation()"
            (pointerdown)="$event.stopPropagation()"
          >
            <ng-icon xui size="14px" name="matPushPinRound" [class]="pane.isPinned === false ? 'text-primary' : ''" />
          </button>
        }
        @if (pane.allowFloating !== false && !pane.documentOnly && !isFloating(pane)) {
          <button
            type="button"
            [class]="actionClass()"
            [attr.aria-label]="'Float ' + (pane.header || pane.contentId)"
            (click)="floatPane(pane); $event.stopPropagation()"
            (pointerdown)="$event.stopPropagation()"
          >
            <ng-icon xui size="14px" name="matOpenInNewRound" />
          </button>
        }
        @if (pane.allowMaximize !== false) {
          <button
            type="button"
            [class]="actionClass()"
            [attr.aria-label]="(pane.isMaximized ? 'Restore ' : 'Maximize ') + (pane.header || pane.contentId)"
            (click)="toggleMaximized(pane); $event.stopPropagation()"
            (pointerdown)="$event.stopPropagation()"
          >
            <ng-icon xui size="14px" [name]="pane.isMaximized ? 'matCloseFullscreenRound' : 'matOpenInFullRound'" />
          </button>
        }
        @if (pane.allowClose !== false) {
          <button
            type="button"
            [class]="actionClass()"
            [attr.aria-label]="'Close ' + (pane.header || pane.contentId)"
            (click)="closePane(pane); $event.stopPropagation()"
            (pointerdown)="$event.stopPropagation()"
          >
            <ng-icon xui size="14px" name="matCloseRound" />
          </button>
        }
      </div>
    </ng-template>

    <!-- ─── a tab group: one strip, one visible body ─────────────────────── -->
    <ng-template #tabGroupTpl let-pane>
      <div [class]="frameClass(pane)" [attr.data-dock-key]="key(pane)">
        <div [class]="tabStripClass()" role="tablist">
          @for (tab of pinnedTabs(pane); track key(tab)) {
            <button
              type="button"
              role="tab"
              [class]="tabClass(pane, tab)"
              [attr.aria-selected]="tab === selectedTab(pane)"
              [tabindex]="tab === selectedTab(pane) ? 0 : -1"
              (click)="selectPane(tab)"
              (pointerdown)="startPaneDrag(tab, null, $event)"
              (dblclick)="toggleMaximized(tab)"
              (keydown)="onTabKeydown(pane, $event)"
            >
              <span class="min-w-0 truncate">{{ tab.header }}</span>
              @if (tab.allowClose !== false) {
                <!-- A nested <button> is invalid markup, so this affordance is
                     pointer-only and hidden from assistive technology; the
                     action cluster on the right carries the real close button. -->
                <span
                  aria-hidden="true"
                  [class]="tabCloseClass()"
                  (click)="closePane(tab); $event.stopPropagation()"
                  (pointerdown)="$event.stopPropagation()"
                >
                  <ng-icon xui size="12px" name="matCloseRound" />
                </span>
              }
            </button>
          }

          @if (selectedTab(pane); as tab) {
            <div class="ms-auto flex items-center ps-1">
              <ng-container [ngTemplateOutlet]="paneActionsTpl" [ngTemplateOutletContext]="{ $implicit: tab }" />
            </div>
          }
        </div>

        @if (selectedTab(pane); as tab) {
          <div
            role="tabpanel"
            class="min-h-0 min-w-0 flex-1 overflow-auto"
            [xuiDockContentOutlet]="tab.contentId"
            (pointerdown)="activate(tab)"
            (focusin)="activate(tab)"
          ></div>
        }
      </div>
    </ng-template>

    <!-- ─── a split pane: children along one axis, gutters in between ────── -->
    <ng-template #splitTpl let-pane>
      <div [class]="splitClass(pane)">
        @for (child of childrenOf(pane); track key(child); let i = $index, last = $last) {
          <div class="relative flex min-h-0 min-w-0" [style.flex]="flexOf(child)">
            <ng-container [ngTemplateOutlet]="paneTpl" [ngTemplateOutletContext]="{ $implicit: child }" />
          </div>

          @if (!last) {
            <!-- Drag or arrow-key the gutter to trade space between the panes
                 either side of it. -->
            <div
              role="separator"
              tabindex="0"
              [class]="gutterClass(pane)"
              [attr.aria-orientation]="pane.orientation === 'vertical' ? 'horizontal' : 'vertical'"
              [attr.aria-label]="'Resize ' + headerOf(child)"
              (pointerdown)="startSplitterDrag(pane, i, $event)"
              (keydown)="onSplitterKeydown(pane, i, $event)"
            >
              <span [class]="gutterHandleClass(pane)"></span>
            </div>
          }
        }
      </div>
    </ng-template>

    <!-- ─── the document host: the only home for documentOnly panes ─────── -->
    <ng-template #documentHostTpl let-pane>
      <div class="bg-surface-sunken flex min-h-0 min-w-0 flex-1" [attr.data-dock-key]="key(pane)">
        <ng-container [ngTemplateOutlet]="paneTpl" [ngTemplateOutletContext]="{ $implicit: pane.rootPane }" />
      </div>
    </ng-template>

    <ng-template #paneTpl let-pane>
      @switch (pane.type) {
        @case ('splitPane') {
          <ng-container [ngTemplateOutlet]="splitTpl" [ngTemplateOutletContext]="{ $implicit: pane }" />
        }
        @case ('tabGroupPane') {
          <ng-container [ngTemplateOutlet]="tabGroupTpl" [ngTemplateOutletContext]="{ $implicit: pane }" />
        }
        @case ('documentHost') {
          <ng-container [ngTemplateOutlet]="documentHostTpl" [ngTemplateOutletContext]="{ $implicit: pane }" />
        }
        @default {
          <ng-container [ngTemplateOutlet]="contentTpl" [ngTemplateOutletContext]="{ $implicit: pane }" />
        }
      }
    </ng-template>

    <!-- ─── the dock manager itself ─────────────────────────────────────── -->
    @if (maximized(); as pane) {
      <div class="absolute inset-0 z-30 flex">
        <ng-container [ngTemplateOutlet]="contentTpl" [ngTemplateOutletContext]="{ $implicit: pane }" />
      </div>
    } @else {
      @if (unpinned().top.length) {
        <ng-container [ngTemplateOutlet]="stripTpl" [ngTemplateOutletContext]="{ $implicit: 'top' }" />
      }

      <div class="flex min-h-0 min-w-0 flex-1">
        @if (unpinned().start.length) {
          <ng-container [ngTemplateOutlet]="stripTpl" [ngTemplateOutletContext]="{ $implicit: 'start' }" />
        }

        <div class="flex min-h-0 min-w-0 flex-1">
          <ng-container [ngTemplateOutlet]="paneTpl" [ngTemplateOutletContext]="{ $implicit: layout().rootPane }" />
        </div>

        @if (unpinned().end.length) {
          <ng-container [ngTemplateOutlet]="stripTpl" [ngTemplateOutletContext]="{ $implicit: 'end' }" />
        }
      </div>

      @if (unpinned().bottom.length) {
        <ng-container [ngTemplateOutlet]="stripTpl" [ngTemplateOutletContext]="{ $implicit: 'bottom' }" />
      }

      <!-- The fly-out an unpinned pane opens over the layout. -->
      @if (flyout(); as pane) {
        <div data-dock-flyout [class]="flyoutClass()" [style]="flyoutStyle(pane)">
          <ng-container [ngTemplateOutlet]="contentTpl" [ngTemplateOutletContext]="{ $implicit: pane }" />
        </div>
      }

      @for (window of floatingPanes(); track key(window)) {
        <div
          [attr.data-dock-window]="key(window)"
          [class]="floatingClass()"
          [style]="floatingStyle(window)"
          (pointerdown)="bringToFront(window)"
        >
          <div
            [class]="titleBarClass()"
            (pointerdown)="startPaneDrag(floatingContent(window), window, $event)"
            (dblclick)="dockBack(window)"
          >
            <span class="min-w-0 flex-1 truncate">{{ floatingTitle(window) }}</span>
            <button
              type="button"
              [class]="actionClass()"
              aria-label="Dock window"
              (click)="dockBack(window); $event.stopPropagation()"
              (pointerdown)="$event.stopPropagation()"
            >
              <ng-icon xui size="14px" name="matDockRound" />
            </button>

            <!-- A one-pane window shows that pane's own actions; the header they
                 would normally live in is suppressed below. -->
            @if (singlePane(window); as pane) {
              <ng-container [ngTemplateOutlet]="paneActionsTpl" [ngTemplateOutletContext]="{ $implicit: pane }" />
            } @else {
              <button
                type="button"
                [class]="actionClass()"
                aria-label="Close window"
                (click)="closeWindow(window); $event.stopPropagation()"
                (pointerdown)="$event.stopPropagation()"
              >
                <ng-icon xui size="14px" name="matCloseRound" />
              </button>
            }
          </div>

          <div class="flex min-h-0 min-w-0 flex-1">
            @if (singlePane(window); as pane) {
              <ng-container
                [ngTemplateOutlet]="contentTpl"
                [ngTemplateOutletContext]="{ $implicit: pane, hideHeader: true }"
              />
            } @else {
              <ng-container [ngTemplateOutlet]="paneTpl" [ngTemplateOutletContext]="{ $implicit: window }" />
            }
          </div>

          @if (window.floatingResizable !== false) {
            @for (handle of RESIZE_HANDLES; track handle.id) {
              <div
                [class]="handle.class"
                [attr.aria-hidden]="true"
                (pointerdown)="startFloatingResize(window, handle.id, $event)"
              ></div>
            }
          }
        </div>
      }
    }

    <!-- Where a drop would land. -->
    @if (dropRect(); as rect) {
      <div
        class="border-primary bg-primary/20 pointer-events-none absolute z-50 rounded-sm border-2"
        [style.left.px]="rect.left"
        [style.top.px]="rect.top"
        [style.width.px]="rect.width"
        [style.height.px]="rect.height"
      ></div>
    }

    @if (dragGhost(); as ghost) {
      <div
        class="bg-surface-overlay border-border text-foreground pointer-events-none fixed z-60 rounded-md border px-2 py-1 text-xs shadow-lg"
        [style.left.px]="ghost.x + 12"
        [style.top.px]="ghost.y + 12"
      >
        {{ ghost.label }}
      </div>
    }

    <!-- ─── an edge strip of collapsed panes ────────────────────────────── -->
    <ng-template #stripTpl let-location>
      <div data-dock-strip [class]="stripClass(location)">
        @for (pane of unpinnedAt(location); track key(pane)) {
          <button
            type="button"
            [class]="stripTabClass(location, pane)"
            [attr.aria-expanded]="pane === flyout()"
            (click)="toggleFlyout(pane)"
          >
            {{ pane.header || pane.contentId }}
          </button>
        }
      </div>
    </ng-template>
  `,
  host: {
    '[class]': 'computedClass()',
    '(keydown.escape)': 'onEscape()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiDockManager implements XuiDockContentMounter {
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly document = this.el.ownerDocument;
  private readonly vcr = inject(ViewContainerRef);
  private readonly direction = injectXDirection();

  /** Detached parking space for the content views of panes that are not on screen. */
  private readonly holder = this.document.createElement('div');

  private readonly views = new Map<string, EmbeddedViewRef<unknown>>();

  // `descendants` so the templates may sit inside a wrapper element rather than
  // having to be immediate children.
  private readonly contents = contentChildren(XuiDockContent, { descendants: true });

  readonly class = input<ClassValue>('');

  /**
   * The layout tree. Two-way bindable, and edited **in place** — see the class
   * docs for why, and use `cloneDockLayout()` for snapshots.
   */
  readonly layout = model.required<XuiDockManagerLayout>();

  /** A pane was closed and removed from the layout. */
  readonly paneClose = output<XuiDockContentPane>();

  /** The pane the user last interacted with, or `null` once it is gone. */
  readonly activePaneChange = output<XuiDockContentPane | null>();

  readonly panePinnedChange = output<XuiDockPaneStateEvent>();
  readonly paneMaximizedChange = output<XuiDockPaneStateEvent>();
  readonly paneFloatingChange = output<XuiDockPaneStateEvent>();

  /** A pointer drag on a pane header or tab began. */
  readonly paneDragStart = output<XuiDockPane>();
  /** A pointer drag ended, whether or not it changed the layout. */
  readonly paneDragEnd = output<XuiDockPane>();

  /** The pane last interacted with. Drives the active header accent. */
  readonly activePane = signal<XuiDockContentPane | null>(null);

  private readonly drag = signal<DragState | null>(null);
  private readonly dropTarget = signal<DropTarget | null>(null);
  protected readonly dropRect = signal<Rect | null>(null);

  /** The unpinned pane whose fly-out is open. */
  protected readonly flyout = signal<XuiDockContentPane | null>(null);

  protected readonly maximized = computed(() => findMaximizedPane(this.layout()));
  protected readonly unpinned = computed(() => unpinnedDockPanes(this.layout()));
  protected readonly floatingPanes = computed(() => this.layout().floatingPanes ?? []);

  protected readonly dragGhost = computed(() => {
    const state = this.drag();

    // A floating window drags itself, so it needs no ghost.
    return state && !state.window ? { x: state.x, y: state.y, label: this.headerOf(state.pane) } : null;
  });

  /** Exposed to the template; the ids double as the axis to resize along. */
  protected readonly RESIZE_HANDLES = [
    { id: 'top', class: 'absolute -top-1 inset-x-2 h-2 cursor-ns-resize' },
    { id: 'bottom', class: 'absolute -bottom-1 inset-x-2 h-2 cursor-ns-resize' },
    { id: 'left', class: 'absolute -left-1 inset-y-2 w-2 cursor-ew-resize' },
    { id: 'right', class: 'absolute -right-1 inset-y-2 w-2 cursor-ew-resize' },
    { id: 'top-left', class: 'absolute -top-1 -left-1 size-3 cursor-nwse-resize' },
    { id: 'top-right', class: 'absolute -top-1 -right-1 size-3 cursor-nesw-resize' },
    { id: 'bottom-left', class: 'absolute -bottom-1 -left-1 size-3 cursor-nesw-resize' },
    { id: 'bottom-right', class: 'absolute -right-1 -bottom-1 size-3 cursor-nwse-resize' }
  ] as const;

  constructor() {
    // Content views outlive the pane bodies they are mounted into, so they are
    // only destroyed once their pane leaves the layout for good.
    effect(() => {
      const live = new Set(collectContentPanes(this.layout()).map(pane => pane.contentId));

      for (const [contentId, view] of this.views) {
        if (!live.has(contentId)) {
          view.destroy();
          this.views.delete(contentId);
        }
      }

      const active = this.activePane();

      if (active && !live.has(active.contentId)) {
        this.activePane.set(null);
        this.activePaneChange.emit(null);
      }

      const flyout = this.flyout();

      if (flyout && (!live.has(flyout.contentId) || flyout.isPinned !== false)) {
        this.flyout.set(null);
      }
    });

    // A fly-out is a transient overlay: a pointer press anywhere that is not the
    // fly-out or an edge strip puts it away again.
    effect(onCleanup => {
      if (!this.flyout()) {
        return;
      }

      const onPointerDown = (event: Event): void => {
        if ((event.target as HTMLElement | null)?.closest('[data-dock-flyout], [data-dock-strip]')) {
          return;
        }

        this.flyout.set(null);
      };

      this.document.addEventListener('pointerdown', onPointerDown, true);
      onCleanup(() => this.document.removeEventListener('pointerdown', onPointerDown, true));
    });

    inject(DestroyRef).onDestroy(() => {
      for (const view of this.views.values()) {
        view.destroy();
      }

      this.views.clear();
      this.stopPointerTracking();
    });
  }

  // ─── content mounting ─────────────────────────────────────────────────────

  mountContent(contentId: string, host: HTMLElement): void {
    let view = this.views.get(contentId);

    if (!view) {
      const template = this.contents().find(content => content.contentId() === contentId)?.template;

      if (!template) {
        return;
      }

      view = this.vcr.createEmbeddedView(template);
      this.views.set(contentId, view);
    }

    for (const node of view.rootNodes as Node[]) {
      host.appendChild(node);
    }
  }

  releaseContent(contentId: string, host: HTMLElement): void {
    const view = this.views.get(contentId);

    if (!view) {
      return;
    }

    for (const node of view.rootNodes as Node[]) {
      if (node.parentNode === host) {
        this.holder.appendChild(node);
      }
    }
  }

  // ─── public API ───────────────────────────────────────────────────────────

  /** Remove `pane` from the layout. Respects `allowClose`. */
  closePane(pane: XuiDockContentPane): void {
    if (pane.allowClose === false) {
      return;
    }

    const layout = this.layout();

    if (removeDockPane(layout, pane)) {
      pane.isMaximized = false;
      this.commit();
      this.paneClose.emit(pane);
    }
  }

  /** Close every pane in a floating window. */
  closeWindow(window: XuiDockSplitPane): void {
    for (const pane of this.contentPanesOf(window)) {
      this.closePane(pane);
    }
  }

  /** Collapse `pane` to a tab on the nearest edge, keeping its place in the tree. */
  unpinPane(pane: XuiDockContentPane): void {
    if (pane.allowPinning === false || pane.documentOnly || pane.isPinned === false) {
      return;
    }

    // A pane inside a floating window has no edge to collapse to.
    if (this.isFloating(pane)) {
      this.dockBackPane(pane);
    }

    pane.isPinned = false;
    pane.isMaximized = false;
    this.flyout.set(null);
    this.commit();
    this.panePinnedChange.emit({ pane, value: false });
  }

  /** Restore `pane` to the position it was collapsed from. */
  pinPane(pane: XuiDockContentPane): void {
    if (pane.isPinned !== false) {
      return;
    }

    pane.isPinned = true;
    this.flyout.set(null);
    this.commit();
    this.panePinnedChange.emit({ pane, value: true });
  }

  togglePinned(pane: XuiDockContentPane): void {
    if (pane.isPinned === false) {
      this.pinPane(pane);
    } else {
      this.unpinPane(pane);
    }
  }

  /** Blow `pane` up to fill the whole dock manager, hiding everything else. */
  maximizePane(pane: XuiDockContentPane): void {
    if (pane.allowMaximize === false) {
      return;
    }

    for (const other of collectContentPanes(this.layout())) {
      other.isMaximized = other === pane;
    }

    this.commit();
    this.paneMaximizedChange.emit({ pane, value: true });
  }

  restorePane(pane: XuiDockContentPane): void {
    pane.isMaximized = false;
    this.commit();
    this.paneMaximizedChange.emit({ pane, value: false });
  }

  toggleMaximized(pane: XuiDockContentPane): void {
    if (pane.isMaximized) {
      this.restorePane(pane);
    } else {
      this.maximizePane(pane);
    }
  }

  /** Move `pane` into a floating window of its own. */
  floatPane(pane: XuiDockPane, location?: XuiDockPoint, size?: { width: number; height: number }): void {
    const rect = this.el.getBoundingClientRect();
    const fallback = { x: Math.round(rect.width / 4), y: Math.round(rect.height / 4) };

    if (isContentPane(pane)) {
      pane.isPinned = true;
      pane.isMaximized = false;
    }

    if (!floatDockPane(this.layout(), pane, location ?? fallback, size)) {
      return;
    }

    this.commit();

    for (const content of this.contentPanesOf(pane)) {
      this.paneFloatingChange.emit({ pane: content, value: true });
    }
  }

  /** Dock `pane` at `position` relative to `target`. */
  dockPane(pane: XuiDockPane, target: XuiDockPane, position: XuiDockPosition): boolean {
    const wasFloating = this.isFloating(pane);

    if (!dockPaneAt(this.layout(), pane, target, position)) {
      return false;
    }

    this.commit();

    if (wasFloating) {
      for (const content of this.contentPanesOf(pane)) {
        this.paneFloatingChange.emit({ pane: content, value: false });
      }
    }

    return true;
  }

  /** Make `pane` the active one, selecting its tab and opening its fly-out. */
  selectPane(pane: XuiDockContentPane): void {
    const group = this.tabGroupOf(pane);

    if (group) {
      group.selectedIndex = group.panes.indexOf(pane);
      this.commit();
    }

    if (pane.isPinned === false) {
      this.flyout.set(pane);
    }

    this.activate(pane);
  }

  // ─── template helpers ─────────────────────────────────────────────────────

  protected readonly key = dockPaneKey;

  protected childrenOf(pane: XuiDockPane): XuiDockPane[] {
    return visibleDockChildren(pane);
  }

  protected unpinnedAt(location: XuiDockUnpinnedLocation): XuiDockContentPane[] {
    return this.unpinned()[location];
  }

  protected pinnedTabs(group: XuiDockTabGroupPane): XuiDockContentPane[] {
    return group.panes.filter(pane => pane.isPinned !== false);
  }

  protected selectedTab(group: XuiDockTabGroupPane): XuiDockContentPane | null {
    return selectedTabPane(group);
  }

  protected flexOf(pane: XuiDockPane): string {
    return `${pane.size ?? 1} 1 0px`;
  }

  protected headerOf(pane: XuiDockPane): string {
    const contents = this.contentPanesOf(pane);

    return contents[0]?.header || contents[0]?.contentId || 'panes';
  }

  /** The pane a floating window's title bar drags: its lone pane, or the root. */
  protected floatingContent(window: XuiDockSplitPane): XuiDockPane {
    return this.singlePane(window) ?? window;
  }

  protected singlePane(window: XuiDockSplitPane): XuiDockContentPane | null {
    const only = window.panes.length === 1 ? window.panes[0] : null;

    return only && isContentPane(only) ? only : null;
  }

  protected floatingTitle(window: XuiDockSplitPane): string {
    const contents = this.contentPanesOf(window);

    if (contents.length === 1) {
      return contents[0].header || contents[0].contentId;
    }

    return `${contents.length} panes`;
  }

  protected isFloating(pane: XuiDockPane): boolean {
    const windows = this.layout().floatingPanes ?? [];

    return windows.some(window => window === pane || this.contentPanesOf(window).includes(pane as XuiDockContentPane));
  }

  protected toggleFlyout(pane: XuiDockContentPane): void {
    this.flyout.update(current => (current === pane ? null : pane));

    if (this.flyout()) {
      this.activate(pane);
    }
  }

  protected activate(pane: XuiDockContentPane): void {
    if (this.activePane() === pane) {
      return;
    }

    this.activePane.set(pane);
    this.activePaneChange.emit(pane);
  }

  protected onEscape(): void {
    if (this.drag()) {
      this.cancelDrag();
      return;
    }

    this.flyout.set(null);
  }

  /** Dock a whole floating window back into the layout root. */
  protected dockBack(window: XuiDockSplitPane): void {
    this.dockPane(window, this.layout().rootPane, 'end');
  }

  private dockBackPane(pane: XuiDockContentPane): void {
    this.dockPane(pane, this.layout().rootPane, 'end');
  }

  protected bringToFront(window: XuiDockSplitPane): void {
    const windows = this.layout().floatingPanes ?? [];

    if (windows[windows.length - 1] === window) {
      return;
    }

    this.layout().floatingPanes = [...windows.filter(other => other !== window), window];
    this.commit();
  }

  // ─── splitter resizing ────────────────────────────────────────────────────

  protected startSplitterDrag(parent: XuiDockSplitPane, gutter: number, event: PointerEvent): void {
    const gutterEl = event.currentTarget as HTMLElement;
    const beforeEl = gutterEl.previousElementSibling as HTMLElement | null;
    const afterEl = gutterEl.nextElementSibling as HTMLElement | null;

    if (!beforeEl || !afterEl) {
      return;
    }

    event.preventDefault();

    const vertical = parent.orientation === 'vertical';
    const children = this.childrenOf(parent);
    const before = children[gutter];
    const after = children[gutter + 1];
    const beforePx = vertical ? beforeEl.offsetHeight : beforeEl.offsetWidth;
    const afterPx = vertical ? afterEl.offsetHeight : afterEl.offsetWidth;
    const start = vertical ? event.clientY : event.clientX;

    // Dragging towards the inline end grows the leading pane; in RTL that is
    // leftwards, so the horizontal delta is negated.
    const sign = !vertical && this.direction() === 'rtl' ? -1 : 1;

    const onMove = (moveEvent: PointerEvent): void => {
      const position = vertical ? moveEvent.clientY : moveEvent.clientX;
      const delta = this.clampSplitterDelta((position - start) * sign, beforePx, afterPx);

      this.resizeSiblings(before, after, beforePx + delta, beforePx + afterPx);
    };

    this.trackPointer(onMove);
  }

  protected onSplitterKeydown(parent: XuiDockSplitPane, gutter: number, event: KeyboardEvent): void {
    const vertical = parent.orientation === 'vertical';
    const arrow = arrowDirectionOnAxis(event.key, this.direction(), vertical ? 'vertical' : 'horizontal');
    const gutterEl = event.currentTarget as HTMLElement;
    const beforeEl = gutterEl.previousElementSibling as HTMLElement | null;
    const afterEl = gutterEl.nextElementSibling as HTMLElement | null;

    if (!arrow || !beforeEl || !afterEl) {
      return;
    }

    event.preventDefault();

    const children = this.childrenOf(parent);
    const beforePx = vertical ? beforeEl.offsetHeight : beforeEl.offsetWidth;
    const afterPx = vertical ? afterEl.offsetHeight : afterEl.offsetWidth;
    const step = (event.shiftKey ? 40 : 10) * (arrow === 'next' ? 1 : -1);
    const delta = this.clampSplitterDelta(step, beforePx, afterPx);

    this.resizeSiblings(children[gutter], children[gutter + 1], beforePx + delta, beforePx + afterPx);
  }

  private clampSplitterDelta(delta: number, beforePx: number, afterPx: number): number {
    return Math.max(MIN_PANE_SIZE - beforePx, Math.min(afterPx - MIN_PANE_SIZE, delta));
  }

  /** Re-weight two siblings so `before` takes `beforePx` of their shared `totalPx`. */
  private resizeSiblings(before: XuiDockPane, after: XuiDockPane, beforePx: number, totalPx: number): void {
    if (totalPx <= 0) {
      return;
    }

    const share = (before.size ?? 1) + (after.size ?? 1);

    before.size = (share * beforePx) / totalPx;
    after.size = share - before.size;
    this.commit({ normalize: false });
  }

  // ─── floating windows ─────────────────────────────────────────────────────

  protected startFloatingResize(window: XuiDockSplitPane, handle: string, event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const origin = window.floatingLocation ?? FLOATING_ORIGIN;
    const width = window.floatingWidth ?? 400;
    const height = window.floatingHeight ?? 300;
    // In RTL the window is positioned from the right edge, so a rightward drag
    // moves its inline start the other way.
    const sign = this.direction() === 'rtl' ? -1 : 1;

    const onMove = (moveEvent: PointerEvent): void => {
      const dx = (moveEvent.clientX - startX) * sign;
      const dy = moveEvent.clientY - startY;
      const location = { ...origin };
      let nextWidth = width;
      let nextHeight = height;

      if (handle.includes('left')) {
        nextWidth = Math.max(MIN_PANE_SIZE * 2, width - dx);
        location.x = origin.x + (width - nextWidth);
      } else if (handle.includes('right')) {
        nextWidth = Math.max(MIN_PANE_SIZE * 2, width + dx);
      }

      if (handle.includes('top')) {
        nextHeight = Math.max(MIN_PANE_SIZE * 2, height - dy);
        location.y = origin.y + (height - nextHeight);
      } else if (handle.includes('bottom')) {
        nextHeight = Math.max(MIN_PANE_SIZE * 2, height + dy);
      }

      window.floatingLocation = location;
      window.floatingWidth = nextWidth;
      window.floatingHeight = nextHeight;
      this.commit({ normalize: false });
    };

    this.trackPointer(onMove);
  }

  // ─── dragging panes and docking ───────────────────────────────────────────

  /**
   * Start a drag on a pane header, a tab, or a floating window's title bar.
   *
   * A window drag moves the window as it goes and docks it if it is released over
   * a valid target; a pane drag shows a ghost and either docks the pane or floats
   * it where it was dropped.
   */
  protected startPaneDrag(pane: XuiDockPane, window: XuiDockSplitPane | null, event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    const startX = event.clientX;
    const startY = event.clientY;
    const origin = window?.floatingLocation ?? FLOATING_ORIGIN;
    const sign = this.direction() === 'rtl' ? -1 : 1;
    let started = false;

    const onMove = (moveEvent: PointerEvent): void => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!started) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) {
          return;
        }

        started = true;
        this.paneDragStart.emit(pane);
      }

      if (window) {
        window.floatingLocation = { x: origin.x + dx * sign, y: origin.y + dy };
        this.commit({ normalize: false });
      }

      this.drag.set({ pane, window, x: moveEvent.clientX, y: moveEvent.clientY });
      this.updateDropTarget(moveEvent.clientX, moveEvent.clientY);
    };

    const onUp = (upEvent: PointerEvent): void => {
      if (!started) {
        return;
      }

      const target = this.dropTarget();
      this.clearDrag();

      if (target) {
        this.dockPane(pane, target.pane, target.position);
      } else if (!window) {
        this.floatAtPointer(pane, upEvent.clientX, upEvent.clientY);
      }

      this.paneDragEnd.emit(pane);
    };

    this.trackPointer(onMove, onUp);
  }

  protected cancelDrag(): void {
    const state = this.drag();

    this.clearDrag();
    this.stopPointerTracking();

    if (state) {
      this.paneDragEnd.emit(state.pane);
    }
  }

  private clearDrag(): void {
    this.drag.set(null);
    this.dropTarget.set(null);
    this.dropRect.set(null);
  }

  private floatAtPointer(pane: XuiDockPane, clientX: number, clientY: number): void {
    const rect = this.el.getBoundingClientRect();
    const inlineOffset = this.direction() === 'rtl' ? rect.right - clientX : clientX - rect.left;

    this.floatPane(pane, { x: Math.round(inlineOffset - 40), y: Math.round(clientY - rect.top - 12) });
  }

  /**
   * Work out where a drop at these coordinates would land, and size the preview
   * rectangle to match.
   *
   * The dock manager's own edges win over whatever pane happens to be under the
   * pointer, so there is always a way to dock against the full height or width of
   * the layout.
   */
  private updateDropTarget(clientX: number, clientY: number): void {
    const state = this.drag();

    if (!state) {
      return;
    }

    const hostRect = this.el.getBoundingClientRect();
    const outer = this.outerEdgeAt(clientX, clientY, hostRect);
    const target = outer ?? this.paneTargetAt(clientX, clientY, state.window !== null);

    if (!target || !canDockInto(this.layout(), state.pane, target.pane, target.position)) {
      this.dropTarget.set(null);
      this.dropRect.set(null);
      return;
    }

    const element = outer ? this.el : this.elementForPane(target.pane);
    const rect = element?.getBoundingClientRect() ?? hostRect;

    this.dropTarget.set(target);
    this.dropRect.set(this.previewRect(rect, hostRect, target.position));
  }

  /** A drop within `OUTER_EDGE` of the dock manager's frame docks the whole layout. */
  private outerEdgeAt(clientX: number, clientY: number, hostRect: DOMRect): DropTarget | null {
    if (clientX < hostRect.left || clientX > hostRect.right || clientY < hostRect.top || clientY > hostRect.bottom) {
      return null;
    }

    const root = this.layout().rootPane;
    const ltr = this.direction() !== 'rtl';

    if (clientX - hostRect.left < OUTER_EDGE) {
      return { pane: root, position: ltr ? 'start' : 'end' };
    }

    if (hostRect.right - clientX < OUTER_EDGE) {
      return { pane: root, position: ltr ? 'end' : 'start' };
    }

    if (clientY - hostRect.top < OUTER_EDGE) {
      return { pane: root, position: 'top' };
    }

    if (hostRect.bottom - clientY < OUTER_EDGE) {
      return { pane: root, position: 'bottom' };
    }

    return null;
  }

  /**
   * The pane under the pointer, and which of its edges the pointer is nearest.
   *
   * Hit-tested against the rendered rectangles rather than `elementFromPoint`, so
   * the drag ghost, the drop preview and the floating window riding along with
   * the pointer cannot get in the way. The innermost rectangle wins, and on a tie
   * the one painted last does.
   *
   * `precise` narrows the target to the edge bands and the centre hotspot — see
   * {@link DOCK_BAND}. Without it the whole pane is live.
   */
  private paneTargetAt(clientX: number, clientY: number, precise: boolean): DropTarget | null {
    const dragged = this.drag()?.window;
    const draggedEl = dragged ? this.el.querySelector(`[data-dock-window="${dockPaneKey(dragged)}"]`) : null;
    let element: HTMLElement | null = null;
    let smallest = Number.POSITIVE_INFINITY;

    for (const candidate of this.el.querySelectorAll<HTMLElement>('[data-dock-key]')) {
      // A collapsed pane's fly-out is a transient overlay, not a dock.
      if (draggedEl?.contains(candidate) || candidate.closest('[data-dock-flyout]')) {
        continue;
      }

      const bounds = candidate.getBoundingClientRect();

      if (
        clientX < bounds.left ||
        clientX > bounds.right ||
        clientY < bounds.top ||
        clientY > bounds.bottom ||
        bounds.width * bounds.height > smallest
      ) {
        continue;
      }

      element = candidate;
      smallest = bounds.width * bounds.height;
    }

    const pane = element && this.paneForKey(element.dataset['dockKey'] ?? '');

    if (!element || !pane) {
      return null;
    }

    const rect = element.getBoundingClientRect();
    const u = rect.width ? (clientX - rect.left) / rect.width : 0.5;
    const v = rect.height ? (clientY - rect.top) / rect.height : 0.5;

    const centred = precise
      ? Math.abs(u - 0.5) * rect.width <= DOCK_HOTSPOT && Math.abs(v - 0.5) * rect.height <= DOCK_HOTSPOT
      : u > CENTRE_ZONE && u < 1 - CENTRE_ZONE && v > CENTRE_ZONE && v < 1 - CENTRE_ZONE;

    if (centred) {
      return { pane, position: 'center' };
    }

    const ltr = this.direction() !== 'rtl';
    // Which edge is nearest is a question of proportion, but whether the pointer
    // is *near enough* to dock is a question of pixels.
    const edges = [
      { position: (ltr ? 'start' : 'end') as XuiDockPosition, fraction: u, offset: clientX - rect.left },
      { position: (ltr ? 'end' : 'start') as XuiDockPosition, fraction: 1 - u, offset: rect.right - clientX },
      { position: 'top' as XuiDockPosition, fraction: v, offset: clientY - rect.top },
      { position: 'bottom' as XuiDockPosition, fraction: 1 - v, offset: rect.bottom - clientY }
    ];
    const nearest = edges.reduce((a, b) => (b.fraction < a.fraction ? b : a));

    if (precise && nearest.offset > DOCK_BAND) {
      return null;
    }

    return { pane, position: nearest.position };
  }

  /** The slice of `rect` a drop would occupy, in coordinates relative to the host. */
  private previewRect(rect: DOMRect, hostRect: DOMRect, position: XuiDockPosition): Rect {
    const left = rect.left - hostRect.left;
    const top = rect.top - hostRect.top;
    const ltr = this.direction() !== 'rtl';
    const half = { width: rect.width / 2, height: rect.height / 2 };

    switch (position) {
      case 'center':
        return { left, top, width: rect.width, height: rect.height };
      case 'top':
        return { left, top, width: rect.width, height: half.height };
      case 'bottom':
        return { left, top: top + half.height, width: rect.width, height: half.height };
      case 'start':
        return { left: ltr ? left : left + half.width, top, width: half.width, height: rect.height };
      case 'end':
        return { left: ltr ? left + half.width : left, top, width: half.width, height: rect.height };
    }
  }

  private elementForPane(pane: XuiDockPane): HTMLElement | null {
    return this.el.querySelector<HTMLElement>(`[data-dock-key="${dockPaneKey(pane)}"]`);
  }

  private paneForKey(key: string): XuiDockPane | null {
    let found: XuiDockPane | null = null;

    const walk = (pane: XuiDockPane): void => {
      if (dockPaneKey(pane) === key) {
        found = pane;
        return;
      }

      if (isSplitPane(pane) || isTabGroupPane(pane)) {
        pane.panes.forEach(walk);
      } else if (isDocumentHost(pane)) {
        walk(pane.rootPane);
      }
    };

    const layout = this.layout();

    for (const root of [layout.rootPane, ...(layout.floatingPanes ?? [])]) {
      if (found) {
        break;
      }

      walk(root);
    }

    return found;
  }

  // ─── pointer plumbing ─────────────────────────────────────────────────────

  private release: (() => void) | null = null;

  /** Follow the pointer until it is released, then clean up after ourselves. */
  private trackPointer(onMove: (event: PointerEvent) => void, onUp?: (event: PointerEvent) => void): void {
    this.stopPointerTracking();

    const move = (event: PointerEvent): void => onMove(event);
    const up = (event: PointerEvent): void => {
      this.stopPointerTracking();
      onUp?.(event);
    };

    this.document.addEventListener('pointermove', move);
    this.document.addEventListener('pointerup', up);
    this.document.addEventListener('pointercancel', up);

    this.release = () => {
      this.document.removeEventListener('pointermove', move);
      this.document.removeEventListener('pointerup', up);
      this.document.removeEventListener('pointercancel', up);
    };
  }

  private stopPointerTracking(): void {
    this.release?.();
    this.release = null;
  }

  // ─── layout bookkeeping ───────────────────────────────────────────────────

  /**
   * Publish the in-place edits made to the tree.
   *
   * Skip normalisation for the continuous gestures — a resize or a window move
   * cannot change the tree's shape, and re-walking it on every pointer event is
   * wasted work.
   */
  private commit(options?: { normalize?: boolean }): void {
    const layout = this.layout();

    if (options?.normalize !== false) {
      normalizeDockLayout(layout);
    }

    this.layout.set({ ...layout });
  }

  private contentPanesOf(pane: XuiDockPane): XuiDockContentPane[] {
    const out: XuiDockContentPane[] = [];

    const walk = (current: XuiDockPane): void => {
      if (isContentPane(current)) {
        out.push(current);
      } else if (isSplitPane(current) || isTabGroupPane(current)) {
        current.panes.forEach(walk);
      } else if (isDocumentHost(current)) {
        walk(current.rootPane);
      }
    };

    walk(pane);

    return out;
  }

  private tabGroupOf(pane: XuiDockContentPane): XuiDockTabGroupPane | null {
    let group: XuiDockTabGroupPane | null = null;

    const walk = (current: XuiDockPane): void => {
      if (group) {
        return;
      }

      if (isTabGroupPane(current)) {
        if (current.panes.includes(pane)) {
          group = current;
          return;
        }

        return;
      }

      if (isSplitPane(current)) {
        current.panes.forEach(walk);
      } else if (isDocumentHost(current)) {
        walk(current.rootPane);
      }
    };

    const layout = this.layout();

    for (const root of [layout.rootPane, ...(layout.floatingPanes ?? [])]) {
      walk(root);
    }

    return group;
  }

  // ─── keyboard ─────────────────────────────────────────────────────────────

  protected onTabKeydown(group: XuiDockTabGroupPane, event: KeyboardEvent): void {
    const tabs = this.pinnedTabs(group);

    if (!tabs.length) {
      return;
    }

    const step = arrowDirectionOnAxis(event.key, this.direction(), 'horizontal');
    const current = tabs.indexOf(this.selectedTab(group) as XuiDockContentPane);
    let next: number;

    if (step === 'next') {
      next = (current + 1) % tabs.length;
    } else if (step === 'previous') {
      next = (current - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    this.selectPane(tabs[next]);

    // Roving tabindex: follow the selection with focus.
    const strip = (event.currentTarget as HTMLElement).parentElement;
    strip?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  }

  // ─── classes ──────────────────────────────────────────────────────────────

  protected readonly computedClass = computed(() =>
    xui('bg-surface text-foreground relative flex flex-col overflow-hidden text-sm select-none', this.class())
  );

  protected splitClass(pane: XuiDockPane): string {
    return xui('flex min-h-0 min-w-0 flex-1', isSplitPane(pane) && pane.orientation === 'vertical' && 'flex-col');
  }

  protected frameClass(pane: XuiDockPane): string {
    return xui(
      'border-border bg-surface flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border',
      this.isActiveFrame(pane) && 'border-primary-muted'
    );
  }

  /** Whether the pane on screen in this frame is the active one. */
  private isActiveFrame(pane: XuiDockPane): boolean {
    const active = this.activePane();

    if (!active) {
      return false;
    }

    return isTabGroupPane(pane) ? this.selectedTab(pane) === active : pane === active;
  }

  protected headerClass(pane: XuiDockPane): string {
    return xui(
      'border-border bg-surface-raised text-foreground-muted flex h-8 shrink-0 items-center gap-1 border-b ps-2 pe-1',
      'text-xs font-medium',
      // The header is a drag handle; without this a touch drag scrolls the page
      // instead of moving the pane.
      'touch-none',
      isContentPane(pane) && 'cursor-grab'
    );
  }

  protected tabStripClass(): string {
    return xui('border-border bg-surface-raised flex h-8 shrink-0 touch-none items-center gap-0.5 border-b px-1');
  }

  protected tabClass(group: XuiDockTabGroupPane, tab: XuiDockContentPane): string {
    return xui(
      'group relative flex h-8 max-w-40 shrink-0 cursor-grab items-center gap-1 rounded-t px-2 text-xs',
      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
      tab === this.selectedTab(group)
        ? 'bg-surface text-foreground border-border border-x border-t'
        : 'text-foreground-muted hover:bg-hover-overlay hover:text-foreground'
    );
  }

  protected tabCloseClass(): string {
    return xui('hover:bg-hover-overlay grid size-4 shrink-0 place-items-center rounded opacity-60 hover:opacity-100');
  }

  protected actionClass(): string {
    return xui(
      'text-foreground-muted hover:bg-hover-overlay hover:text-foreground grid size-6 shrink-0 place-items-center',
      'rounded focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus'
    );
  }

  protected gutterClass(pane: XuiDockPane): string {
    return xui(
      'group relative z-10 flex shrink-0 touch-none items-center justify-center',
      'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus',
      isSplitPane(pane) && pane.orientation === 'vertical'
        ? 'h-1.5 w-full cursor-row-resize'
        : 'w-1.5 cursor-col-resize'
    );
  }

  protected gutterHandleClass(pane: XuiDockPane): string {
    return xui(
      'bg-border group-hover:bg-primary rounded-full transition-colors',
      isSplitPane(pane) && pane.orientation === 'vertical' ? 'h-0.5 w-8' : 'h-8 w-0.5'
    );
  }

  protected stripClass(location: XuiDockUnpinnedLocation): string {
    const vertical = location === 'start' || location === 'end';

    return xui(
      'border-border bg-surface-inset flex shrink-0 items-start gap-1 p-1',
      vertical ? 'w-8 flex-col' : 'h-8',
      location === 'start' && 'border-e',
      location === 'end' && 'border-s',
      location === 'top' && 'border-b',
      location === 'bottom' && 'border-t'
    );
  }

  protected stripTabClass(location: XuiDockUnpinnedLocation, pane: XuiDockContentPane): string {
    const vertical = location === 'start' || location === 'end';

    return xui(
      'text-foreground-muted hover:bg-hover-overlay hover:text-foreground max-h-40 max-w-40 truncate rounded px-1.5 py-1',
      'text-xs focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
      vertical && '[writing-mode:vertical-rl]',
      pane === this.flyout() && 'bg-primary-muted text-foreground'
    );
  }

  protected flyoutClass(): string {
    return xui('bg-surface border-border absolute z-20 flex overflow-hidden border shadow-lg');
  }

  protected flyoutStyle(pane: XuiDockContentPane): Record<string, string> {
    const location = pane.unpinnedLocation ?? defaultUnpinnedLocation(this.layout(), pane);
    const size = `${pane.unpinnedSize ?? 280}px`;
    const offset = `${STRIP_SIZE}px`;

    switch (location) {
      case 'start':
        return { insetInlineStart: offset, top: '0', bottom: '0', width: size };
      case 'end':
        return { insetInlineEnd: offset, top: '0', bottom: '0', width: size };
      case 'top':
        return { top: offset, insetInlineStart: '0', insetInlineEnd: '0', height: size };
      case 'bottom':
        return { bottom: offset, insetInlineStart: '0', insetInlineEnd: '0', height: size };
    }
  }

  protected floatingClass(): string {
    return xui('bg-surface border-border absolute z-40 flex flex-col overflow-hidden rounded-lg border shadow-xl');
  }

  protected floatingStyle(window: XuiDockSplitPane): Record<string, string> {
    const location = window.floatingLocation ?? FLOATING_ORIGIN;

    return {
      insetInlineStart: `${location.x}px`,
      top: `${location.y}px`,
      width: `${window.floatingWidth ?? 400}px`,
      height: `${window.floatingHeight ?? 300}px`
    };
  }

  protected titleBarClass(): string {
    return xui(
      'border-border bg-surface-raised text-foreground-muted flex h-7 shrink-0 cursor-grab items-center gap-1',
      'touch-none border-b ps-2 pe-1 text-xs font-medium'
    );
  }
}
