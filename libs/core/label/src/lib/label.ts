import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Directive, ElementRef, type OnInit, PLATFORM_ID, inject, input, signal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { injectUniqueId } from '@xui/core/a11y';

/**
 * The headless half of a label: a stable id, plus the control's validity and disabled state
 * republished as signals.
 *
 * Mirrors the bound `NgControl`'s `ng-invalid`/`ng-dirty`/`ng-valid`/`ng-touched` onto the host as
 * classes, and observes `data-disabled` so a control that reports disabling through an attribute
 * rather than a form still dims its label. Styling lives in `@xui/label`.
 */
@Directive({
  selector: '[xLabel]',
  host: {
    '[id]': 'id()',
    '[class.ng-invalid]': 'this.ngControl?.invalid || null',
    '[class.ng-dirty]': 'this.ngControl?.dirty || null',
    '[class.ng-valid]': 'this.ngControl?.valid || null',
    '[class.ng-touched]': 'this.ngControl?.touched || null'
  }
})
export class XLabel implements OnInit {
  private changes?: MutationObserver;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly element = inject(ElementRef).nativeElement;
  protected readonly ngControl = inject(NgControl, { optional: true });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.changes?.disconnect());
  }

  /**
   * The label's DOM id, so a control can point `aria-labelledby` at it. Defaults to a generated
   * unique id.
   */
  readonly id = input<string>(injectUniqueId('x-label'));

  private readonly _dataDisabled = signal<boolean | 'auto'>('auto');
  readonly dataDisabled = this._dataDisabled.asReadonly();

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.changes = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((mutation: MutationRecord) => {
        if (mutation.attributeName !== 'data-disabled') return;
        // eslint-disable-next-line
        const state = (mutation.target as any).attributes.getNamedItem(mutation.attributeName)?.value === 'true';
        this._dataDisabled.set(state ?? 'auto');
      });
    });

    this.changes?.observe(this.element, {
      attributes: true,
      attributeFilter: ['data-disabled']
    });
  }
}
