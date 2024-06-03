import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiDockerManager } from './docker-manager';

@NgModule({
  imports: [CommonModule],
  declarations: [XuiDockerManager],
  exports: [XuiDockerManager]
})
export class XuiDockerManagerModule {}
