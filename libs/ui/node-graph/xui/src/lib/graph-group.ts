import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  numberAttribute,
  type OnInit,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XuiNodeGraphStore } from './node-graph-store';
import type { XuiGraphGroupHandle } from './node-graph.types';

/** Room reserved above the members for the title bar, in graph units. */
const HEADER_HEIGHT = 26;

/**
 * A frame around a set of nodes that moves them all together.
 *
 * ```html
 * <xui-node-graph>
 *   <xui-graph-group groupId="filter" label="Filter stage" color="var(--color-chart-1)" />
 *
 *   <xui-graph-node nodeId="lp" group="filter" [(position)]="a">…</xui-graph-node>
 *   <xui-graph-node nodeId="hp" group="filter" [(position)]="b">…</xui-graph-node>
 * </xui-node-graph>
 * ```
 *
 * Membership is declared by the nodes, not by nesting them inside the frame:
 * a node keeps its own place in the template and its own `[(position)]`, and the
 * frame is derived from wherever its members happen to be. That is what lets a
 * group be added, removed or re-membered without moving anything in the DOM, and
 * why dragging a member out of a frame is just an ordinary node drag.
 *
 * A group with no members has no box, so it renders nothing.
 *
 * To let a node join a frame by being dropped on it, read `group` off the graph's
 * `nodeMove` event and reassign the node's own `group` input.
 */
@Component({
  selector: 'xui-graph-group',
  template: `
    @if (label()) {
      <div
        data-xui-graph-group-header
        class="flex items-center gap-2 truncate px-2.5 text-xs font-medium"
        [style.height.px]="headerHeight()"
        [style.color]="color()"
      >
        <span class="truncate">{{ label() }}</span>
        <ng-content />
      </div>
    }
  `,
  host: {
    '[class]': 'computedClass()',
    '[attr.data-xui-graph-group]': 'groupId()',
    '[style.transform]': 'transform()',
    '[style.width.px]': 'bounds()?.width',
    '[style.height.px]': 'bounds()?.height',
    '[style.display]': 'bounds() ? null : "none"',
    '[style.border-color]': 'color()',
    '[style.background]': 'background()',
    '[style.cursor]': 'cursor()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiGraphGroup implements XuiGraphGroupHandle, OnInit {
  private readonly store = inject(XuiNodeGraphStore);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly dragOrigin = signal<{ x: number; y: number } | null>(null);

  /** Matches the `group` input on the nodes that belong to this frame. */
  readonly groupId = input.required<string>();

  readonly class = input<ClassValue>('');

  readonly label = input<string>('');

  /** Border and title colour; a tint of it fills the frame. Any CSS colour. */
  readonly color = input<string>('var(--color-border-strong)');

  /** Blank margin between the members' bounding box and the frame. */
  readonly padding = input<number, NumberInput>(24, { transform: numberAttribute });

  readonly selectable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  readonly draggable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /** Pins the frame and everything in it. */
  readonly locked = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /**
   * `group` drags from anywhere on the frame, as a node editor's frames do.
   * `header` restricts it to the title bar, which leaves the frame's interior
   * free for panning and marquee selection.
   */
  readonly dragHandle = input<'group' | 'header'>('group');

  /**
   * @internal Part of {@link XuiGraphGroupHandle}.
   *
   * A frame only reserves room for a title bar when it has a label — an unlabelled
   * frame is a plain box, and projected content rides along inside the labelled one.
   */
  readonly headerHeight = computed(() => (this.label() ? HEADER_HEIGHT : 0));

  /**
   * The frame, in graph space. `null` while the group has no members.
   *
   * Pinned to where it stood at the start of a node drag, so a member dragged out
   * leaves a box that stays still instead of stretching it and snapping back.
   */
  readonly bounds = computed(() => this.store.groupFrame(this.groupId()));

  /** `true` while a dragged node hovers over this frame and would land in it. */
  readonly dropTarget = computed(() => this.store.dropTargetGroups().has(this.groupId()));

  readonly members = computed(() => this.store.nodesInGroup(this.groupId()).map(node => node.nodeId()));

  /** A frame reads as selected only when its whole membership is. */
  readonly selected = computed(() => {
    const members = this.members();

    return members.length > 0 && members.every(id => this.store.isNodeSelected(id));
  });

  protected readonly immovable = computed(() => this.locked() || !this.draggable() || this.store.settings().locked);

  protected readonly transform = computed(() => {
    const bounds = this.bounds();

    return bounds ? `translate(${bounds.x}px, ${bounds.y}px)` : null;
  });

  protected readonly cursor = computed(() => (this.dragOrigin() ? 'grabbing' : this.immovable() ? null : 'grab'));

  // Deepen the tint when the frame is about to claim a node, so the answer to
  // "which group is this going into?" is visible before the button comes up.
  protected readonly background = computed(
    () => `color-mix(in oklab, ${this.color()} ${this.dropTarget() ? 22 : 10}%, transparent)`
  );

  protected readonly computedClass = computed(() =>
    xui(
      // z-index 0 puts the frame under every node, so pressing a member still
      // moves that member and only the gaps between them belong to the group.
      'absolute top-0 left-0 z-0 flex flex-col rounded-xl border-2 border-dashed transition-colors select-none',
      (this.selected() || this.dropTarget()) && 'border-solid',
      this.class()
    )
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.store.unregisterGroup(this));
  }

  ngOnInit(): void {
    this.store.registerGroup(this);
  }

  protected onPointerDown(event: PointerEvent): void {
    const target = event.target as HTMLElement;

    if (event.button !== 0) {
      return;
    }

    // When the frame only answers to its title bar, a press on its interior is
    // left to bubble so the canvas can still pan or marquee through it.
    if (this.dragHandle() === 'header' && !target.closest('[data-xui-graph-group-header]')) {
      return;
    }

    event.stopPropagation();

    if (this.selectable()) {
      const additive = event.shiftKey || event.ctrlKey || event.metaKey;

      this.store.setSelection(additive ? [...this.store.selectedNodes(), ...this.members()] : this.members());
    }

    if (this.immovable()) {
      return;
    }

    event.preventDefault();
    this.element.setPointerCapture(event.pointerId);
    this.dragOrigin.set({ x: event.clientX, y: event.clientY });
    this.store.beginGroupDrag(this.groupId());
  }

  protected onPointerMove(event: PointerEvent): void {
    const origin = this.dragOrigin();

    if (!origin) {
      return;
    }

    const { zoom } = this.store.viewport();

    this.store.dragNodesBy({ x: (event.clientX - origin.x) / zoom, y: (event.clientY - origin.y) / zoom });
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.dragOrigin()) {
      return;
    }

    this.dragOrigin.set(null);
    this.element.releasePointerCapture(event.pointerId);
    this.store.endNodeDrag();
  }
}
