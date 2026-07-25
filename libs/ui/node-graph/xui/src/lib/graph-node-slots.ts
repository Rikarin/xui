import { computed, Directive, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * Replaces a node's default header. Use it when the title needs an icon, a
 * badge, or anything beyond the `label` input.
 *
 * ```html
 * <xui-graph-node nodeId="n1" [(position)]="position">
 *   <div xuiGraphNodeHeader><ng-icon name="matBolt" /> Amplifier</div>
 * </xui-graph-node>
 * ```
 */
@Directive({
  selector: '[xuiGraphNodeHeader]',
  host: { '[class]': 'computedClass()' }
})
export class XuiGraphNodeHeader {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('flex min-w-0 flex-1 items-center gap-2 truncate', this.class())
  );
}

/** Trailing controls in a node header — a menu button, a toggle, a status dot. */
@Directive({
  selector: '[xuiGraphNodeActions]',
  host: { '[class]': 'computedClass()' }
})
export class XuiGraphNodeActions {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => xui('flex shrink-0 items-center gap-1', this.class()));
}

/**
 * A full-bleed block between the header and the ports — a thumbnail, a preview
 * render, a waveform. Sits above the port rows, as it does in a VFX graph.
 */
@Directive({
  selector: '[xuiGraphNodePreview]',
  host: { '[class]': 'computedClass()' }
})
export class XuiGraphNodePreview {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('border-border-muted block overflow-hidden border-b', this.class())
  );
}

/**
 * Marks a subtree inside a node as not draggable, so pointer gestures on it
 * belong to the control rather than moving the node.
 *
 * Native form controls, buttons and links are exempt already; this is for
 * anything custom — a slider, a curve editor, a colour wheel.
 */
@Directive({
  selector: '[xuiGraphNoDrag]',
  host: { 'data-xui-graph-no-drag': '' }
})
export class XuiGraphNoDrag {}

/** Absolutely-positioned furniture over the canvas — controls, a minimap, a legend. */
@Directive({
  selector: '[xuiGraphOverlay]',
  host: { '[class]': 'computedClass()', 'data-xui-graph-overlay': '' }
})
export class XuiGraphOverlay {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => xui('pointer-events-auto absolute z-10', this.class()));
}
