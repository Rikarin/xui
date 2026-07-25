import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiAccordion, XuiAccordionImports } from '@xui/accordion';

/**
 * A vertical stack of expandable sections. One panel opens at a time by default;
 * `multiple` lets several stay open. `value` is the two-way list of open items.
 */
const meta: Meta<XuiAccordion> = {
  title: 'Data display/Accordion',
  component: XuiAccordion,
  decorators: [moduleMetadata({ imports: [XuiAccordionImports] })]
};

export default meta;
type Story = StoryObj<XuiAccordion>;

export const Basic: Story = {
  render: () => ({
    props: { open: ['shipping'] },
    template: `
      <div class="w-96">
        <xui-accordion [(value)]="open">
          <xui-accordion-item value="shipping" title="Is shipping free?">
            Orders over $50 ship free. Below that, a flat $4.95 rate applies at checkout.
          </xui-accordion-item>
          <xui-accordion-item value="returns" title="What is the return policy?">
            Unused items can be returned within 30 days for a full refund.
          </xui-accordion-item>
          <xui-accordion-item value="warranty" title="Do products have a warranty?">
            Every product carries a one-year limited warranty against manufacturing defects.
          </xui-accordion-item>
        </xui-accordion>
      </div>
    `
  })
};

/** `multiple` keeps every opened panel open. */
export const Multiple: Story = {
  render: () => ({
    props: { open: ['a', 'c'] },
    template: `
      <div class="w-96">
        <xui-accordion multiple [(value)]="open">
          <xui-accordion-item value="a" title="Account">Manage your profile, email and password.</xui-accordion-item>
          <xui-accordion-item value="b" title="Notifications">Choose which alerts reach your inbox.</xui-accordion-item>
          <xui-accordion-item value="c" title="Billing">Update your plan and payment method.</xui-accordion-item>
        </xui-accordion>
      </div>
    `
  })
};

/** A disabled section can't be toggled. */
export const WithDisabled: Story = {
  render: () => ({
    props: { open: [] as string[] },
    template: `
      <div class="w-96">
        <xui-accordion [(value)]="open">
          <xui-accordion-item value="a" title="Available">This section can be opened.</xui-accordion-item>
          <xui-accordion-item value="b" title="Coming soon" disabled>Locked for now.</xui-accordion-item>
        </xui-accordion>
      </div>
    `
  })
};
