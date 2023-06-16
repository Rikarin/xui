import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsageComponent } from './usage/usage.component';
import { InfomationComponent } from './infomation/infomation.component';
import { ExampleComponent } from './example/example.component';
import { XuiCardModule, XuiIconComponent, XuiTabModule, XuiTooltipModule } from 'xui';
import { CdkTableModule } from '@angular/cdk/table';
import { HighlightModule } from 'ngx-highlightjs';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';

@NgModule({
  declarations: [UsageComponent, InfomationComponent, ExampleComponent],
  imports: [
    CommonModule,
    XuiCardModule,
    XuiTabModule,
    XuiIconComponent,
    XuiTooltipModule,
    CdkTableModule,
    HighlightModule,
    HighlightPlusModule
  ],
  exports: [UsageComponent, InfomationComponent, ExampleComponent]
})
export class ComponentsModule {}
