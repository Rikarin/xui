import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { RouterModule } from '@angular/router';
import {
  XuiButtonModule,
  XuiCardModule,
  XuiCheckbox,
  XuiDatePicker,
  XuiIcon,
  XuiInputModule,
  XuiLayoutModule,
  XuiPanelBarModule,
  XuiPopoverModule,
  XuiSelectModule,
  XuiSlider,
  XuiSwitch,
  XuiTextarea
} from '@xui/components';
import { OverviewComponent } from './overview/overview.component';
import { ThemeSidebarComponent } from './layout/theme-sidebar/theme-sidebar.component';
import { DesignerService } from './designer.service';

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
    XuiIcon,
    XuiPopoverModule,
    XuiInputModule,
    XuiCheckbox,
    XuiSlider,
    XuiSwitch,
    XuiTextarea,
    XuiDatePicker,
    XuiSelectModule
  ],
  providers: [DesignerService]
})
export class DesignerModule {}
