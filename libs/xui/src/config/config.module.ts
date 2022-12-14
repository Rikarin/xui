import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigureDirective } from './configure.directive';

@NgModule({
  declarations: [ConfigureDirective],
  exports: [ConfigureDirective],
  imports: [CommonModule]
})
export class XuiConfigModule {}
