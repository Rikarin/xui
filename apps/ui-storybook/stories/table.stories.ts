import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, TrackByFunction } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { XuiButtonDirective } from '@xui/button';
import { PaginatorState, useXColumnManager, XTableModule } from '@xui/core/table';
import { XuiInputModule } from '@xui/input';
import { XuiTableComponent, XuiTableModule } from '@xui/table';

const createUsers = (numUsers = 5) => {
  return Array.from({ length: numUsers }, () => ({
    name: faker.person.fullName(),
    gender: faker.vehicle.type(),
    weight: faker.number.int({ min: 65, max: 80 })
  }));
};

export default {
  title: 'Table',
  component: XuiTableComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [XuiTableModule]
    })
  ]
} as Meta<XuiTableComponent>;

type Story = StoryObj<XuiTableComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <xui-table class="w-80">
        <xui-caption>List of users</xui-caption>
        <xui-tr>
          <xui-th class="grow">Name</xui-th>
          <xui-th>Gender</xui-th>
          <xui-th>Weight</xui-th>
        </xui-tr>
        <xui-tr>
          <xui-td class="grow">John</xui-td>
          <xui-td>Male</xui-td>
          <xui-td>70kg</xui-td>
        </xui-tr>
        <xui-tr data-state="selected">
          <xui-td class="grow">John</xui-td>
          <xui-td>Male</xui-td>
          <xui-td>70kg</xui-td>
        </xui-tr>
        <xui-tr>
          <xui-td class="grow">John</xui-td>
          <xui-td>Male</xui-td>
          <xui-td>70kg</xui-td>
        </xui-tr>
      </xui-table>
		`
  })
};

@Component({
  selector: 'table-story',
  imports: [XuiTableModule, XTableModule, XuiButtonDirective, XuiInputModule, NgForOf, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <x-table
      xui
      stickyHeader
      [dataSource]="users()"
      [displayedColumns]="columns.displayedColumns()"
      [trackBy]="trackBy"
    >
      <x-column-def name="name" class="w-40">
        <xui-th *xHeaderDef>Name</xui-th>
        <xui-td truncate *xCellDef="let user">{{ user.name }}</xui-td>
      </x-column-def>
      <x-column-def name="gender" class="w-40 justify-center">
        <xui-th *xHeaderDef>Gender</xui-th>
        <xui-td truncate *xCellDef="let user">{{ user.gender }}</xui-td>
      </x-column-def>
      <x-column-def name="weight">
        <xui-th *xHeaderDef>Weight</xui-th>
        <xui-td *xCellDef="let user">{{ user.weight }}</xui-td>
      </x-column-def>
    </x-table>
    <div
      class="mt-2 flex items-center justify-between"
      *xPaginator="let ctx; totalElements: totalElements(); pageSize: pageSize(); onStateChange: onStateChange"
    >
      <span class="text-sm tabular-nums">
        Showing entries {{ ctx.state().startIndex + 1 }} - {{ ctx.state().endIndex + 1 }} of {{ totalElements() }}
      </span>
      <div class="flex">
        <select
          [ngModel]="pageSize()"
          (ngModelChange)="pageSize.set($event)"
          xuiInput
          size="sm"
          class="mr-1 inline-flex pr-8"
        >
          <option [value]="size" *ngFor="let size of availablePageSizes">{{ size === 10000 ? 'All' : size }}</option>
        </select>

        <div class="flex space-x-1">
          <button size="sm" variant="outline" xuiButton [disabled]="!ctx.decrementable()" (click)="ctx.decrement()">
            Previous
          </button>
          <button size="sm" variant="outline" xuiButton [disabled]="!ctx.incrementable()" (click)="ctx.increment()">
            Next
          </button>
        </div>
      </div>
    </div>
  `
})
export class TableStory {
  protected readonly availablePageSizes = [10, 20, 50, 100, 10000];

  readonly users = signal(createUsers(50));
  readonly totalElements = signal(50);
  readonly pageSize = signal(10);

  readonly columns = useXColumnManager({
    name: { visible: true, label: 'Name' },
    gender: { visible: true, label: 'Gender' },
    weight: { visible: true, label: 'Weight' }
  });

  protected readonly trackBy: TrackByFunction<{ name: string }> = (_index: number, user: { name: string }) => user.name;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected readonly onStateChange = (state: PaginatorState) => {
    // this._startEndIndex.set({ start: state.startIndex, end: state.endIndex });
  };
}

export const CDKTable: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [TableStory]
    },
    template: '<table-story />'
  })
};
