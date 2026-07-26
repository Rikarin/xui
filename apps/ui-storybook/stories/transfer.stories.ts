import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiTransfer, XuiTransferImports, type XuiTransferItem } from '@xui/transfer';

const ITEMS: XuiTransferItem[] = Array.from({ length: 12 }, (_, i) => ({
  key: `k${i}`,
  title: `Content ${i + 1}`,
  disabled: i === 3
}));

/**
 * A dual list-box — check items on either side and move them across with the
 * arrow buttons. `values` (two-way) holds the keys on the right; each side
 * has a header select-all and an optional search box.
 */
const meta: Meta<XuiTransfer> = {
  title: 'Forms/Transfer',
  component: XuiTransfer,
  decorators: [moduleMetadata({ imports: [XuiTransferImports] })]
};

export default meta;
type Story = StoryObj<XuiTransfer>;

export const Basic: Story = {
  render: () => ({
    props: { items: ITEMS, target: ['k1', 'k4', 'k7'] },
    template: `<xui-transfer [items]="items" [(values)]="target" [titles]="['Available', 'Chosen']" />`
  })
};

export const Searchable: Story = {
  render: () => ({
    props: { items: ITEMS, target: ['k2'] },
    template: `<xui-transfer [items]="items" [(values)]="target" searchable />`
  })
};
