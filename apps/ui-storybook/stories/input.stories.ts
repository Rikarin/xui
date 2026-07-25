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
    color: 'dark'
  },
  argTypes: {
    color: {
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
        <input xuiInput error="true" type="email" placeholder="Email" value="Foo Bar" ${argsToTemplate(args)} />
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

      <div class="grid w-80 relative mt-4">
        <input xuiInput type="email" placeholder="Email" />
        <button xuiButton class="absolute bottom-1.5 right-1.5 h-8" size="sm" type="button">Search!</button>
      </div>

<!--      <div class="grid w-80 relative mt-4">-->
<!--        <input xuiInput size="lg" type="email" placeholder="Email" />-->
<!--        <button xuiButton class="absolute bottom-1 right-1" size="sm" type="button">Search!</button>-->
<!--      </div>-->

      <div class="grid w-80 relative mt-4">
        <input xuiInput class="pl-22" type="email" placeholder="Email" />
        <button xuiButton class="absolute bottom-1.5 left-1.5" size="sm" type="button">Search!</button>
      </div>

      <div class="grid w-80 relative mt-4">
        <span class="absolute left-2 top-2 font-semibold">https://</span>
        <input xuiInput class="pl-17" type="email" placeholder="Website" />
        <span class="absolute right-2 top-2 font-semibold">.io</span>
      </div>


      <input xuiInput class="mt-4" type="file" placeholder="File" ${argsToTemplate(args)} />
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

/** A deliberate accent border via `intent`, separate from the invalid state. */
export const Intent: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3 w-80">
        <input xuiInput intent="primary" placeholder="Primary" />
        <input xuiInput intent="success" placeholder="Success" />
        <input xuiInput intent="warning" placeholder="Warning" />
        <input xuiInput intent="danger" placeholder="Danger" />
      </div>
    `
  })
};
