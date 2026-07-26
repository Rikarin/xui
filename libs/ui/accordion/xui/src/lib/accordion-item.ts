import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matExpandMoreRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import { XuiAccordion } from './accordion';

/**
 * One section of an {@link XuiAccordion}. `value` identifies it within the group;
 * `title` is the header label (or project `[xuiAccordionTitle]` for rich content).
 * The body is the default projected content.
 */
@Component({
  selector: 'xui-accordion-item',
  template: `
    <h3 class="flex">
      <button
        type="button"
        [class]="triggerClass()"
        [disabled]="disabled()"
        [attr.aria-expanded]="open()"
        (click)="toggle()"
      >
        <span class="flex-1 text-start">{{ title() }}<ng-content select="[xuiAccordionTitle]" /></span>
        <ng-icon
          xui
          size="sm"
          color="muted"
          name="matExpandMoreRound"
          class="duration-base shrink-0 transition-transform"
          [class.rotate-180]="open()"
        />
      </button>
    </h3>

    <div [class]="regionClass()" role="region" [attr.aria-hidden]="!open()">
      <div class="min-h-0 overflow-hidden">
        <div class="text-foreground-muted px-4 pt-0 pb-4 text-sm">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  host: {
    class: 'block'
  },
  imports: [NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matExpandMoreRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiAccordionItem {
  private readonly accordion = inject(XuiAccordion);

  readonly value = input.required<string>();
  readonly title = input<string>('');
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly open = computed(() => this.accordion.isExpanded(this.value()));

  protected toggle(): void {
    if (!this.disabled()) {
      this.accordion.toggle(this.value());
    }
  }

  protected readonly triggerClass = computed(() =>
    xui(
      'text-foreground hover:bg-surface-inset flex flex-1 items-center gap-2 px-4 py-3 text-sm font-medium outline-none disabled:opacity-50',
      'focus-visible:ring-focus focus-visible:ring-2 focus-visible:ring-inset'
    )
  );

  // A grid collapsing from 1fr → 0fr animates the height without measuring it.
  protected readonly regionClass = computed(() =>
    xui('grid transition-[grid-template-rows] duration-base', this.open() ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')
  );
}
