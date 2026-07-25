import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiPagination, XuiPaginationImports } from '@xui/pagination';

/**
 * Page navigation with prev/next, numbered pages with ellipses, an optional size
 * changer and an item-count summary. `pageIndex` (1-based) and `pageSize` are
 * two-way bindable.
 */
const meta: Meta<XuiPagination> = {
  title: 'Navigation/Pagination',
  component: XuiPagination,
  decorators: [moduleMetadata({ imports: [XuiPaginationImports] })]
};

export default meta;
type Story = StoryObj<XuiPagination>;

export const Basic: Story = {
  render: () => ({
    props: { page: 1, size: 10 },
    template: `
      <div class="flex flex-col gap-4">
        <xui-pagination [total]="248" [(pageIndex)]="page" [(pageSize)]="size" showTotal />
        <span class="text-foreground-muted text-sm">Page {{ page }}</span>
      </div>
    `
  })
};

export const WithSizeChanger: Story = {
  render: () => ({
    props: { page: 5, size: 20 },
    template: `<xui-pagination [total]="500" [(pageIndex)]="page" [(pageSize)]="size" showTotal showSizeChanger />`
  })
};

export const Simple: Story = {
  render: () => ({
    props: { page: 3 },
    template: `<xui-pagination [total]="120" [(pageIndex)]="page" simple />`
  })
};
