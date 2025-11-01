import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, type OnInit, PLATFORM_ID, inject, input, signal } from '@angular/core';
import { NgControl } from '@angular/forms';

let nextId = 0;

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

  readonly id = input<string>(`x-label-${nextId++}`);

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
      childList: true,
      characterData: true
    });
  }
}
