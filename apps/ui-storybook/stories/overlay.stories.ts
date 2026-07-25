import { ChangeDetectionStrategy, Component, ElementRef, TemplateRef, signal, viewChild } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { X_PLACEMENTS, injectXOverlay, type XOverlayRef, type XPlacement } from '@xui/core/overlay';

/**
 * `@xui/core/overlay` is headless — it has no styled component of its own. These
 * stories exercise the parts jsdom cannot: real positioning, backdrops and focus
 * trapping. Every Phase 3 surface (popover, tooltip, menu, dialog, drawer, toast)
 * sits on this primitive.
 *
 * This one opens all twelve placements at once around a single anchor, so the
 * ring of labels reads as a direct check of the placement maths.
 */
@Component({
  selector: 'xui-overlay-demo',
  imports: [XuiButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid h-[520px] place-items-center">
      <div #anchor class="bg-primary text-primary-foreground grid size-32 place-items-center rounded-lg text-sm">
        anchor
      </div>
    </div>

    <div class="mt-4 flex gap-2">
      <button xuiButton size="sm" (click)="openAll()">Open all</button>
      <button xuiButton size="sm" variant="outline" (click)="closeAll()">Close all</button>
    </div>

    <ng-template #content let-placement>
      <div
        class="bg-surface-overlay border-border shadow-overlay rounded border px-2 py-1 font-mono text-xs whitespace-nowrap"
      >
        {{ placement }}
      </div>
    </ng-template>
  `
})
export class XuiOverlayDemo {
  private readonly overlay = injectXOverlay();

  readonly anchor = viewChild.required<ElementRef<HTMLElement>>('anchor');
  readonly content = viewChild.required<TemplateRef<{ $implicit: XPlacement }>>('content');

  openAll() {
    this.closeAll();

    for (const placement of X_PLACEMENTS) {
      this.overlay.open(this.content(), {
        origin: this.anchor(),
        placement,
        context: { $implicit: placement },
        offset: 6,
        // Every overlay is open at once, so leave them exactly where asked
        // rather than letting CDK shuffle them around each other.
        flip: false,
        closeOnOutsideClick: false,
        closeOnEscape: false
      });
    }
  }

  closeAll() {
    this.overlay.closeAll();
  }
}

@Component({
  selector: 'xui-overlay-modal-demo',
  imports: [XuiButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button xuiButton (click)="open()">Open modal overlay</button>
    <p class="text-foreground-subtle mt-4 text-sm">Last result: {{ result() ?? '—' }}</p>

    <ng-template #content>
      <div class="bg-surface-overlay border-border shadow-overlay w-80 rounded-lg border p-4">
        <h2 id="overlay-demo-title" class="text-foreground mb-1 font-semibold">Discard changes?</h2>
        <p class="text-foreground-muted mb-4 text-sm">Focus is trapped here while the overlay is open.</p>
        <div class="flex justify-end gap-2">
          <button xuiButton variant="ghost" size="sm" (click)="close('cancelled')">Cancel</button>
          <button xuiButton color="error" size="sm" (click)="close('discarded')">Discard</button>
        </div>
      </div>
    </ng-template>
  `
})
export class XuiOverlayModalDemo {
  private readonly overlay = injectXOverlay();
  private ref: XOverlayRef<string> | null = null;

  readonly result = signal<string | null>(null);
  readonly content = viewChild.required<TemplateRef<unknown>>('content');

  async open() {
    this.ref = this.overlay.open<string>(this.content(), {
      position: 'global',
      hasBackdrop: true,
      backdropClass: 'bg-foreground/40',
      scrollStrategy: 'block',
      trapFocus: true,
      autoFocus: true,
      role: 'dialog',
      ariaLabelledBy: 'overlay-demo-title'
    });

    this.result.set((await this.ref.closed) ?? 'dismissed');
  }

  close(result: string) {
    this.ref?.close(result);
  }
}

const meta: Meta = {
  title: 'Foundations/Overlay primitive',
  decorators: [moduleMetadata({ imports: [XuiOverlayDemo, XuiOverlayModalDemo] })]
};

export default meta;
type Story = StoryObj;

/** Every placement, anchored to its own trigger. */
export const Placements: Story = {
  render: () => ({ template: '<xui-overlay-demo />' })
};

/** Backdrop, scroll blocking, focus trap and an awaited result. */
export const Modal: Story = {
  render: () => ({ template: '<xui-overlay-modal-demo />' })
};
