import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  Inject,
  input,
  ViewChild
} from '@angular/core';
import { XUI_SELECT_ACCESSOR, SelectAccessor, SelectValue } from './select.types';

@Component({
  selector: 'xui-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span #content><ng-content /></span>
    <xui-decagram *ngIf="_isSelected()" type="circle" icon="check"></xui-decagram>`,
  host: {
    class: 'x-select-option',
    '[class]': '"x-select-option-" + _select.color',
    '[class.x-select-option-selected]': '_isSelected()',
    '[class.x-select-option-disabled]': 'disabled()',
    '(click)': '_click()'
  }
})
export class XuiOption implements AfterViewInit {
  value = input<SelectValue>(null);
  disabled = input(false, { transform: booleanAttribute });

  @ViewChild('content') private contentRef!: ElementRef;

  _isSelected = computed(() => this._select.value() == this.value());

  private get viewValue(): string {
    return (this.contentRef.nativeElement.textContent || '').trim();
  }

  constructor(@Inject(XUI_SELECT_ACCESSOR) public _select: SelectAccessor) {}

  ngAfterViewInit() {
    if (this._isSelected()) {
      this._select._viewValue.set(this.viewValue);
    }
  }

  _click() {
    if (!this.disabled()) {
      this._select.value.set(this.value());
      this._select._viewValue.set(this.viewValue);
      this._select.close();
    }
  }
}
