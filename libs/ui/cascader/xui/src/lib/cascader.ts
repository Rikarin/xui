import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { injectXOverlay, type XOverlayRef } from '@xui/core/overlay';
import type { ClassValue } from 'clsx';

export interface XuiCascaderOption {
  value: string;
  label: string;
  children?: XuiCascaderOption[];
  disabled?: boolean;
}

/**
 * A cascading, column-based select. Each level opens the next column of children;
 * choosing a leaf commits the full path. `value` is a two-way bindable array of
 * values from root to leaf.
 *
 * The column panel floats on `@xui/core/overlay`, connected to the trigger, so
 * stacking, Escape and outside-click dismissal behave like every other overlay.
 *
 * ```html
 * <xui-cascader [options]="regions" [(value)]="path" placeholder="Select region" />
 * ```
 */
@Component({
  selector: 'xui-cascader',
  template: `
    <button
      #trigger
      type="button"
      [class]="triggerClass()"
      [disabled]="disabled()"
      (click)="toggle()"
      [attr.aria-expanded]="open()"
    >
      <span [class]="selectedLabels().length ? 'text-foreground truncate' : 'text-foreground-muted'">
        {{ selectedLabels().length ? selectedLabels().join(' / ') : placeholder() }}
      </span>
      <svg viewBox="0 0 24 24" class="text-foreground-muted ms-auto h-4 w-4 shrink-0" fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <ng-template #panel>
      <div [class]="panelClass()">
        @for (column of columns(); track $index; let col = $index) {
          <ul class="border-border max-h-64 min-w-40 overflow-auto border-e last:border-e-0">
            @for (option of column; track option.value) {
              <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
              <li
                role="option"
                [class]="optionClass(option, activePath()[col] === option.value)"
                [attr.aria-selected]="activePath()[col] === option.value"
                (click)="select(col, option)"
              >
                <span class="truncate">{{ option.label }}</span>
                @if (option.children?.length) {
                  <svg viewBox="0 0 24 24" class="ms-auto h-3.5 w-3.5 shrink-0" fill="none">
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
              </li>
            }
          </ul>
        }
      </div>
    </ng-template>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiCascader {
  private readonly overlay = injectXOverlay();
  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  private ref: XOverlayRef | null = null;

  readonly class = input<ClassValue>('');
  readonly options = input<XuiCascaderOption[]>([]);
  readonly value = model<string[]>([]);
  readonly placeholder = input<string>('Select');
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly open = signal(false);
  /** The path currently being navigated (may be deeper than the committed value). */
  protected readonly activePath = signal<string[]>([]);

  /** The columns to render: root options, then children of each active selection. */
  protected readonly columns = computed(() => {
    const result: XuiCascaderOption[][] = [];
    let level: XuiCascaderOption[] = this.options();
    result.push(level);
    for (const value of this.activePath()) {
      const option = level.find(o => o.value === value);
      if (option?.children?.length) {
        level = option.children;
        result.push(level);
      } else {
        break;
      }
    }
    return result;
  });

  protected readonly selectedLabels = computed(() => {
    const labels: string[] = [];
    let level: XuiCascaderOption[] = this.options();
    for (const value of this.value()) {
      const option = level.find(o => o.value === value);
      if (!option) {
        break;
      }
      labels.push(option.label);
      level = option.children ?? [];
    }
    return labels;
  });

  constructor() {
    // The `open` signal is the single source of truth; the overlay follows it.
    effect(() => {
      const open = this.open();

      untracked(() => (open ? this.attach() : this.detach()));
    });
  }

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    if (!this.open()) {
      // Reopen at the committed path.
      this.activePath.set([...this.value()]);
    }
    this.open.update(open => !open);
  }

  protected select(columnIndex: number, option: XuiCascaderOption): void {
    if (option.disabled) {
      return;
    }
    const path = [...this.activePath().slice(0, columnIndex), option.value];
    this.activePath.set(path);
    if (!option.children?.length) {
      this.value.set(path);
      this.open.set(false);
    }
  }

  private attach(): void {
    if (this.ref) {
      return;
    }

    // Outside clicks dismiss through the overlay's own click-phase check, so a
    // press that starts a drag outside still does not close the panel. Focus is
    // never moved into the panel, so nothing is trapped or restored.
    const ref = this.overlay.open(this.panel(), {
      origin: this.trigger().nativeElement,
      placement: 'bottom-start',
      offset: 4,
      restoreFocus: false
    });

    this.ref = ref;

    // The overlay can close itself (Escape, outside click). Fold that back into
    // `open` so the model never lies about what is on screen; a stale ref's late
    // close must not clobber a panel that was reopened in the meantime.
    void ref.closed.then(() => {
      if (this.ref === ref) {
        this.ref = null;
        untracked(() => this.open.set(false));
      }
    });
  }

  private detach(): void {
    // Null synchronously so a reopen in the same tick does not see a stale ref.
    const ref = this.ref;
    this.ref = null;
    ref?.close();
  }

  protected readonly computedClass = computed(() => xui('inline-block', this.class()));
  protected readonly triggerClass = computed(() =>
    xui(
      'border-border bg-surface text-foreground flex h-(--control-height-md) w-full min-w-48 items-center gap-1 rounded-md border px-(--control-padding-md) text-sm outline-none focus-visible:border-primary disabled:opacity-50'
    )
  );
  protected readonly panelClass = computed(() =>
    xui('border-border bg-surface-overlay flex rounded-lg border p-1 shadow-overlay')
  );

  protected optionClass(option: XuiCascaderOption, active: boolean): string {
    return xui(
      'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm select-none',
      option.disabled ? 'text-foreground-subtle cursor-not-allowed' : 'hover:bg-surface-inset',
      active && 'bg-primary/10 text-primary font-medium'
    );
  }
}
