import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiPopover, XuiPopoverImports } from '@xui/popover';

/**
 * A floating panel anchored to its trigger. The base of every Phase 3 overlay
 * preset: tooltip is a hover popover, menu a click popover holding a menu.
 *
 * Positioning, Escape, outside-click and focus all come from
 * `@xui/core/overlay`, so they cannot be checked in jsdom — these stories are
 * where that behaviour is verified.
 */
const meta: Meta<XuiPopover> = {
  title: 'Overlays/Popover',
  component: XuiPopover,
  decorators: [moduleMetadata({ imports: [XuiPopoverImports, XuiButtonImports] })]
};

export default meta;
type Story = StoryObj<XuiPopover>;

const PLACEMENTS = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end'
];

/** Click to toggle. Escape or a click outside dismisses it. */
export const Click: Story = {
  render: () => ({
    template: `
      <button xuiButton [xuiPopover]="content">Open popover</button>
      <ng-template #content>
        <div class="max-w-xs p-4">
          <p class="text-foreground font-semibold">Confirm deploy</p>
          <p class="text-foreground-muted mt-1 text-sm">Ship the current build to production?</p>
          <div class="mt-3 flex justify-end gap-2">
            <button xuiButton size="sm" variant="ghost">Cancel</button>
            <button xuiButton size="sm">Deploy</button>
          </div>
        </div>
      </ng-template>
    `
  })
};

/** Hover the trigger; the pointer can travel into the panel without it closing. */
export const Hover: Story = {
  render: () => ({
    template: `
      <a class="text-link cursor-pointer underline" tabindex="0" [xuiPopover]="card" interactionKind="hover">&#64;rikarin</a>
      <ng-template #card>
        <div class="w-64 p-4">
          <p class="text-foreground font-semibold">Rene Cincura</p>
          <p class="text-foreground-muted mt-1 text-sm">Maintainer of xUI. Hover cards never steal focus.</p>
        </div>
      </ng-template>
    `
  })
};

/** Every placement, driven off one control, to eyeball the position maths. */
export const Placements: Story = {
  render: () => ({
    props: { placement: signal('bottom'), placements: PLACEMENTS },
    template: `
      <div class="flex flex-wrap gap-2">
        @for (p of placements; track p) {
          <button xuiButton size="sm" variant="outline" (click)="placement.set(p)">{{ p }}</button>
        }
      </div>
      <div class="mt-24 flex justify-center">
        <button xuiButton [xuiPopover]="tip" [placement]="placement()" interactionKind="hover">
          {{ placement() }}
        </button>
      </div>
      <ng-template #tip><div class="px-3 py-2 text-sm">Placed {{ placement() }}</div></ng-template>
    `
  })
};

/** A popover sized to the trigger — the shape a select dropdown takes. */
export const MatchWidth: Story = {
  render: () => ({
    props: { envs: ['Development', 'Staging', 'Production'] },
    template: `
      <button xuiButton class="w-72 justify-between" [xuiPopover]="opts" matchTargetWidth minimal>
        Pick an environment
      </button>
      <ng-template #opts>
        <div class="flex flex-col py-1">
          @for (env of envs; track env) {
            <button class="hover:bg-hover-overlay px-3 py-1.5 text-left text-sm">{{ env }}</button>
          }
        </div>
      </ng-template>
    `
  })
};
