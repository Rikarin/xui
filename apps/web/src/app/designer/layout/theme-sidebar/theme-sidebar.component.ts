import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DesignerService } from '../../designer.service';

@Component({
  selector: 'app-theme-sidebar',
  templateUrl: './theme-sidebar.component.html',
  styleUrls: ['./theme-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeSidebarComponent {
  colors = [
    {
      name: 'primary',
      color: '#1f75cb'
    },
    {
      name: 'primary-alt',
      color: '#7b58cf'
    },
    {
      name: 'secondary',
      color: '#ab6100'
    },
    {
      name: 'info',
      color: '#1f75cb'
    },
    {
      name: 'success',
      color: '#108548'
    },
    {
      name: 'warning',
      color: '#ab6100'
    },
    {
      name: 'error',
      color: '#dd2b0e'
    }
  ];

  constructor(private designerService: DesignerService) {
    designerService.set();
  }
}
