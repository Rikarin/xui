import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecagramExample1Component } from './decagram-example1/decagram-example1.component';
import {
  XuiBadgeComponent,
  XuiBannerComponent,
  XuiButtonModule,
  XuiCardModule,
  XuiCheckboxComponent,
  XuiConfigModule,
  XuiContextMenuModule,
  XuiDatePickerComponent,
  XuiDecagramComponent,
  XuiDividerComponent,
  XuiDrawerModule,
  XuiIconComponent
} from '@xui/components';
import { DecagramExample2Component } from './decagram-example2/decagram-example2.component';
import { BadgeExample1Component } from './badge-example1/badge-example1.component';
import { BadgeExample2Component } from './badge-example2/badge-example2.component';
import { BannerExample1Component } from './banner-example1/banner-example1.component';
import { ButtonExample1Component } from './button-example1/button-example1.component';
import { ButtonExample2Component } from './button-example2/button-example2.component';
import { ButtonExample3Component } from './button-example3/button-example3.component';
import { ButtonExample4Component } from './button-example4/button-example4.component';
import { ButtonExample5Component } from './button-example5/button-example5.component';
import { RouterLink } from '@angular/router';
import { CardExample1Component } from './card-example1/card-example1.component';
import { CheckboxExample1Component } from './checkbox-example1/checkbox-example1.component';
import { CheckboxExample2Component } from './checkbox-example2/checkbox-example2.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ContextMenuExample1Component } from './context-menu-example1/context-menu-example1.component';
import { DatePickerExample1Component } from './date-picker-example1/date-picker-example1.component';
import { DividerExample1Component } from './divider-example1/divider-example1.component';
import { DrawerExample1Component } from './drawer-example1/drawer-example1.component';

@NgModule({
  declarations: [
    DecagramExample1Component,
    DecagramExample2Component,
    BadgeExample1Component,
    BadgeExample2Component,
    BannerExample1Component,
    ButtonExample1Component,
    ButtonExample2Component,
    ButtonExample3Component,
    ButtonExample4Component,
    ButtonExample5Component,
    CardExample1Component,
    CheckboxExample1Component,
    CheckboxExample2Component,
    ContextMenuExample1Component,
    DatePickerExample1Component,
    DividerExample1Component,
    DrawerExample1Component
  ],
  exports: [
    DecagramExample1Component,
    DecagramExample2Component,
    BadgeExample1Component,
    BadgeExample2Component,
    BannerExample1Component,
    ButtonExample1Component,
    ButtonExample2Component,
    ButtonExample3Component,
    ButtonExample4Component,
    ButtonExample5Component,
    CardExample1Component,
    CheckboxExample1Component,
    CheckboxExample2Component,
    ContextMenuExample1Component,
    DatePickerExample1Component,
    DividerExample1Component,
    DrawerExample1Component
  ],
  imports: [
    CommonModule,
    XuiDecagramComponent,
    XuiBadgeComponent,
    XuiConfigModule,
    XuiBannerComponent,
    XuiButtonModule,
    XuiIconComponent,
    RouterLink,
    XuiCardModule,
    XuiCheckboxComponent,
    ReactiveFormsModule,
    XuiContextMenuModule,
    XuiDividerComponent,
    XuiDatePickerComponent,
    XuiDrawerModule
  ]
})
export class ExamplesModule {}
