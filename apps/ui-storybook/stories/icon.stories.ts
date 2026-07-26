import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matCheckRound,
  matDeleteRound,
  matFavoriteRound,
  matInfoRound,
  matSearchRound,
  matWarningRound
} from '@ng-icons/material-icons/round';
import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { XuiIcon, XuiIconImports } from '@xui/icon';

/**
 * Sizing and colour for an `@ng-icons` icon — a directive on `<ng-icon>`, so the bare
 * `xui` attribute is what applies the size scale and the semantic colours. An icon is
 * decorative and hidden from assistive technology by default; give it a `label` when
 * it carries meaning on its own.
 */
const meta: Meta<XuiIcon> = {
  title: 'Foundations/Icon',
  component: XuiIcon,
  args: {
    size: 'md',
    color: 'inherit'
  },
  argTypes: {
    size: {
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      control: {
        type: 'select'
      }
    },
    color: {
      options: ['inherit', 'muted', 'subtle', 'primary', 'secondary', 'success', 'error', 'warning', 'info'],
      control: {
        type: 'select'
      }
    }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiIconImports, NgIcon],
      providers: [
        provideIcons({ matCheckRound, matDeleteRound, matFavoriteRound, matInfoRound, matSearchRound, matWarningRound })
      ]
    })
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `<ng-icon xui name="matFavoriteRound" ${argsToTemplate(args)} />`
  })
};

export default meta;
type Story = StoryObj<XuiIcon>;

export const Default: Story = {};

/** The named scale — `xs` 12px, `sm` 16px, `md` 24px, `lg` 32px, `xl` 48px — plus any CSS length. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-end gap-4">
        <ng-icon xui size="xs" name="matFavoriteRound" />
        <ng-icon xui size="sm" name="matFavoriteRound" />
        <ng-icon xui size="md" name="matFavoriteRound" />
        <ng-icon xui size="lg" name="matFavoriteRound" />
        <ng-icon xui size="xl" name="matFavoriteRound" />
        <ng-icon xui size="28px" name="matFavoriteRound" />
      </div>
    `
  })
};

/** `inherit` (the default) follows the surrounding text; the rest are the semantic colours. */
export const Colors: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-4">
        <ng-icon xui name="matFavoriteRound" />
        <ng-icon xui color="muted" name="matFavoriteRound" />
        <ng-icon xui color="subtle" name="matFavoriteRound" />
        <ng-icon xui color="primary" name="matFavoriteRound" />
        <ng-icon xui color="secondary" name="matFavoriteRound" />
        <ng-icon xui color="success" name="matCheckRound" />
        <ng-icon xui color="error" name="matDeleteRound" />
        <ng-icon xui color="warning" name="matWarningRound" />
        <ng-icon xui color="info" name="matInfoRound" />
      </div>
    `
  })
};

/** Every size against every colour. */
export const Matrix: Story = {
  render: () => ({
    props: {
      sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
      colors: ['inherit', 'muted', 'subtle', 'primary', 'secondary', 'success', 'error', 'warning', 'info']
    },
    template: `
      <div class="flex flex-col gap-3">
        @for (color of colors; track color) {
          <div class="flex items-end gap-4">
            <span class="text-foreground-muted w-20 text-xs">{{ color }}</span>
            @for (size of sizes; track size) {
              <ng-icon xui [size]="size" [color]="color" name="matFavoriteRound" />
            }
          </div>
        }
      </div>
    `
  })
};

/**
 * A `label` gives the icon an accessible name: it becomes `role="img"` and is announced
 * instead of being skipped. Use it when the icon carries meaning on its own — a status
 * glyph, an icon-only affordance.
 */
export const AccessibleName: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-4">
        <ng-icon xui color="success" name="matCheckRound" label="Build passed" />
        <ng-icon xui color="error" name="matDeleteRound" label="Delete" />
        <ng-icon xui color="muted" name="matSearchRound" />
        <span class="text-foreground-muted text-sm">— the first two are announced; the last is decorative</span>
      </div>
    `
  })
};
