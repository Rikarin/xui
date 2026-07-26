import { NgIcon, provideIcons } from '@ng-icons/core';
import { matLockRound, matSearchRound } from '@ng-icons/material-icons/round';
import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiIcon } from '@xui/icon';
import { XuiInput, XuiInputImports } from '@xui/input';
import { XuiLabelImports } from '@xui/label';

export default {
  title: 'Forms/Input',
  component: XuiInput,
  tags: ['autodocs'],
  args: {
    surface: 'dark'
  },
  argTypes: {
    surface: {
      options: ['dark', 'light'],
      control: {
        type: 'select'
      }
    }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiInputImports, XuiLabelImports, XuiButtonImports, XuiIcon, NgIcon],
      providers: [provideIcons({ matSearchRound, matLockRound })]
    })
  ]
} as Meta<XuiInput>;

type Story = StoryObj<XuiInput>;

export const Default: Story = {
  render: ({ ...args }) => ({
    props: args,
    template: `
      <label xuiLabel class="grid gap-1.5 w-80">
        E-Mail:
        <input xuiInput [error]="true" type="email" placeholder="Email" value="Foo Bar" ${argsToTemplate(args)} />
      </label>
      <div xuiInputError>Invalid E-mail!</div>

      <label xuiLabel class="grid gap-2 w-80 mt-4">
        Small:
        <input xuiInput size="sm" type="email" placeholder="Email" ${argsToTemplate(args)} />
      </label>

<!--      <label xuiLabel class="grid gap-2 w-80 mt-4">-->
<!--        Large:-->
<!--        <input xuiInput size="lg" type="email" placeholder="Email" />-->
<!--      </label>-->

      <!-- A sm control inside a md one leaves 3px either side, so centring on the axis beats
           guessing an offset — and the button keeps the height its own size step gives it. The
           padding reserves the button's lane, so typed text stops rather than running underneath. -->
      <div class="grid w-80 relative mt-4">
        <input xuiInput class="pr-22" type="email" placeholder="Email" />
        <button xuiButton class="absolute top-1/2 right-1.5 -translate-y-1/2" size="sm" type="button">Search!</button>
      </div>

<!--      <div class="grid w-80 relative mt-4">-->
<!--        <input xuiInput size="lg" type="email" placeholder="Email" />-->
<!--        <button xuiButton class="absolute bottom-1 right-1" size="sm" type="button">Search!</button>-->
<!--      </div>-->

      <div class="grid w-80 relative mt-4">
        <input xuiInput class="pl-22" type="email" placeholder="Email" />
        <button xuiButton class="absolute top-1/2 left-1.5 -translate-y-1/2" size="sm" type="button">Search!</button>
      </div>

      <!-- Same centring for the static affixes, and text-sm so they read at the input's size
           rather than a step larger. -->
      <div class="grid w-80 relative mt-4">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">https://</span>
        <input xuiInput class="pl-17 pr-9" type="email" placeholder="Website" />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold">.io</span>
      </div>
    `
  })
};

/**
 * `xui-input-group` frames an input with leading/trailing elements and reserves
 * the padding so the text never runs underneath them.
 */
export const InputGroup: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-4 w-80">
        <xui-input-group class="w-full">
          <ng-icon xuiInputLeftElement xui name="matSearchRound" />
          <input xuiInput class="w-full" type="search" placeholder="Search…" />
        </xui-input-group>

        <xui-input-group class="w-full">
          <ng-icon xuiInputLeftElement xui name="matLockRound" />
          <input xuiInput class="w-full" type="password" placeholder="Password" />
          <button xuiInputRightElement xuiButton size="sm" variant="ghost" type="button" class="mr-1 h-7">Show</button>
        </xui-input-group>

        <xui-input-group clearable class="w-full">
          <input xuiInput class="w-full" value="Clear me" placeholder="Type to reveal the clear button" />
        </xui-input-group>
      </div>
    `
  })
};

/** A deliberate accent border via `color`, separate from the invalid state. */
export const Color: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3 w-80">
        <input xuiInput color="primary" placeholder="Primary" />
        <input xuiInput color="success" placeholder="Success" />
        <input xuiInput color="warning" placeholder="Warning" />
        <input xuiInput color="error" placeholder="Error" />
      </div>
    `
  })
};
