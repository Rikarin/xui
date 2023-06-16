import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { RouterModule } from '@angular/router';
import {
  XuiButtonModule,
  XuiCardModule,
  XuiCheckboxComponent,
  XuiDatePickerComponent,
  XuiIconComponent,
  XuiInputModule,
  XuiLayoutModule,
  XuiPanelBarModule,
  XuiPopoverModule,
  XuiSelectModule,
  XuiSliderComponent,
  XuiSwitchComponent,
  XuiTextareaModule
} from 'xui';
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
    XuiIconComponent,
    XuiPopoverModule,
    XuiInputModule,
    XuiCheckboxComponent,
    XuiSliderComponent,
    XuiSwitchComponent,
    XuiTextareaModule,
    XuiDatePickerComponent,
    XuiSelectModule
  ],
  providers: [DesignerService]
})
export class DesignerModule {}
