import { Directive, ElementRef, InjectionToken, TemplateRef, effect, inject, input } from '@angular/core';

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

/** What {@link XuiDockContentOutlet} needs from the dock manager above it. */
export interface XuiDockContentMounter {
  /** Move the view for `contentId` into `host`, creating it on first use. */
  mountContent(contentId: string, host: HTMLElement): void;

  /** Park the view for `contentId` if — and only if — it still sits in `host`. */
  releaseContent(contentId: string, host: HTMLElement): void;
}

export const XUI_DOCK_CONTENT_MOUNTER = new InjectionToken<XuiDockContentMounter>('XuiDockContentMounter');

/**
 * Fills its host element with the content view for a `contentId`.
 *
 * Used internally by `xui-dock-manager` wherever a pane body is rendered.
 */
@Directive({ selector: '[xuiDockContentOutlet]', exportAs: 'xuiDockContentOutlet' })
export class XuiDockContentOutlet {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly mounter = inject(XUI_DOCK_CONTENT_MOUNTER);

  readonly contentId = input.required<string>({ alias: 'xuiDockContentOutlet' });

  constructor() {
    effect(onCleanup => {
      const contentId = this.contentId();
      this.mounter.mountContent(contentId, this.host);

      // Angular gives no ordering guarantee between the old outlet's cleanup and
      // the new outlet's mount, so release is conditional on the nodes still
      // being here — otherwise a re-layout could pull content out of the element
      // that just claimed it.
      onCleanup(() => this.mounter.releaseContent(contentId, this.host));
    });
  }
}
