import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { XuiTableImports } from '@xui/table';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import type { DocsSymbol } from '../core/docs.model';

/**
 * The API of one exported class: what you can put in a template and what it accepts.
 *
 * Variant axes are listed separately from inputs even though every axis is also an input, because
 * the axis is the interesting part — it is the closed set of values the component was designed
 * around, which the input's declared type usually widens away.
 *
 * Two things about the layout, both consequences of `xui-table` being flex rather than a `<table>`:
 * a cell lays its children out in a row, so anything that should stack goes in a single wrapper;
 * and a cell is `flex-none`, so a column that has to absorb the leftover width needs `flex-1`
 * (`grow` alone leaves `flex-shrink: 0`, and a long type name then pushes the row past the table).
 */
@Component({
  selector: 'docs-api-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiTableImports, XuiTagImports, XuiTextImports],
  host: { class: 'block' },
  template: `
    <div class="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h3 xuiHeading [level]="3" class="scroll-mt-24" [id]="'api-' + symbol().name">{{ symbol().name }}</h3>
      <xui-tag minimal [intent]="symbol().kind === 'component' ? 'primary' : 'none'">{{ symbol().kind }}</xui-tag>
      @if (symbol().selector) {
        <code xuiCode class="wrap-anywhere whitespace-normal">{{ symbol().selector }}</code>
      }
    </div>

    @if (symbol().docs; as docs) {
      <p xuiText color="muted" class="mb-4 max-w-prose">{{ docs }}</p>
    }

    @if (symbol().variants.length > 0) {
      <p xuiText weight="medium" size="sm" class="mt-6 mb-2">Variants</p>
      <xui-table bordered compact class="w-full">
        <xui-tr>
          <xui-th class="w-36 min-w-0 shrink">Axis</xui-th>
          <xui-th class="min-w-0 flex-1">Options</xui-th>
          <xui-th class="w-28 min-w-0 shrink">Default</xui-th>
        </xui-tr>
        @for (axis of symbol().variants; track axis.name) {
          <xui-tr>
            <xui-td class="w-36 min-w-0 shrink">
              <code xuiCode class="wrap-anywhere whitespace-normal">{{ axis.name }}</code>
            </xui-td>
            <xui-td class="min-w-0 flex-1">
              <span class="flex w-full flex-wrap gap-1">
                @for (option of axis.options; track option) {
                  <xui-tag minimal>{{ option }}</xui-tag>
                }
              </span>
            </xui-td>
            <xui-td class="w-28 min-w-0 shrink">
              @if (axis.default) {
                <code xuiCode class="wrap-anywhere whitespace-normal">{{ axis.default }}</code>
              } @else {
                <span xuiText color="subtle">—</span>
              }
            </xui-td>
          </xui-tr>
        }
      </xui-table>
    }

    @if (symbol().inputs.length > 0) {
      <p xuiText weight="medium" size="sm" class="mt-6 mb-2">Inputs</p>
      <xui-table bordered compact class="w-full">
        <xui-tr>
          <xui-th class="w-44 min-w-0 shrink">Name</xui-th>
          <xui-th class="min-w-0 flex-1">Type</xui-th>
          <xui-th class="w-44 min-w-0 shrink">Default</xui-th>
        </xui-tr>
        @for (field of symbol().inputs; track field.name) {
          <xui-tr class="items-start">
            <xui-td class="w-44 min-w-0 shrink">
              <span class="flex w-full flex-wrap items-center gap-1">
                <code xuiCode class="wrap-anywhere whitespace-normal">{{ field.name }}</code>
                @if (field.required) {
                  <xui-tag minimal intent="danger">required</xui-tag>
                }
                @if (field.model) {
                  <xui-tag minimal intent="primary">two-way</xui-tag>
                }
              </span>
            </xui-td>
            <xui-td class="min-w-0 flex-1">
              <span class="block w-full min-w-0">
                <code xuiCode class="text-xs wrap-anywhere whitespace-normal">{{ field.type }}</code>
                @if (field.docs; as docs) {
                  <span xuiText color="muted" size="sm" class="mt-1.5 block">{{ docs }}</span>
                }
              </span>
            </xui-td>
            <xui-td class="w-44 min-w-0 shrink">
              @if (field.default) {
                <code xuiCode class="line-clamp-4 text-xs wrap-anywhere whitespace-normal" [title]="field.default">{{
                  field.default
                }}</code>
              } @else {
                <span xuiText color="subtle">—</span>
              }
            </xui-td>
          </xui-tr>
        }
      </xui-table>
    }

    @if (symbol().outputs.length > 0) {
      <p xuiText weight="medium" size="sm" class="mt-6 mb-2">Outputs</p>
      <xui-table bordered compact class="w-full">
        <xui-tr>
          <xui-th class="w-44 min-w-0 shrink">Name</xui-th>
          <xui-th class="min-w-0 flex-1">Type</xui-th>
        </xui-tr>
        @for (event of symbol().outputs; track event.name) {
          <xui-tr class="items-start">
            <xui-td class="w-44 min-w-0 shrink">
              <code xuiCode class="wrap-anywhere whitespace-normal">{{ event.name }}</code>
            </xui-td>
            <xui-td class="min-w-0 flex-1">
              <span class="block w-full min-w-0">
                <code xuiCode class="text-xs wrap-anywhere whitespace-normal">{{ event.type }}</code>
                @if (event.docs; as docs) {
                  <span xuiText color="muted" size="sm" class="mt-1.5 block">{{ docs }}</span>
                }
              </span>
            </xui-td>
          </xui-tr>
        }
      </xui-table>
    }

    @if (symbol().methods.length > 0) {
      <p xuiText weight="medium" size="sm" class="mt-6 mb-2">Methods</p>
      <xui-table bordered compact class="w-full">
        @for (method of symbol().methods; track method.name) {
          <xui-tr class="items-start">
            <xui-td class="min-w-0 flex-1">
              <span class="block w-full min-w-0">
                <code xuiCode class="text-xs wrap-anywhere whitespace-normal">{{ method.signature }}</code>
                @if (method.docs; as docs) {
                  <span xuiText color="muted" size="sm" class="mt-1.5 block">{{ docs }}</span>
                }
              </span>
            </xui-td>
          </xui-tr>
        }
      </xui-table>
    }
  `
})
export class ApiTable {
  readonly symbol = input.required<DocsSymbol>();
}
