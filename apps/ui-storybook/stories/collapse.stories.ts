import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiCollapse, XuiCollapseImports } from '@xui/collapse';
import { XuiTextImports } from '@xui/text';

const meta: Meta<XuiCollapse> = {
  title: 'Layout/Collapse',
  component: XuiCollapse,
  decorators: [moduleMetadata({ imports: [XuiCollapseImports, XuiButtonImports, XuiTextImports] })]
};

export default meta;
type Story = StoryObj<XuiCollapse>;

/** Height is animated with the Web Animations API — no @angular/animations dependency. */
export const Default: Story = {
  render: () => {
    const open = signal(false);

    return {
      props: { open, toggle: () => open.set(!open()) },
      template: `
        <div class="max-w-md">
          <button xuiButton size="sm" (click)="toggle()">{{ open() ? 'Hide' : 'Show' }} details</button>

          <xui-collapse class="mt-2" [isOpen]="open()">
            <div class="border-border rounded-lg border p-4">
              <p xuiText color="muted">
                Content is removed from the DOM while closed, so it cannot be focused or announced.
              </p>
            </div>
          </xui-collapse>
        </div>
      `
    };
  }
};

/** `keepChildrenMounted` trades that for avoiding a rebuild on every toggle. */
export const KeepChildrenMounted: Story = {
  render: () => {
    const open = signal(false);

    return {
      props: { open, toggle: () => open.set(!open()) },
      template: `
        <div class="max-w-md">
          <button xuiButton size="sm" (click)="toggle()">Toggle</button>

          <xui-collapse class="mt-2" keepChildrenMounted [isOpen]="open()">
            <div class="border-border rounded-lg border p-4">
              <p xuiText color="muted">Still in the DOM while closed, but inert and aria-hidden.</p>
            </div>
          </xui-collapse>
        </div>
      `
    };
  }
};
