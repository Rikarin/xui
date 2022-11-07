import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { RadioListService } from './radio-list.service';
import { map } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InputBoolean } from '../utils';

@UntilDestroy()
@Component({
  selector: 'xui-radio-option',
  exportAs: 'xuiRadioOption',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<xui-icon>{{ icon }}</xui-icon>
    <div>
      <ng-content></ng-content>
      <div class="xui-radio-option-description">
        <ng-content select="[xuiDescription]"></ng-content>
      </div>
    </div> `,
  host: {
    '[class]': 'style',
    '(click)': 'click()'
  }
})
export class XuiRadioOptionComponent implements OnInit {
  @Input() color?: string;
  @Input() value!: string;
  @Input() description?: string;
  @Input() @InputBoolean() disabled = false;

  private _isActive = false;
  private isActive$ = this.radioListService.selected$.pipe(map(x => x === this.value));

  get icon() {
    return this._isActive ? 'radiobox-marked' : 'radiobox-blank';
  }

  get style() {
    return `${this.color ? 'xui-radio-option-border-' + this.color : ''}
      ${this._isActive ? 'xui-radio-option-active' : ''}
      ${this.disabled ? 'xui-radio-option-disabled' : ''}
    `;
  }

  constructor(private radioListService: RadioListService, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isActive$.pipe(untilDestroyed(this)).subscribe(isActive => {
      this._isActive = isActive;
      this.changeDetectorRef.markForCheck();
    });
  }

  click() {
    if (!this.disabled) {
      this.radioListService.select(this.value);
    }
  }
}
