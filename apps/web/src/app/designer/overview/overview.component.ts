import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent {
  buttonColors = ['primary', 'primary-alt', 'secondary', 'info', 'success', 'warning', 'error'];
  buttonTypes = ['normal', 'raised', 'dashed', 'stroked', 'fab'];

  @Input() set selectable(value: boolean) {
    this._selectable = value;
  }

  @HostBinding('class.selectable')
  private _selectable!: boolean;

  edit(component: string) {
    alert('editing ' + component);
    // TODO
  }
}
