import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiDrawer, XuiDrawerImports } from '@xui/drawer';

/**
 * A panel that slides in from an edge. Same modal overlay as the dialog, pinned
 * to a side and sized on its sliding axis, with a Web-Animations slide-in.
 * Position, animation and focus are not testable in jsdom — verify here.
 */
const meta: Meta<XuiDrawer> = {
  title: 'Overlays/Drawer',
  component: XuiDrawer,
  decorators: [moduleMetadata({ imports: [XuiDrawerImports, XuiButtonImports] })]
};

export default meta;
type Story = StoryObj<XuiDrawer>;

/** Open from each edge to see the slide direction and pinning. */
export const Positions: Story = {
  render: () => ({
    props: { open: signal(false), position: signal<'left' | 'right' | 'top' | 'bottom'>('right') },
    template: `
      <div class="flex flex-wrap gap-2">
        @for (p of ['left', 'right', 'top', 'bottom']; track p) {
          <button xuiButton variant="outline" (click)="position.set(p); open.set(true)">From {{ p }}</button>
        }
      </div>
      <xui-drawer [(isOpen)]="open" [position]="position()" title="Filters">
        <div class="flex flex-col gap-3 p-6 text-sm">
          <p class="text-foreground-muted">Sliding in from the {{ position() }} edge.</p>
          <label class="flex items-center gap-2"><input type="checkbox" /> Only starred</label>
          <label class="flex items-center gap-2"><input type="checkbox" /> Archived</label>
        </div>
      </xui-drawer>
    `
  })
};

/** A right drawer with a footer of actions pinned to the bottom. */
export const WithFooter: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button xuiButton (click)="open.set(true)">Edit settings</button>
      <xui-drawer [(isOpen)]="open" position="right" size="lg" title="Settings">
        <div class="flex h-full flex-col">
          <div class="flex-1 space-y-4 overflow-auto p-6 text-sm">
            @for (n of [1,2,3,4,5,6]; track n) {
              <label class="block">
                <span class="text-foreground-muted">Field {{ n }}</span>
                <input class="border-border mt-1 w-full rounded-md border px-3 py-1.5" />
              </label>
            }
          </div>
          <div class="border-border flex justify-end gap-2 border-t p-4">
            <button xuiButton variant="ghost" (click)="open.set(false)">Cancel</button>
            <button xuiButton (click)="open.set(false)">Save</button>
          </div>
        </div>
      </xui-drawer>
    `
  })
};
