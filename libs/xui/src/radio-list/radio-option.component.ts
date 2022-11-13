import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { RadioListService } from './radio-list.service';
import { map } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InputBoolean } from '../utils';

@UntilDestroy()
@Component({
  selector: 'xui-radio-option',
  exportAs: 'xuiRadioOption',
  styleUrls: ['radio-list-options.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngClass]="styles" [tabIndex]="disabled ? -1 : 0">
    <xui-icon>{{ icon }}</xui-icon>
    <div>
      <ng-content></ng-content>
      <div class="radio-option-description">
        <ng-content select="[xuiDescription]"></ng-content>
      </div>
    </div>
  </div>`
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

  get styles() {
    const ret: any = {
      'radio-option': true,
      'radio-option-active': this._isActive,
      'radio-option-disabled': this.disabled
    };

    ret[`radio-option-color-${this.color}`] = this.color;
    return ret;
  }

  constructor(private radioListService: RadioListService, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isActive$.pipe(untilDestroyed(this)).subscribe(isActive => {
      this._isActive = isActive;
      this.changeDetectorRef.markForCheck();
    });
  }

  @HostListener('click')
  click() {
    if (!this.disabled) {
      this.radioListService.select(this.value);
    }
  }
}
