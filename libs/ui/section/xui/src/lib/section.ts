import type { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matExpandMoreRound } from '@ng-icons/material-icons/round';
import { XuiCollapseImports } from '@xui/collapse';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { XuiIcon } from '@xui/icon';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiSectionConfig } from './section.token';

export const sectionVariants = cva('bg-surface-raised border-border block overflow-hidden rounded-lg border', {
  variants: {
    elevation: {
      0: 'shadow-elevation-0',
      1: 'shadow-elevation-1'
    }
  },
  defaultVariants: {
    elevation: 0
  }
});

export type XuiSectionVariants = VariantProps<typeof sectionVariants>;

/**
 * A titled container for a group of related content.
 *
 * ```html
 * <xui-section title="Details" subtitle="Everything about this record" collapsible>
 *   <button xuiButton right-element size="sm">Edit</button>
 *   <div xuiSectionCard>…</div>
 * </xui-section>
 * ```
 *
 * When `collapsible`, the header becomes a button wired to the panel with
 * `aria-expanded`/`aria-controls`, so the disclosure is operable by keyboard and
 * announced correctly. `open` is a model, so it works both uncontrolled and
 * bound.
 *
 * The projected body goes through a single `ng-template` rendered into one of
 * two places. Putting an `ng-content` in each branch instead would not work:
 * projection slots are static, so only the first would ever receive content.
 */
@Component({
  selector: 'xui-section',
  imports: [NgIcon, NgTemplateOutlet, XuiIcon, XuiCollapseImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ matExpandMoreRound })],
  template: `
    @if (title()) {
      <div [class]="computedHeaderClass()">
        @if (collapsible()) {
          <button
            type="button"
            class="-m-1 flex min-w-0 flex-1 items-center gap-2 rounded p-1 text-start focus-visible:outline-5 focus-visible:outline-offset-2"
            [attr.aria-expanded]="open()"
            [attr.aria-controls]="panelId"
            (click)="open.set(!open())"
          >
            <ng-icon
              xui
              size="sm"
              name="matExpandMoreRound"
              class="text-foreground-muted shrink-0 transition-transform duration-200"
              [class.-rotate-90]="!open()"
            />
            <ng-container *ngTemplateOutlet="titleBlock" />
          </button>
        } @else {
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <ng-container *ngTemplateOutlet="titleBlock" />
          </div>
        }

        <div class="flex shrink-0 items-center gap-2 empty:hidden">
          <ng-content select="[right-element]" />
        </div>
      </div>
    }

    <ng-template #titleBlock>
      <span class="flex min-w-0 flex-col">
        <span class="text-foreground truncate font-semibold">{{ title() }}</span>
        @if (subtitle()) {
          <span class="text-foreground-muted truncate text-sm">{{ subtitle() }}</span>
        }
      </span>
    </ng-template>

    <!-- Body: rendered through one template, see the note on the class. -->
    <ng-template #body><ng-content /></ng-template>

    @if (collapsible()) {
      <xui-collapse [id]="panelId" [open]="open()">
        <ng-container *ngTemplateOutlet="body" />
      </xui-collapse>
    } @else {
      <ng-container *ngTemplateOutlet="body" />
    }
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiSection {
  protected readonly panelId = uniqueId('xui-section-panel');
  private readonly config = injectXuiSectionConfig();

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  readonly elevation = input<XuiSectionVariants['elevation']>(this.config.elevation);

  /** The header only renders when there is a title. */
  readonly title = input<string | null>(null);
  readonly subtitle = input<string | null>(null);

  readonly collapsible = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Reduce the header padding. */
  readonly compact = input<boolean, BooleanInput>(this.config.compact, { transform: booleanAttribute });

  /** Open state of a collapsible section. Works bound or unbound. */
  readonly open = model(true);

  protected readonly computedClass = computed(() =>
    xui(sectionVariants({ elevation: this.elevation() }), this.class())
  );

  protected readonly computedHeaderClass = computed(() =>
    xui('border-border flex items-center gap-2 border-b', this.compact() ? 'px-3 py-2' : 'px-4 py-3')
  );
}

/**
 * A padded content panel inside a section.
 *
 * A section can hold several, separated by hairlines — which is how a section
 * splits into rows without each one needing its own frame.
 */
@Component({
  selector: 'xui-section-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiSectionCard {
  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');

  /** Turn off the internal padding for content that supplies its own. */
  readonly padded = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui('border-border block border-b last:border-b-0', this.padded() && 'p-4', this.class())
  );
}
