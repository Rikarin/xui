import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsageComponent } from './usage/usage.component';
import { InfomationComponent } from './infomation/infomation.component';
import { ExampleComponent } from './example/example.component';
import { XuiCardModule, XuiIcon, XuiTabModule, XuiTooltipModule } from '@xui/components';
import { CdkTableModule } from '@angular/cdk/table';
import { HighlightModule } from 'ngx-highlightjs';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@NgModule({
  declarations: [UsageComponent, InfomationComponent, ExampleComponent],
  imports: [
    CommonModule,
    XuiCardModule,
    XuiTabModule,
    XuiIcon,
    XuiTooltipModule,
    CdkTableModule,
    HighlightModule,
    HighlightPlusModule,
    HighlightLineNumbers
  ],
  exports: [UsageComponent, InfomationComponent, ExampleComponent]
})
export class ComponentsModule {}
