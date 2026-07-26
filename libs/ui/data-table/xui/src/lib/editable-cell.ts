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
  output,
  signal,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * An inline-editable cell value. Double-click (or press Enter while focused) to
 * edit; commit with Enter or blur, cancel with Escape. `value` is two-way
 * bindable and `edited` fires with the committed text only when it changed.
 *
 * ```html
 * <ng-template xuiDataCell let-value let-row="row" let-column="column">
 *   <xui-editable-cell [value]="value" (edited)="save(row, column, $event)" />
 * </ng-template>
 * ```
 */
@Component({
  selector: 'xui-editable-cell',
  template: `
    @if (editing()) {
      <input
        #field
        type="text"
        [class]="inputClass()"
        [value]="draft()"
        [attr.placeholder]="placeholder() || null"
        (input)="draft.set($any($event.target).value)"
        (keydown.enter)="commit(); $event.preventDefault(); $event.stopPropagation()"
        (keydown.escape)="cancel(); $event.preventDefault(); $event.stopPropagation()"
        (blur)="commit()"
      />
    } @else {
      <!-- The value span opens the editor on double-click; the host owns keyboard focus. -->
      <span [class]="textClass()" (dblclick)="edit()">{{ display() }}</span>
    }
  `,
  host: {
    '[class]': 'computedClass()',
    '[attr.tabindex]': 'editable() && !editing() ? 0 : null',
    '(keydown.enter)': 'onHostEnter($event)'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiEditableCell {
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** The cell value. Two-way bindable with `[(value)]`. */
  readonly value = model<string>('');
  /** Whether editing is allowed. */
  readonly editable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  /** Placeholder shown in the editor when the value is empty. */
  readonly placeholder = input<string>('');

  /** Emitted with the committed value when it changed. */
  readonly edited = output<string>();
  /** Emitted when editing is cancelled (Escape). */
  readonly cancelled = output<void>();

  protected readonly editing = signal(false);
  protected readonly draft = signal('');
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  protected readonly display = computed(() => this.value() || this.placeholder());

  constructor() {
    // Focus and select the editor once it renders.
    effect(() => {
      if (this.editing()) {
        const el = this.field()?.nativeElement;
        if (el) {
          el.focus();
          el.select();
        }
      }
    });
  }

  /** Enter edit mode (no-op when not editable). */
  edit(): void {
    if (!this.editable() || this.editing()) {
      return;
    }
    this.draft.set(this.value());
    this.editing.set(true);
  }

  protected onHostEnter(event: Event): void {
    // Ignore the Enter that just committed the editor (it bubbles up already handled).
    if (!this.editing() && !event.defaultPrevented) {
      this.edit();
      event.preventDefault();
    }
  }

  /** Commit the draft, emitting `edited` if it changed. */
  commit(): void {
    if (!this.editing()) {
      return;
    }
    this.editing.set(false);
    const next = this.draft();
    if (next !== this.value()) {
      this.value.set(next);
      this.edited.emit(next);
    }
  }

  /** Discard the draft and leave edit mode. */
  cancel(): void {
    if (!this.editing()) {
      return;
    }
    this.editing.set(false);
    this.cancelled.emit();
  }

  protected readonly computedClass = computed(() => xui('block h-full w-full', this.class()));
  protected readonly textClass = computed(() =>
    xui('flex h-full w-full cursor-text items-center truncate', !this.value() && 'text-foreground-muted')
  );
  protected readonly inputClass = computed(() =>
    xui('border-primary bg-surface text-foreground -mx-1 h-full w-[calc(100%+0.5rem)] rounded border px-1 outline-none')
  );
}
