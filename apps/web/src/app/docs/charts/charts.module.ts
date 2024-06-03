import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AnalysisComponent } from './analysis/analysis.component';
import { XuiAnalysisModule } from '@xui/charts';
import { XuiCardModule } from '@xui/components';
import { HighlightModule } from 'ngx-highlightjs';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';

const routes: Routes = [{ path: 'analysis', component: AnalysisComponent }];

@NgModule({
  declarations: [AnalysisComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    HighlightModule,
    HighlightPlusModule,

    XuiAnalysisModule,
    XuiCardModule
  ]
})
export class ChartsModule {}
