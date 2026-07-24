import { signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { matPersonRound } from '@ng-icons/material-icons/round';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiDialog, XuiDialogImports } from '@xui/dialog';

/**
 * A modal surface over a dimmed backdrop. Backdrop, focus trap, scroll lock and
 * focus restore come from `@xui/core/overlay`; none of that is exercised in
 * jsdom, so these stories are the real check.
 */
const meta: Meta<XuiDialog> = {
  title: 'Overlays/Dialog',
  component: XuiDialog,
  decorators: [
    moduleMetadata({
      imports: [XuiDialogImports, XuiButtonImports],
      providers: [provideIcons({ matPersonRound })]
    })
  ]
};

export default meta;
type Story = StoryObj<XuiDialog>;

/** Open it, then try Escape, the backdrop and the × — each dismisses it. */
export const Default: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button xuiButton (click)="open.set(true)">Edit profile</button>
      <xui-dialog [(isOpen)]="open" title="Edit profile" icon="matPersonRound">
        <xui-dialog-body>
          <p>Update the details shown on your public profile.</p>
          <p class="text-foreground-muted mt-2">The body scrolls on its own when the content is tall.</p>
        </xui-dialog-body>
        <xui-dialog-footer>
          <button xuiButton variant="ghost" (click)="open.set(false)">Cancel</button>
          <button xuiButton (click)="open.set(false)">Save</button>
        </xui-dialog-footer>
      </xui-dialog>
    `
  })
};

/** A tall dialog: the header and footer stay pinned while the body scrolls. */
export const Scrolling: Story = {
  render: () => ({
    props: { open: signal(false), rows: Array.from({ length: 30 }, (_, i) => i + 1) },
    template: `
      <button xuiButton (click)="open.set(true)">Terms</button>
      <xui-dialog [(isOpen)]="open" title="Terms of service">
        <xui-dialog-body>
          @for (row of rows; track row) {
            <p class="py-1">Clause {{ row }} — the body owns the scroll, not the whole card.</p>
          }
        </xui-dialog-body>
        <xui-dialog-footer align="between">
          <button xuiButton variant="ghost" (click)="open.set(false)">Decline</button>
          <button xuiButton (click)="open.set(false)">Accept</button>
        </xui-dialog-footer>
      </xui-dialog>
    `
  })
};
