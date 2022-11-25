import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsageComponent } from './usage/usage.component';
import { InfomationComponent } from './infomation/infomation.component';
import { ExampleComponent } from './example/example.component';
import { XuiCardModule, XuiIconModule, XuiTabModule } from 'xui';
import { CdkTableModule } from '@angular/cdk/table';

@NgModule({
  declarations: [UsageComponent, InfomationComponent, ExampleComponent],
  imports: [CommonModule, XuiCardModule, XuiTabModule, XuiIconModule, CdkTableModule],
  exports: [UsageComponent, InfomationComponent, ExampleComponent]
})
export class ComponentsModule {}
