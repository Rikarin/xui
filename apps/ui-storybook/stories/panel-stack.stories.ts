import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiCheckboxImports } from '@xui/checkbox';
import { XuiInputImports } from '@xui/input';
import { XuiPanelStack, XuiPanelStackImports } from '@xui/panel-stack';

/**
 * A stack of screens with a back-navigating header — a drill-down in a fixed
 * space. Only the top panel renders; pushing slides in from the right, popping
 * slides back. The slide and focus are not testable in jsdom, so this story is
 * the real check.
 */
const meta: Meta<XuiPanelStack> = {
  title: 'Navigation/Panel stack',
  component: XuiPanelStack,
  decorators: [
    moduleMetadata({ imports: [XuiPanelStackImports, XuiButtonImports, XuiCheckboxImports, XuiInputImports] })
  ]
};

export default meta;
type Story = StoryObj<XuiPanelStack>;

/** Drill Settings → Account → Password, then step back with the header button. */
export const Default: Story = {
  render: () => ({
    template: `
      <xui-panel-stack class="h-96 w-80" [initialPanel]="{ title: 'Settings', content: settings }" />

      <ng-template #settings let-stack="stack">
        <div class="flex flex-col p-2">
          <button
            xuiButton
            variant="ghost"
            class="justify-start"
            (click)="stack.openPanel({ title: 'Account', content: account, data: { user: 'rene' } })"
          >
            Account →
          </button>
          <button
            xuiButton
            variant="ghost"
            class="justify-start"
            (click)="stack.openPanel({ title: 'Notifications', content: notifications })"
          >
            Notifications →
          </button>
        </div>
      </ng-template>

      <ng-template #account let-data let-stack="stack">
        <div class="flex flex-col gap-3 p-4 text-sm">
          <p class="text-foreground-muted">Signed in as <b class="text-foreground">{{ data.user }}</b>.</p>
          <button
            xuiButton
            variant="outline"
            class="justify-start"
            (click)="stack.openPanel({ title: 'Password', content: password })"
          >
            Change password →
          </button>
        </div>
      </ng-template>

      <ng-template #notifications>
        <div class="flex flex-col gap-2 p-4 text-sm">
          <xui-checkbox [checked]="true" label="Email" />
          <xui-checkbox label="Push" />
        </div>
      </ng-template>

      <ng-template #password>
        <div class="flex flex-col gap-3 p-4 text-sm">
          <input xuiInput placeholder="New password" type="password" />
          <input xuiInput placeholder="Confirm" type="password" />
        </div>
      </ng-template>
    `
  })
};
