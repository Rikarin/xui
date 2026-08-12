import {
  Directive,
  ElementRef,
  InjectionToken,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input
} from '@angular/core';

/**
 * Declares the body of one content pane.
 *
 * The `contentId` links the template to the `contentId` of a
 * {@link XuiDockContentPane} in the layout — the dock manager's equivalent of
 * Ignite UI's `slot="…"` children.
 *
 * ```html
 * <xui-dock-manager [(layout)]="layout">
 *   <ng-template xuiDockContent="explorer">…</ng-template>
 *   <ng-template xuiDockContent="editor">…</ng-template>
 * </xui-dock-manager>
 * ```
 *
 * The template is instantiated once, the first time its pane is shown, and the
 * resulting view is then kept for as long as the pane is in the layout — docking,
 * floating, unpinning and tab switching all move its DOM rather than rebuilding
 * it, so scroll offsets, half-typed input and component state survive.
 */
@Directive({ selector: 'ng-template[xuiDockContent]', exportAs: 'xuiDockContent' })
export class XuiDockContent {
  /** Matches the `contentId` of a content pane in the layout. */
  readonly contentId = input.required<string>({ alias: 'xuiDockContent' });

  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * One place a pane body can be rendered.
 *
 * Both halves are needed, and for different reasons. `container` is where a view
 * is *born*, so that the server's hydration annotations describe the view at the
 * position its nodes actually occupy. `host` is where it *lives* afterwards,
 * because a view left inside `container` would be destroyed along with it — see
 * {@link XuiDockContentMounter.mountContent}.
 */
export interface XuiDockContentTarget {
  /** Anchored inside {@link host}; only ever used for the first render of a body. */
  readonly container: ViewContainerRef;

  /** The pane's scroll box, or `null` before the outlet is in the DOM. */
  host(): HTMLElement | null;
}

/** What {@link XuiDockContentOutlet} needs from the dock manager above it. */
export interface XuiDockContentMounter {
  /** Move the view for `contentId` into `target`, creating it on first use. */
  mountContent(contentId: string, target: XuiDockContentTarget): void;

  /** Park the view for `contentId` if — and only if — it still sits in `target`. */
  releaseContent(contentId: string, target: XuiDockContentTarget): void;
}

export const XUI_DOCK_CONTENT_MOUNTER = new InjectionToken<XuiDockContentMounter>('XuiDockContentMounter');

/**
 * Hosts the content view for a `contentId` at its own position.
 *
 * Used internally by `xui-dock-manager` wherever a pane body is rendered, and
 * declared on an `<ng-container>` rather than an element: a `ViewContainerRef`
 * taken from an element anchors its views *after* that element, whereas an
 * `<ng-container>`'s own comment node is the anchor, so a body created here
 * renders inside the pane's scroll box — which is the whole point, since the
 * server has to serialise the view where its nodes really are.
 */
@Directive({ selector: '[xuiDockContentOutlet]', exportAs: 'xuiDockContentOutlet' })
export class XuiDockContentOutlet implements XuiDockContentTarget {
  /** The `<ng-container>`'s own comment node. */
  private readonly anchor: Node = inject(ElementRef).nativeElement;
  private readonly mounter = inject(XUI_DOCK_CONTENT_MOUNTER);

  readonly container = inject(ViewContainerRef);

  /** Which pane's content view to mount here — the `contentId` of the matching `xuiDockContent`. */
  readonly contentId = input.required<string>({ alias: 'xuiDockContentOutlet' });

  /** Read lazily: the anchor is only parented once the outlet is in the DOM. */
  host(): HTMLElement | null {
    return this.anchor.parentElement;
  }

  constructor() {
    effect(onCleanup => {
      const contentId = this.contentId();
      this.mounter.mountContent(contentId, this);

      // Angular gives no ordering guarantee between the old outlet's cleanup and
      // the new outlet's mount, so release is conditional on the nodes still
      // being here — otherwise a re-layout could pull content out of the element
      // that just claimed it.
      onCleanup(() => this.mounter.releaseContent(contentId, this));
    });
  }
}
