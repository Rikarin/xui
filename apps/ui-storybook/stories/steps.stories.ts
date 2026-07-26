import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiSteps, XuiStepsImports } from '@xui/steps';

/**
 * A step / wizard progress indicator. Bind `current` to the active index; each
 * step's status (finish / process / wait) is derived automatically, or overridden
 * per step. `clickable` lets the user jump between steps.
 */
const meta: Meta<XuiSteps> = {
  title: 'Navigation/Steps',
  component: XuiSteps,
  decorators: [moduleMetadata({ imports: [XuiStepsImports, XuiButtonImports] })]
};

export default meta;
type Story = StoryObj<XuiSteps>;

export const Horizontal: Story = {
  render: () => ({
    props: { current: 1 },
    template: `
      <div class="flex w-[640px] flex-col gap-6">
        <xui-steps [(current)]="current" clickable>
          <xui-step title="Cart" description="Review items" />
          <xui-step title="Payment" description="Card or PayPal" />
          <xui-step title="Confirm" description="Place order" />
        </xui-steps>
        <div class="flex gap-2">
          <button xuiButton (click)="current = current - 1" [disabled]="current === 0">Back</button>
          <button xuiButton color="primary" (click)="current = current + 1" [disabled]="current === 2">Next</button>
        </div>
      </div>
    `
  })
};

export const WithError: Story = {
  render: () => ({
    template: `
      <xui-steps [current]="1" class="w-[560px]">
        <xui-step title="Uploaded" />
        <xui-step title="Processing" status="error" description="Conversion failed" />
        <xui-step title="Published" />
      </xui-steps>
    `
  })
};

export const Vertical: Story = {
  render: () => ({
    template: `
      <xui-steps [current]="2" orientation="vertical" class="w-[320px]">
        <xui-step title="Account created" description="2026-07-01" />
        <xui-step title="Profile completed" description="2026-07-03" />
        <xui-step title="First project" description="In progress" />
        <xui-step title="Invite team" />
      </xui-steps>
    `
  })
};
