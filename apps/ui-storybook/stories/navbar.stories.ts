import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiLinkImports } from '@xui/link';
import { XuiNavbar, XuiNavbarImports } from '@xui/navbar';

const meta: Meta<XuiNavbar> = {
  title: 'Navbar',
  component: XuiNavbar,
  args: { fixedToTop: false },
  argTypes: { fixedToTop: { control: { type: 'boolean' } } },
  decorators: [moduleMetadata({ imports: [XuiNavbarImports, XuiLinkImports, XuiButtonImports] })],
  render: ({ ...args }) => ({
    props: args,
    template: `
      <nav xuiNavbar [fixedToTop]="fixedToTop">
        <div xuiNavbarGroup>
          <span xuiNavbarHeading>xUI</span>
          <div xuiNavbarDivider></div>
          <a xuiLink color="inherit" underline="hover" href="#">Docs</a>
          <a xuiLink color="inherit" underline="hover" href="#">Components</a>
        </div>

        <div xuiNavbarGroup align="end">
          <button xuiButton size="sm" variant="ghost">Sign in</button>
          <button xuiButton size="sm">Get started</button>
        </div>
      </nav>
    `
  })
};

export default meta;
type Story = StoryObj<XuiNavbar>;

export const Default: Story = {};

/** Sticks to the top of the scroll container and gains a shadow. */
export const FixedToTop: Story = {
  args: { fixedToTop: true },
  render: ({ ...args }) => ({
    props: args,
    template: `
      <div class="h-64 overflow-y-auto">
        <nav xuiNavbar fixedToTop>
          <div xuiNavbarGroup><span xuiNavbarHeading>xUI</span></div>
        </nav>
        <div class="text-foreground-muted space-y-4 p-4">
          ${Array.from({ length: 12 }, (_, i) => `<p>Scrollable content line ${i + 1}</p>`).join('\n          ')}
        </div>
      </div>
    `
  })
};
