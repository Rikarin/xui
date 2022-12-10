import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { RouterModule } from '@angular/router';
import { XuiButtonModule, XuiCardModule, XuiIconModule, XuiLayoutModule, XuiPanelBarModule } from 'xui';
import { OverviewComponent } from './overview/overview.component';
import { ThemeSidebarComponent } from './layout/theme-sidebar/theme-sidebar.component';

@NgModule({
  declarations: [LayoutComponent, OverviewComponent, ThemeSidebarComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: LayoutComponent
      }
    ]),
    XuiPanelBarModule,
    XuiLayoutModule,
    XuiButtonModule,
    XuiCardModule,
    XuiIconModule
  ]
})
export class DesignerModule {}
