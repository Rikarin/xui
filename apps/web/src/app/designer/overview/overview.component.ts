import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.selectable]': 'this.selectable'
  }
})
export class OverviewComponent {
  buttonColors = ['primary', 'primary-alt', 'secondary', 'info', 'success', 'warning', 'error'];
  buttonTypes = ['normal', 'raised', 'dashed', 'stroked', 'fab'];

  @Input() selectable = false;

  edit(component: string) {}
}
