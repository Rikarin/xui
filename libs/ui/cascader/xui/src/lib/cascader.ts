import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
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
 * ```html
 * <xui-cascader [options]="regions" [(value)]="path" placeholder="Select region" />
 * ```
 */
@Component({
  selector: 'xui-cascader',
  template: `
    <button
      type="button"
      [class]="triggerClass()"
      [disabled]="disabled()"
      (click)="toggle()"
      [attr.aria-expanded]="open()"
    >
      <span [class]="selectedLabels().length ? 'text-foreground truncate' : 'text-foreground-muted'">
        {{ selectedLabels().length ? selectedLabels().join(' / ') : placeholder() }}
      </span>
      <svg viewBox="0 0 24 24" class="text-foreground-muted ml-auto h-4 w-4 shrink-0" fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    @if (open()) {
      <div [class]="panelClass()">
        @for (column of columns(); track $index; let col = $index) {
          <ul class="border-border max-h-64 min-w-40 overflow-auto border-r last:border-r-0">
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
                  <svg viewBox="0 0 24 24" class="ml-auto h-3.5 w-3.5 shrink-0" fill="none">
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
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiCascader {
  private readonly el = inject(ElementRef).nativeElement as HTMLElement;
  private readonly document = this.el.ownerDocument;

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
    const onDocClick = (event: MouseEvent): void => {
      if (this.open() && !this.el.contains(event.target as Node)) {
        this.open.set(false);
      }
    };
    this.document.addEventListener('click', onDocClick, true);
    inject(DestroyRef).onDestroy(() => this.document.removeEventListener('click', onDocClick, true));
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

  protected readonly computedClass = computed(() => xui('relative inline-block', this.class()));
  protected readonly triggerClass = computed(() =>
    xui(
      'border-border bg-surface text-foreground flex h-9 w-full min-w-48 items-center gap-1 rounded-md border px-2.5 text-sm outline-none focus-visible:border-primary disabled:opacity-50'
    )
  );
  protected readonly panelClass = computed(() =>
    xui('border-border bg-surface-overlay absolute z-50 mt-1 flex rounded-lg border p-1 shadow-lg')
  );

  protected optionClass(option: XuiCascaderOption, active: boolean): string {
    return xui(
      'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm select-none',
      option.disabled ? 'text-foreground-subtle cursor-not-allowed' : 'hover:bg-surface-inset',
      active && 'bg-primary/10 text-primary font-medium'
    );
  }
}
