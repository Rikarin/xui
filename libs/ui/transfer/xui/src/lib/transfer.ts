import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

export interface XuiTransferItem {
  key: string;
  title: string;
  disabled?: boolean;
}

type Side = 'left' | 'right';

/**
 * A dual list-box that moves items between a source and a target list. `items`
 * is the full set; `targetKeys` (two-way) are the keys on the right. Check items
 * and use the arrow buttons to move them; each side can be searched.
 *
 * ```html
 * <xui-transfer [items]="all" [(targetKeys)]="selected" searchable />
 * ```
 */
@Component({
  selector: 'xui-transfer',
  template: `
    @for (side of SIDES; track side) {
      <div [class]="panelClass()">
        <div class="border-border flex items-center gap-2 border-b px-3 py-2">
          <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
          <span [class]="checkboxClass(allChecked(side))" (click)="toggleAll(side)">
            @if (allChecked(side)) {
              <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none">
                <path
                  d="M20 6 9 17l-5-5"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            } @else if (someChecked(side)) {
              <span class="bg-primary-foreground h-0.5 w-2"></span>
            }
          </span>
          <span class="text-foreground text-sm font-medium">{{ title(side) }}</span>
          <span class="text-foreground-muted ml-auto text-xs">{{ checkedCount(side) }}/{{ list(side).length }}</span>
        </div>

        @if (searchable()) {
          <div class="border-border border-b p-2">
            <input
              [class]="searchClass()"
              [value]="side === 'left' ? searchLeft() : searchRight()"
              (input)="setSearch(side, $any($event.target).value)"
              [attr.placeholder]="'Search'"
              aria-label="Search"
            />
          </div>
        }

        <ul class="min-h-40 flex-1 overflow-auto p-1">
          @for (item of filtered(side); track item.key) {
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <li [class]="itemClass(item)" (click)="toggle(side, item)">
              <span [class]="checkboxClass(checked(side).has(item.key))">
                @if (checked(side).has(item.key)) {
                  <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none">
                    <path
                      d="M20 6 9 17l-5-5"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
              </span>
              <span class="truncate">{{ item.title }}</span>
            </li>
          } @empty {
            <li class="text-foreground-subtle px-2 py-6 text-center text-sm">No items</li>
          }
        </ul>
      </div>

      @if (side === 'left') {
        <div class="flex flex-col justify-center gap-2 px-2">
          <button
            type="button"
            [class]="moveClass()"
            [disabled]="checkedCount('left') === 0"
            (click)="move('right')"
            aria-label="Move right"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            [class]="moveClass()"
            [disabled]="checkedCount('right') === 0"
            (click)="move('left')"
            aria-label="Move left"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      }
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTransfer {
  protected readonly SIDES: Side[] = ['left', 'right'];

  readonly class = input<ClassValue>('');
  readonly items = input<XuiTransferItem[]>([]);
  readonly targetKeys = model<string[]>([]);
  readonly titles = input<[string, string]>(['Source', 'Target']);
  readonly searchable = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  private readonly checkedLeft = signal(new Set<string>());
  private readonly checkedRight = signal(new Set<string>());
  protected readonly searchLeft = signal('');
  protected readonly searchRight = signal('');

  private readonly targetSet = computed(() => new Set(this.targetKeys()));
  protected readonly leftItems = computed(() => this.items().filter(item => !this.targetSet().has(item.key)));
  protected readonly rightItems = computed(() => this.items().filter(item => this.targetSet().has(item.key)));

  protected title(side: Side): string {
    return side === 'left' ? this.titles()[0] : this.titles()[1];
  }
  protected list(side: Side): XuiTransferItem[] {
    return side === 'left' ? this.leftItems() : this.rightItems();
  }
  protected checked(side: Side): Set<string> {
    return side === 'left' ? this.checkedLeft() : this.checkedRight();
  }

  protected filtered(side: Side): XuiTransferItem[] {
    const query = (side === 'left' ? this.searchLeft() : this.searchRight()).toLowerCase().trim();
    const list = this.list(side);
    return query ? list.filter(item => item.title.toLowerCase().includes(query)) : list;
  }

  protected checkedCount(side: Side): number {
    const checked = this.checked(side);
    return this.list(side).filter(item => checked.has(item.key)).length;
  }
  protected allChecked(side: Side): boolean {
    const enabled = this.filtered(side).filter(item => !item.disabled);
    return enabled.length > 0 && enabled.every(item => this.checked(side).has(item.key));
  }
  protected someChecked(side: Side): boolean {
    return this.checkedCount(side) > 0 && !this.allChecked(side);
  }

  protected setSearch(side: Side, value: string): void {
    (side === 'left' ? this.searchLeft : this.searchRight).set(value);
  }

  protected toggle(side: Side, item: XuiTransferItem): void {
    if (item.disabled) {
      return;
    }
    const signalRef = side === 'left' ? this.checkedLeft : this.checkedRight;
    const next = new Set(signalRef());
    if (next.has(item.key)) {
      next.delete(item.key);
    } else {
      next.add(item.key);
    }
    signalRef.set(next);
  }

  protected toggleAll(side: Side): void {
    const signalRef = side === 'left' ? this.checkedLeft : this.checkedRight;
    const enabled = this.filtered(side).filter(item => !item.disabled);
    if (this.allChecked(side)) {
      const next = new Set(signalRef());
      enabled.forEach(item => next.delete(item.key));
      signalRef.set(next);
    } else {
      const next = new Set(signalRef());
      enabled.forEach(item => next.add(item.key));
      signalRef.set(next);
    }
  }

  protected move(to: Side): void {
    if (to === 'right') {
      const moving = this.leftItems().filter(item => !item.disabled && this.checkedLeft().has(item.key));
      this.targetKeys.set([...this.targetKeys(), ...moving.map(item => item.key)]);
      this.checkedLeft.set(new Set());
    } else {
      const movingKeys = new Set(
        this.rightItems()
          .filter(item => !item.disabled && this.checkedRight().has(item.key))
          .map(item => item.key)
      );
      this.targetKeys.set(this.targetKeys().filter(key => !movingKeys.has(key)));
      this.checkedRight.set(new Set());
    }
  }

  protected readonly computedClass = computed(() => xui('flex items-stretch', this.class()));
  protected readonly panelClass = computed(() => xui('border-border bg-surface flex w-56 flex-col rounded-lg border'));
  protected readonly searchClass = computed(() =>
    xui('border-border bg-surface text-foreground h-8 w-full rounded-md border px-2 text-sm outline-none')
  );

  protected checkboxClass(active: boolean): string {
    return xui(
      'flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border',
      active ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
    );
  }
  protected itemClass(item: XuiTransferItem): string {
    return xui(
      'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm select-none',
      item.disabled ? 'text-foreground-subtle cursor-not-allowed' : 'hover:bg-surface-inset'
    );
  }
  protected moveClass(): string {
    return xui(
      'border-border text-foreground hover:bg-surface-inset flex h-8 w-8 items-center justify-center rounded-md border disabled:pointer-events-none disabled:opacity-40'
    );
  }
}
