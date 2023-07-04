import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DockerManagerComponent } from './docker-manager.component';

@NgModule({
  imports: [CommonModule],
  declarations: [DockerManagerComponent],
  exports: [DockerManagerComponent]
})
export class XuiDockerManagerModule {}
