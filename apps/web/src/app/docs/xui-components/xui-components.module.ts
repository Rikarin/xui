import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from './banner/banner.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ButtonComponent } from './button/button.component';
import { CardComponent } from './card/card.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { DecagramComponent } from './decagram/decagram.component';
import { DividerComponent } from './divider/divider.component';
import { IconComponent } from './icon/icon.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { InputComponent } from './input/input.component';
import { LayoutComponent } from './layout/layout.component';
import { ProgressComponent } from './progress/progress.component';
import { RadioListComponent } from './radio-list/radio-list.component';
import { SelectComponent } from './select/select.component';
import { SettingsComponent } from './settings/settings.component';
import { SliderComponent } from './slider/slider.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { StatusComponent } from './status/status.component';
import { TableComponent } from './table/table.component';
import { TabsComponent } from './tabs/tabs.component';
import { TextareaComponent } from './textarea/textarea.component';
import { ToggleComponent } from './toggle/toggle.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { SwitchComponent } from './switch/switch.component';
import { RouterModule, Routes } from '@angular/router';
import { ComponentsModule } from '../components/components.module';

import {
  XuiBannerModule,
  XuiButtonModule,
  XuiCardModule,
  XuiCheckboxModule,
  XuiContextMenuModule,
  XuiDatePickerModule,
  XuiDecagramModule,
  XuiDividerModule,
  XuiIconModule,
  XuiImageUploadModule,
  XuiInputModule,
  XuiLayoutModule,
  XuiMenuModule,
  XuiPanelBarModule,
  XuiPopoverModule,
  XuiProgressModule,
  XuiRadioListModule,
  XuiSelectModule,
  XuiSettingsModule,
  XuiSliderModule,
  XuiSnackbarModule,
  XuiSpinnerModule,
  XuiStatusModule,
  XuiSwitchModule,
  XuiTabModule,
  XuiTextareaModule,
  XuiTimePickerModule,
  XuiToggleModule,
  XuiTooltipModule
} from 'xui';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkMenuModule } from '@angular/cdk/menu';
import { ReactiveFormsModule } from '@angular/forms';
import { ExamplesModule } from '../../../examples/examples.module';
import { ComponentsOverviewComponent } from './components-overview/components-overview.component';
import { TypographyComponent } from './typography/typography.component';
import { HighlightModule } from 'ngx-highlightjs';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { PopoverComponent } from './popover/popover.component';
import { PanelbarComponent } from './panelbar/panelbar.component';

const routes: Routes = [
  { path: 'overview', component: ComponentsOverviewComponent },

  { path: 'banner', component: BannerComponent },
  { path: 'breadcrumb', component: BreadcrumbComponent },
  { path: 'button', component: ButtonComponent },
  { path: 'card', component: CardComponent },
  { path: 'checkbox', component: CheckboxComponent },
  { path: 'context-menu', component: ContextMenuComponent },
  { path: 'date-picker', component: DatePickerComponent },
  { path: 'decagram', component: DecagramComponent },
  { path: 'divider', component: DividerComponent },
  { path: 'icon', component: IconComponent },
  { path: 'image-upload', component: ImageUploadComponent },
  { path: 'input', component: InputComponent },
  { path: 'layout', component: LayoutComponent },
  { path: 'panelbar', component: PanelbarComponent },
  { path: 'popover', component: PopoverComponent },
  { path: 'progress', component: ProgressComponent },
  { path: 'radio-list', component: RadioListComponent },
  { path: 'select', component: SelectComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'slider', component: SliderComponent },
  { path: 'snackbar', component: SnackbarComponent },
  { path: 'spinner', component: SpinnerComponent },
  { path: 'status', component: StatusComponent },
  { path: 'switch', component: SwitchComponent },
  { path: 'table', component: TableComponent },
  { path: 'tabs', component: TabsComponent },
  { path: 'textarea', component: TextareaComponent },
  { path: 'time-picker', component: TimePickerComponent },
  { path: 'toggle', component: ToggleComponent },
  { path: 'tooltip', component: TooltipComponent },
  { path: 'typography', component: TypographyComponent }
];

@NgModule({
  declarations: [
    ComponentsOverviewComponent,
    BannerComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    CheckboxComponent,
    ContextMenuComponent,
    DecagramComponent,
    DividerComponent,
    IconComponent,
    ImageUploadComponent,
    InputComponent,
    LayoutComponent,
    ProgressComponent,
    RadioListComponent,
    SelectComponent,
    SettingsComponent,
    SliderComponent,
    SnackbarComponent,
    SpinnerComponent,
    StatusComponent,
    SwitchComponent,
    TableComponent,
    TabsComponent,
    TextareaComponent,
    ToggleComponent,
    TooltipComponent,
    TypographyComponent,
    DatePickerComponent,
    TimePickerComponent,
    PopoverComponent,
    PanelbarComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    ExamplesModule,

    HighlightModule,
    HighlightPlusModule,

    CdkMenuModule,
    CdkTableModule,

    XuiLayoutModule,
    XuiCardModule,
    XuiMenuModule,
    XuiButtonModule,
    XuiBannerModule,
    XuiInputModule,
    XuiIconModule,
    XuiProgressModule,
    XuiSettingsModule,
    XuiTabModule,
    XuiContextMenuModule,
    XuiCheckboxModule,
    XuiSwitchModule,
    XuiImageUploadModule,
    XuiRadioListModule,
    XuiDecagramModule,
    XuiTooltipModule,
    XuiSnackbarModule,
    XuiTextareaModule,
    XuiSelectModule,
    XuiSliderModule,
    XuiSpinnerModule,
    XuiDividerModule,
    XuiToggleModule,
    XuiStatusModule,
    XuiDatePickerModule,
    XuiTimePickerModule,
    XuiPopoverModule,
    XuiPanelBarModule
  ]
})
export class XuiComponentsModule {}
