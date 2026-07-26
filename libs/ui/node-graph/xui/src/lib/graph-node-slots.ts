import { ChangeDetectionStrategy, Component, computed, Directive, input, ViewEncapsulation } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/*
 * The slots are elements rather than attribute directives on purpose.
 *
 * Content projection matches `ng-content select` against the template's own
 * markup, and an attribute selector that fails to match raises nothing — the
 * element quietly lands in the default slot instead. For a node header that means
 * rendering below the ports; for an overlay it means being placed inside the
 * canvas transform, where it pans and zooms with the content and sizes itself
 * against a zero-height box. Element selectors match reliably, so a slot cannot
 * end up in the wrong layer without anyone noticing.
 */

/**
 * Replaces a node's default header. Use it when the title needs an icon, a
 * badge, or anything beyond the `label` input.
 *
 * ```html
 * <xui-graph-node nodeId="n1" [(position)]="position">
 *   <xui-graph-node-header><ng-icon name="matBolt" /> Amplifier</xui-graph-node-header>
 * </xui-graph-node>
 * ```
 */
@Component({
  selector: 'xui-graph-node-header',
  template: '<ng-content />',
  host: { '[class]': 'computedClass()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiGraphNodeHeader {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('flex min-w-0 flex-1 items-center gap-2 truncate', this.class())
  );
}

/** Trailing controls in a node header — a menu button, a toggle, a status dot. */
@Component({
  selector: 'xui-graph-node-actions',
  template: '<ng-content />',
  host: { '[class]': 'computedClass()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiGraphNodeActions {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => xui('flex shrink-0 items-center gap-1', this.class()));
}

/**
 * A full-bleed block between the header and the ports — a thumbnail, a preview
 * render, a waveform. Sits above the port rows, as it does in a VFX graph.
 */
@Component({
  selector: 'xui-graph-node-preview',
  template: '<ng-content />',
  host: { '[class]': 'computedClass()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiGraphNodePreview {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('border-border-muted block overflow-hidden border-b', this.class())
  );
}

/**
 * Furniture layered over the canvas — a legend, a toolbar, a context menu.
 *
 * It sits outside the canvas transform, so it neither pans nor scales with the
 * content, and positions itself against the graph's own box:
 *
 * ```html
 * <xui-node-graph>
 *   …
 *   <xui-graph-overlay class="top-4 right-4">Read only</xui-graph-overlay>
 * </xui-node-graph>
 * ```
 *
 * Keep the element itself outside any `@if` or `@for`, and put the condition on
 * its contents instead. A control-flow block is projected as one embedded view,
 * so anything wrapped in one goes to the canvas layer whatever its own selector
 * says — an overlay put there pans and zooms away with the content:
 *
 * ```html
 * <xui-graph-overlay class="inset-0" [class.pointer-events-none]="!menu()">
 *   @if (menu(); as open) { … }
 * </xui-graph-overlay>
 * ```
 */
@Component({
  selector: 'xui-graph-overlay',
  template: '<ng-content />',
  host: {
    '[class]': 'computedClass()',
    // Tells the canvas to keep its hands off presses that land here. Without it
    // the canvas captures the pointer for a pan and the release never reaches
    // whatever was pressed, so buttons in an overlay never see a click.
    'data-xui-graph-overlay': ''
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiGraphOverlay {
  readonly class = input<ClassValue>('');

  // eslint-disable-next-line local/no-hand-z-index -- slots overlay their own node inside the graph’s stacking context
  protected readonly computedClass = computed(() => xui('pointer-events-auto absolute z-10 block', this.class()));
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
  exportAs: 'xuiGraphNoDrag',
  host: { 'data-xui-graph-no-drag': '' }
})
export class XuiGraphNoDrag {}
