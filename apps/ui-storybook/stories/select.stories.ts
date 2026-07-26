import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiSelect, XuiSelectImports } from '@xui/select';

interface User {
  id: number;
  name: string;
  role: string;
  disabled?: boolean;
}

const USERS: User[] = [
  { id: 1, name: 'Ada Lovelace', role: 'Owner' },
  { id: 2, name: 'Alan Turing', role: 'Admin' },
  { id: 3, name: 'Grace Hopper', role: 'Editor' },
  { id: 4, name: 'Katherine Johnson', role: 'Editor' },
  { id: 5, name: 'Margaret Hamilton', role: 'Viewer', disabled: true }
];

/**
 * A filterable single-select. The trigger opens a popover with a search field and
 * a keyboard-navigable list (Arrow keys + Enter, Escape closes). Items render with
 * a custom `[xuiSelectOption]` template. `[(value)]` two-way binding.
 */
const meta: Meta<XuiSelect<User>> = {
  title: 'Forms/Select',
  component: XuiSelect,
  decorators: [moduleMetadata({ imports: [XuiSelectImports] })]
};

export default meta;
type Story = StoryObj<XuiSelect<User>>;

export const Default: Story = {
  render: () => ({
    props: { users: USERS, itemText: (u: User) => u.name, selected: null as User | null },
    template: `
      <div class="w-64">
        <xui-select [items]="users" [itemText]="itemText" [(value)]="selected" placeholder="Select a user" />
        <p class="text-foreground-muted mt-3 text-sm">Selected: {{ selected?.name ?? '—' }}</p>
      </div>
    `
  })
};

/** A custom item template showing a secondary label, and a disabled item. */
export const CustomItems: Story = {
  render: () => ({
    props: {
      users: USERS,
      itemText: (u: User) => u.name,
      itemDisabled: (u: User) => !!u.disabled
    },
    template: `
      <div class="w-72">
        <xui-select [items]="users" [itemText]="itemText" [itemDisabled]="itemDisabled" placeholder="Assign to…">
          <ng-template xuiSelectOption let-user let-active="active">
            <div class="flex flex-1 items-center justify-between">
              <span>{{ user.name }}</span>
              <span class="text-foreground-muted text-xs">{{ user.role }}</span>
            </div>
          </ng-template>
        </xui-select>
      </div>
    `
  })
};

/** Non-filterable — just a keyboard-navigable list. */
export const NonFilterable: Story = {
  render: () => ({
    props: { users: USERS.slice(0, 3), itemText: (u: User) => u.name },
    template: `<div class="w-64"><xui-select [items]="users" [itemText]="itemText" [filterable]="false" placeholder="Pick one" /></div>`
  })
};
