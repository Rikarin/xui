import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiAnalysisComponent } from './analysis.component';
import { XuiButtonModule, XuiContextMenuModule, XuiIcon, XuiInputModule, XuiTabModule } from '@xui/components';
import { CdkMenuModule } from '@angular/cdk/menu';
import { MetricsComponent } from './metrics/metrics.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ChartComponent } from './chart/chart.component';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  declarations: [XuiAnalysisComponent, MetricsComponent, ChartComponent],
  imports: [
    CommonModule,
    XuiButtonModule,
    XuiIcon,
    XuiContextMenuModule,
    XuiTabModule,
    XuiInputModule,
    CdkMenuModule,
    DragDropModule,
    NgxEchartsModule.forChild()
  ],
  exports: [XuiAnalysisComponent]
})
export class XuiAnalysisModule {}
